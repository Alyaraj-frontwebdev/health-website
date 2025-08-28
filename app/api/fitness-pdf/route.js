import { fileToDataUrl, qrDataUrl } from "@/utils/fileHelpers";
import { calcBMI, calcBMR, calcTDEE, macroSplit } from "@/utils/healthCalc";
import { marked } from "marked";


const EXPRESS_ENDPOINT = `http://localhost:6001/generate-pdf`;

async function embedExercises(exercises = []) {
  const out = [];
  for (const ex of exercises) {
    const mainImageB64 = ex.mainImage ? await fileToDataUrl(ex.mainImage) : null;
    const steps = [];
    if (Array.isArray(ex.steps)) {
      for (const s of ex.steps) {
        const stepB64 = s.image ? await fileToDataUrl(s.image) : null;
        steps.push({ ...s, imageB64: stepB64 });
      }
    }
    const qrDemo = ex.qrDemo ? await qrDataUrl(ex.qrDemo) : null;
    out.push({ ...ex, mainImageB64, steps, qrDemo });
  }
  return out;
}
export async function POST(req) {
    try {
        const body = await req.json();
        const {
            user = {},
            planMarkdown = "",
            exercises = [],
            charts = {},
            goals = {},
            settings = {},
        } = body;
        const bmi = calcBMI(+user.weight, +user.height);
        const bmr = calcBMR({ gender: user.gender, age: +user.age, heightCm: +user.height, weightKg: +user.weight });
        const tdee = calcTDEE(bmr, user.activityLevel);
        const kcalTarget = (() => {
            if (!tdee) return null;
            const g = (goals?.mainGoal || "").toLowerCase();
            if (g.includes("loss")) return Math.max(1200, tdee - 500);
            if (g.includes("gain")) return tdee + 300;
            return tdee;
        })();
        const macro = macroSplit(kcalTarget, settings?.macroSplit || { protein: 30, carbs: 45, fats: 25 });

        // Convert markdown plan to HTML
        const planHtml = marked.parse(planMarkdown || "");

        // Embed assets
        const logo = await fileToDataUrl("/appLogo.jpeg");
        const hero = await fileToDataUrl("/fitness-hero.jpg");

        // Charts fallback
        const macrosData = charts.macros || { labels: ["Protein", "Carbs", "Fats"], values: macro ? [macro.percent.protein, macro.percent.carbs, macro.percent.fats] : [30, 45, 25] };
        const weeklyData = charts.weekly || { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], values: [500, 620, 700, 550, 640, 780, 720] };
        const weightTrend = charts.weightTrend || { labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"], values: Array.from({ length: 8 }, (_, i) => Math.max(30, ((+user.weight || 70) - i * 0.6).toFixed(1)).map ? null : []) };

        // Embed exercises images + QR
        const exercisesEmbedded = await embedExercises(exercises);
        // const pdfDoc = await PDFDocument.create();
        // const page = pdfDoc.addPage([600, 800]);
        // const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // // Title
        // page.drawText(user?.name ? `${user.name} • Fitness Report` : "Fitness Report", {
        //     x: 50,
        //     y: 750,
        //     size: 20,
        //     font,
        //     color: rgb(0, 0.53, 0.71),
        // });

        // // Chart
        // if (chartImage) {
        //     const chartBytes = chartImage.split(",")[1];
        //     const chartBuffer = Uint8Array.from(atob(chartBytes), c => c.charCodeAt(0));
        //     const chartEmbed = await pdfDoc.embedPng(chartBuffer);
        //     page.drawImage(chartEmbed, { x: 50, y: 400, width: 500, height: 300 });
        // }

        // // Plan text (simple wrap)
        // const text = planMarkdown || "No plan generated.";
        // const lines = text.split("\n");
        // let y = 380;
        // lines.forEach(line => {
        //     page.drawText(line, { x: 50, y, size: 10, font });
        //     y -= 14;
        // });
        const html = `
    <!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Healieve • Professional Health & Fitness Report</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 24mm 16mm 22mm 16mm; }
  html,body{ margin:0; padding:0; background:#fff; color:#0f172a; font-family:'Inter',system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif; }
  .wrap{ max-width:800px; margin:0 auto; }
  .brandbar{ display:flex; align-items:center; gap:14px; border-radius:12px; background:linear-gradient(135deg,#1e40af,#0ea5e9); color:#fff; padding:12px 14px; margin:0 0 12px; }
  .brandbar img{ height:28px; width:auto; border-radius:6px; }
  .brandbar .title{ font-weight:800; letter-spacing:.3px; }
  .hero{ border-radius:12px; overflow:hidden; position:relative; margin-bottom:12px; }
  .hero img{ width:100%; height:160px; object-fit:cover; opacity:.95; display:block; }
  .card{ background:#fff; border:1px solid #e6eef8; border-radius:12px; padding:14px; margin-bottom:12px; box-shadow:0 2px 8px rgba(10,10,10,0.04); }
  h2.section{ font-size:14px; font-weight:800; margin:0 0 8px; color:#0f172a; }
  .grid{ display:grid; gap:10px; }
  .cols-3{ grid-template-columns:repeat(3,minmax(0,1fr)); }
  .item label{ font-size:11px; color:#64748b; display:block; }
  .item div{ font-size:13px; font-weight:600; }
  .charts{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
  .chart-card{ background:#fff; border-radius:10px; padding:10px; border:1px solid #e6eef8; }
  .chart-box{ width:100%; height:220px; }
  .plan{ font-size:12px; line-height:1.6; color:#0f172a; }
  .exercise-card{ display:flex; gap:12px; margin-bottom:14px; }
  .exercise-left{ width:260px; flex-shrink:0; }
  .exercise-left img{ width:100%; height:170px; object-fit:cover; border-radius:10px; }
  .step-thumb{ width:120px; font-size:11px; }
  .step-thumb img{ width:100%; height:78px; object-fit:cover; border-radius:8px; }
  .wm{ position:fixed; inset:0; pointer-events:none; z-index:0; display:grid; place-items:center; opacity:0.06; font-weight:900; font-size:72px; color:#1e40af; transform:rotate(-30deg);}
  .footer-note{ text-align:center; color:#64748b; font-size:11px; margin-top:6px; }
  .sig{ display:flex; justify-content:space-between; gap:12px; margin-top:12px; }
  .sig .box{ width:48%; border-top:1px solid #e2e8f0; padding-top:8px; font-size:11px; color:#475569; text-align:center; }
</style>
</head>
<body>
  <div class="wm">HEALIEVE</div>
  <div class="wrap">
    <div class="brandbar">
      ${logo ? `<img src="${logo}" alt="Hilly logo" />` : ""}
      <div class="title">Healieve • Professional Health & Fitness Report</div>
      <div style="margin-left:auto; font-size:11px;">${new Date().toLocaleDateString()}</div>
    </div>

    ${hero ? `<div class="hero"><img src="${hero}" alt="Hero" /></div>` : ""}

    <div class="card">
      <h2 class="section">Key Health Metrics</h2>
      <div class="grid cols-3">
        <div class="item"><label>BMI</label><div>${bmi ?? "-"}</div></div>
        <div class="item"><label>BMR (kcal/day)</label><div>${bmr ?? "-"}</div></div>
        <div class="item"><label>TDEE (kcal/day)</label><div>${tdee ?? "-"}</div></div>
      </div>
      <div class="grid cols-3" style="margin-top:8px;">
        <div class="item"><label>Target Calories</label><div>${kcalTarget ?? "-"}</div></div>
        <div class="item"><label>Macro Split (P/C/F)</label><div>${macro ? `${macro.percent.protein}/${macro.percent.carbs}/${macro.percent.fats}%` : "-"}</div></div>
        <div class="item"><label>Activity Level</label><div>${user.activityLevel ?? "-"}</div></div>
      </div>
    </div>

    <div class="card">
      <h2 class="section">Profile</h2>
      <div class="grid cols-3">
        <div class="item"><label>Name</label><div>${user.name ?? "-"}</div></div>
        <div class="item"><label>Age</label><div>${user.age ?? "-"}</div></div>
        <div class="item"><label>Gender</label><div>${user.gender ?? "-"}</div></div>
        <div class="item"><label>Height (cm)</label><div>${user.height ?? "-"}</div></div>
        <div class="item"><label>Weight (kg)</label><div>${user.weight ?? "-"}</div></div>
        <div class="item"><label>Body Type</label><div>${user.bodyType ?? "-"}</div></div>
        <div class="item"><label>Diet</label><div>${user.dietType ?? "-"}</div></div>
        <div class="item"><label>Medical</label><div>${user.medical ?? "-"}</div></div>
        <div class="item"><label>Habits</label><div>${user.habits ?? "-"}</div></div>
      </div>
    </div>

    <div class="card">
      <h2 class="section">Analytics</h2>
      <div class="charts">
        <div class="chart-card">
          <div class="chart-title">Macros Breakdown</div>
          <canvas id="pieChart" class="chart-box"></canvas>
        </div>
        <div class="chart-card">
          <div class="chart-title">Weekly Calories Burned</div>
          <canvas id="barChart" class="chart-box"></canvas>
        </div>
      </div>
      <div style="margin-top:10px;">
        <div class="chart-card">
          <div class="chart-title">Projected Weight Trend</div>
          <canvas id="lineChart" class="chart-box"></canvas>
        </div>
      </div>
    </div>

    <div class="card">
      <h2 class="section">7-Day Fitness & Nutrition Plan</h2>
      <div style="margin-top:8px;" class="plan">${planHtml}</div>
    </div>

    <div class="card">
      <h2 class="section">Exercise Library & Technique</h2>
      ${exercisesEmbedded.map(ex => `
        <div class="exercise-card">
          <div class="exercise-left">
            ${ex.mainImageB64 ? `<img src="${ex.mainImageB64}" alt="${ex.name}" />` : `<div style="height:170px;border-radius:10px;background:#f1f5f9;display:grid;place-items:center;color:#94a3b8">No Image</div>`}
            <div style="display:flex; gap:8px; align-items:center; margin-top:8px;">
              ${ex.qrDemo ? `<img src="${ex.qrDemo}" style="width:58px;height:58px;border-radius:8px;" alt="qr" />` : ""}
              <div>
                <div style="font-weight:700">${ex.name}</div>
                <div style="font-size:11px;color:#64748b">${ex.equipment ?? ''} • ${ex.difficulty ?? ''}</div>
              </div>
            </div>
          </div>

          <div style="flex:1;">
            <div style="display:flex; gap:12px; align-items:flex-start;">
              <div style="flex:1;">
                <div style="font-weight:700; margin-bottom:6px">Technique & Details</div>
                <div style="font-size:12px;color:#0f172a; margin-bottom:6px">
                  Reps: <strong>${ex.reps ?? '-'}</strong> • Tempo: <strong>${ex.tempo ?? '-'}</strong> • Rest: <strong>${ex.rest ?? '-'}</strong>
                </div>
                <div style="font-size:12px; color:#334155;">${ex.description ?? ''}</div>
              </div>

              <div style="width:160px;">
                <div style="font-size:11px;color:#64748b;margin-bottom:6px">Muscles</div>
                <div style="font-weight:700">${(ex.muscles || []).join(", ")}</div>
              </div>
            </div>

            <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
              ${(ex.steps || []).map(s => `
                <div class="step-thumb">
                  ${s.imageB64 ? `<img src="${s.imageB64}" alt="step" />` : `<div style="height:78px;background:#f8fafc;border-radius:8px"></div>`}
                  <div style="margin-top:6px; color:#475569;">${s.caption ?? ''}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `).join('')}
    </div>

  </div>

  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script>
    (function(){
      const MACROS = ${JSON.stringify(macrosData)};
      const WEEKLY = ${JSON.stringify(weeklyData)};
      const TREND = ${JSON.stringify(charts.weightTrend || { labels: [], values: [] })};

      function ready(fn){ document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }
      ready(function(){
        const pie = new Chart(document.getElementById('pieChart').getContext('2d'), {
          type:'pie', data:{ labels: MACROS.labels, datasets:[{ data: MACROS.values }] },
          options:{ animation:false, plugins:{ legend:{ position:'bottom' } } }
        });

        const bar = new Chart(document.getElementById('barChart').getContext('2d'), {
          type:'bar', data:{ labels: WEEKLY.labels, datasets:[{ label:'kcal', data: WEEKLY.values }] },
          options:{ animation:false, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true } } }
        });

        const line = new Chart(document.getElementById('lineChart').getContext('2d'), {
          type:'line', data:{ labels: TREND.labels, datasets:[{ label:'kg', data: TREND.values, tension:0.3, fill:false }] },
          options:{ animation:false, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:false } } }
        });

        window.__chartsReady = true;
      });
    })();
  </script>
</body>
</html>`
        const apiResponse = await fetch(
            EXPRESS_ENDPOINT,
            {
                method: 'POST',
                headers: {
                    'User-Agent': 'undici-stream-example',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ html }),
            }
        );
        const pdfBytes = await apiResponse.arrayBuffer();
        return new Response(Buffer.from(pdfBytes), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "attachment; filename=healieve-health-report.pdf",
            },
        });
    } catch (err) {
        console.error("PDF error", err);
        return new Response(JSON.stringify({ error: "Failed to generate PDF" }), { status: 500 });
    }
}
