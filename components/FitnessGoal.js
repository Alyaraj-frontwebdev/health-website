"use client";
import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { FaDownload, FaWandMagicSparkles } from "react-icons/fa6";
import { calcBMI} from "@/utils/healthCalc";
import { useRef, useEffect } from "react";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement } from "chart.js";
import { Line } from "react-chartjs-2";


ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function FitnessPlanner() {
  const chartRef = useRef(null);
  const [isChartReady, setIsChartReady] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    bodyType: "",
    dietType: "",
    activityLevel: "",
    medical: "",
    habits: "",
    goal: "",
    measurements: { chest: "", waist: "", hips: "", arms: "", thighs: "", neck: "" },
  });
  const bmi = calcBMI(+formData.weight, +formData.height);
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("idle"); // idle | generating | ready | error
  const [downloading, setDownloading] = useState(false);

  // Demo exercises (replace or populate from AI)
  const [exercises] = useState([
  {
    name: "Push-up",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    reps: "3 x 10-12",
    tempo: "2-0-1",
    rest: "60s",
    description: "Keep your core braced; neutral neck.",
    muscles: ["Chest", "Triceps"],
    mainImageB64: "https://yourcdn.com/pushup.jpg",
    qrDemo: "https://www.youtube.com/watch?v=IODxDxX7oi4",
    steps: [
      { caption: "Start in plank", imageB64: "https://yourcdn.com/pushup-step1.jpg" },
      { caption: "Lower chest", imageB64: "https://yourcdn.com/pushup-step2.jpg" },
      { caption: "Press up", imageB64: "https://yourcdn.com/pushup-step3.jpg" }
    ]
  },
  {
    name: "Chin-up",
    equipment: "Pull-up Bar",
    difficulty: "Intermediate",
    reps: "3 x 8-10",
    tempo: "2-0-1",
    rest: "90s",
    description: "Pull with your back, not just arms.",
    muscles: ["Back", "Biceps"],
    mainImageB64: "https://yourcdn.com/chinup.jpg",
    qrDemo: "https://www.youtube.com/watch?v=brhRXlOhsAM",
    steps: [
      { caption: "Grab bar underhand", imageB64: "https://yourcdn.com/chinup-step1.jpg" },
      { caption: "Pull to chin", imageB64: "https://yourcdn.com/chinup-step2.jpg"},
      { caption: "Lower slowly", imageB64: "https://yourcdn.com/chinup-step3.jpg" }
    ]
  },
  {
    name: "Squat",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    reps: "3 x 15-20",
    tempo: "3-1-1",
    rest: "60s",
    description: "Keep chest up and knees aligned with toes.",
    muscles: ["Quads", "Glutes", "Hamstrings"],
    mainImageB64: "https://yourcdn.com/squat.jpg",
    qrDemo: "https://www.youtube.com/watch?v=aclHkVaku9U",
    steps: [
      { caption: "Stand tall", imageB64: "https://yourcdn.com/squat-step1.jpg" },
      { caption: "Lower to 90°", imageB64: "https://yourcdn.com/squat-step2.jpg" },
      { caption: "Push through heels", imageB64: "https://yourcdn.com/squat-step3.jpg" }
    ]
  },
  {
    name: "Plank",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    reps: "3 x 30-60 sec hold",
    tempo: "Static Hold",
    rest: "45s",
    description: "Keep your body in a straight line from head to heels.",
    muscles: ["Core", "Shoulders"],
    mainImageB64: "https://yourcdn.com/plank.jpg",
    qrDemo: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
    steps: [
      { caption: "Forearms on ground", imageB64: "https://yourcdn.com/plank-step1.jpg" },
      { caption: "Engage core", imageB64: "https://yourcdn.com/plank-step2.jpg" }
    ]
  },
  {
    name: "Burpee",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    reps: "3 x 12-15",
    tempo: "Explosive",
    rest: "75s",
    description: "Full-body explosive exercise for conditioning.",
    muscles: ["Full Body", "Cardio"],
    mainImageB64: "https://yourcdn.com/burpee.jpg",
    qrDemo: "https://www.youtube.com/watch?v=TU8QYVW0gDU",
    steps: [
      { caption: "Drop into squat", imageB64: "https://yourcdn.com/burpee-step1.jpg" },
      { caption: "Kick legs back", imageB64: "https://yourcdn.com/burpee-step2.jpg" },
      { caption: "Push-up & jump", imageB64: "https://yourcdn.com/burpee-step3.jpg" }
    ]
  },
  {
    name: "Mountain Climbers",
    equipment: "Bodyweight",
    difficulty: "Intermediate",
    reps: "3 x 30 sec",
    tempo: "Fast",
    rest: "45s",
    description: "Drive knees to chest quickly while keeping core tight.",
    muscles: ["Core", "Cardio"],
    mainImageB64: "https://yourcdn.com/mountainclimbers.jpg",
    qrDemo: "https://www.youtube.com/watch?v=nmwgirgXLYM",
    steps: [
      { caption: "Start in plank", imageB64: "https://yourcdn.com/mountainclimber-step1.jpg" },
      { caption: "Drive knees fast", imageB64: "https://yourcdn.com/mountainclimber-step2.jpg" }
    ]
  },
  {
    name: "Glute Bridge",
    equipment: "Bodyweight",
    difficulty: "Beginner",
    reps: "3 x 12-15",
    tempo: "2-1-2",
    rest: "60s",
    description: "Engage glutes and avoid arching lower back.",
    muscles: ["Glutes", "Hamstrings"],
    mainImageB64: "https://yourcdn.com/glutebridge.jpg",
    qrDemo: "https://www.youtube.com/watch?v=8bbE64NuDTU",
    steps: [
      { caption: "Lie flat on back", imageB64: "https://yourcdn.com/glutebridge-step1.jpg" },
      { caption: "Lift hips up", imageB64: "https://yourcdn.com/glutebridge-step2.jpg" },
      { caption: "Squeeze glutes", imageB64: "https://yourcdn.com/glutebridge-step3.jpg" }
    ]
  }
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("measurements.")) {
      const key = name.split(".")[1];
      setFormData((p) => ({ ...p, measurements: { ...p.measurements, [key]: value } }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const generatePrompt = (d) => `
You are a professional fitness coach. Create a structured, simple 7-day workout and nutrition plan in Markdown.

User:
- Name: ${d.name}
- Age: ${d.age}
- Gender: ${d.gender}
- Height: ${d.height} cm
- Weight: ${d.weight} kg
- Body type: ${d.bodyType}
- Diet: ${d.dietType}
- Activity: ${d.activityLevel}
- Medical: ${d.medical}
- Habits: ${d.habits}
- Goal: ${d.goal}
- Mesurements: ${d.measurements}

Include:
- Daily workouts (sets, reps, tempo)
- Meals by day (breakfast, lunch, dinner, snacks)
- Hydration & recovery tips
- Safety notes
  `;

  const handleGeneratePlan = async (e) => {
    e?.preventDefault?.();
    setStatus("generating");
    try {
      const prompt = generatePrompt(formData);
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setPlan(data.text || "");
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };
const chartData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  datasets: [
    {
      label: "Calories Burned",
      data: [500, 640, 720, 560, 610, 780, 700],
      borderColor: "blue",
      fill: false,
    },
  ],
};
  const canDownload = status === "ready" && !!plan && !downloading;

    useEffect(() => {
    if (chartRef.current) {
      setIsChartReady(true);
    }
  }, [chartRef]);
  const handleDownloadPDF = async () => {
    if (!canDownload) return;
  setDownloading(true);

  if (!chartRef.current) {
    console.error("Chart is not ready yet");
    setDownloading(false);
    return;
  }
    try {
     const chartCanvas = chartRef.current.canvas;
    const chartDataUrl = chartCanvas.toDataURL("image/png");
      const payload = {
        user: {
          name: formData.name || "User",
          age: formData.age,
          gender: formData.gender,
          height: formData.height,
          weight: formData.weight,
          bodyType: formData.bodyType,
          dietType: formData.dietType,
          activityLevel: formData.activityLevel,
          medical: formData.medical,
          habits: formData.habits,
          measurements: formData.measurements,
          goal: formData.goal,
        },
        planMarkdown: plan,
        exercises,
        charts: {
          macros: { labels: ["Protein", "Carbs", "Fats"], values: [30, 45, 25] },
          weekly: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], values: [500, 640, 720, 560, 610, 780, 700] },
          weightTrend: { labels: ["W1","W2","W3","W4","W5","W6","W7","W8"], values: [formData.weight || 70, 69.5, 69.2, 68.8, 68.5, 68.1, 67.8, 67.4] },
        },
        goals: { mainGoal: formData.goal, targetWeight: "", targetTimelineWeeks: 8 },
        settings: { macroSplit: { protein: 30, carbs: 45, fats: 25 } },
      };

      const res = await fetch("/api/fitness-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "healieve-health-report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to create PDF");
    }
    setDownloading(false);
  };

  const measurementInputs = useMemo(
    () =>
      Object.keys(formData.measurements).map((k) => (
        <input
          key={k}
          name={`measurements.${k}`}
          placeholder={k[0].toUpperCase() + k.slice(1)}
          value={formData.measurements[k]}
          onChange={handleChange}
          className="hlv-input"
        />
      )),
    [formData.measurements]
  );

  return (
    <div className="hlv-shell">
      <div className="hlv-panel">
        <div className="hlv-header">
          <div className="hlv-brand">
            <img src="/appLogo.jpeg" alt="Healieve" />
            <div>Healieve • Fitness Planner</div>
          </div>
        </div>

        <form className="hlv-form" onSubmit={handleGeneratePlan}>
          <div className="hlv-row">
            <input name="name" placeholder="Full name" value={formData.name} onChange={handleChange} className="hlv-input" />
            <input name="age" placeholder="Age" value={formData.age} onChange={handleChange} className="hlv-input" />
            <select name="gender" value={formData.gender} onChange={handleChange} className="hlv-input">
              <option value="">Select Gender</option><option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>

          <div className="hlv-row">
            <input name="height" placeholder="Height (cm)" value={formData.height} onChange={handleChange} className="hlv-input" />
            <input name="weight" placeholder="Weight (kg)" value={formData.weight} onChange={handleChange} className="hlv-input" />
            <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="hlv-input">
              <option value="">Select Activity Level</option>
              <option value="Sedentary">Sedentary</option>
              <option value="Light">Light</option>
              <option value="Moderate">Moderate</option>
              <option value="Active">Active</option>
              <option value="Very Active">Very Active</option>
            </select>
          </div>

          <div className="hlv-row">
            <input name="bmi" placeholder="BMI"  value={bmi ?? ""}  onChange={handleChange} className="hlv-input" readOnly/>
            <input name="dietType" placeholder="Diet Type" value={formData.dietType} onChange={handleChange} className="hlv-input" />
            <input name="goal" placeholder="Main goal (e.g., Fat loss)" value={formData.goal} onChange={handleChange} className="hlv-input" />
          </div>

          <div className="hlv-row">
            <input name="medical" placeholder="Medical notes" value={formData.medical} onChange={handleChange} className="hlv-input" />
            <input name="habits" placeholder="Lifestyle / habits" value={formData.habits} onChange={handleChange} className="hlv-input" />
          </div>

          <div className="hlv-measurements">
            <label>Measurements (cm)</label>
            <div className="hlv-grid">{measurementInputs}</div>
          </div>

          <div className="hlv-actions">
            <button type="submit" className="hlv-btn primary" disabled={status === "generating"}>
              <FaWandMagicSparkles /> {status === "generating" ? "Generating..." : "Generate Plan"}
            </button>

            <button
              type="button"
              className={`hlv-btn ${canDownload ? "accent" : "disabled"}`}
              disabled={!canDownload}
              onClick={handleDownloadPDF}
              title={canDownload ? "Download PDF" : "Generate a plan first"}
            >
              <FaDownload /> {downloading ? "Preparing..." : "Download PDF"}
            </button>
          </div>
        </form>
      </div>

      <div className="hlv-preview">
        {status === "idle" && (
          <div className="hlv-empty">Your plan will appear here</div>
        )}

        {status === "generating" && (
          <div className="hlv-empty">
            <div className="hlv-spinner" />
            <div>Your plan is being generated…</div>
          </div>
        )}

        {status === "ready" && !!plan && (
          <div className="hlv-card hlv-plan">
            <h3>Personalized Plan</h3>
            <div className="hlv-plan-content">
              <ReactMarkdown>{plan}</ReactMarkdown>
               <div style={{ maxWidth: "600px", marginTop: "20px" }}>
          <Line ref={chartRef} data={chartData} />
        </div>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="hlv-empty">Something went wrong. Please try again.</div>
        )}
      </div>
    </div>
  );
}
