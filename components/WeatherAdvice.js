"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS,
  LineElement, BarElement, ArcElement,
  CategoryScale, LinearScale, PointElement, Tooltip, Legend
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

ChartJS.register(LineElement, BarElement, ArcElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

/** --- Helpers --- */
ChartJS.defaults.color = "#f9fafb";  // text (axes, labels)
ChartJS.defaults.borderColor = "rgba(255,255,255,0.15)"; // grid lines
ChartJS.defaults.plugins.legend.labels.color = "#f9fafb"; // legend


const AQI_LEVELS = [
  { max: 50,  name: "Good",             color: "#16a34a" },
  { max: 100, name: "Moderate",         color: "#f59e0b" },
  { max: 150, name: "Unhealthy (SG)",   color: "#f97316" },
  { max: 200, name: "Unhealthy",        color: "#ef4444" },
  { max: 300, name: "Very Unhealthy",   color: "#8b5cf6" },
  { max: 500, name: "Hazardous",        color: "#7f1d1d" },
];

function aqiBand(aqi) {
  return AQI_LEVELS.find(b => aqi <= b.max) || AQI_LEVELS[AQI_LEVELS.length - 1];
}

/** EPA AQI from PM2.5 / PM10 (approx.) */
function aqiFromPM25(c) {
  if (c == null) return 0;
  const bp = [
    { hi: 12,    Il: 0,   Ih: 50,  Cl: 0.0,  Ch: 12.0 },
    { hi: 35.4,  Il: 51,  Ih: 100, Cl: 12.1, Ch: 35.4 },
    { hi: 55.4,  Il: 101, Ih: 150, Cl: 35.5, Ch: 55.4 },
    { hi: 150.4, Il: 151, Ih: 200, Cl: 55.5, Ch: 150.4 },
    { hi: 250.4, Il: 201, Ih: 300, Cl: 150.5, Ch: 250.4 },
    { hi: 350.4, Il: 301, Ih: 400, Cl: 250.5, Ch: 350.4 },
    { hi: 500.4, Il: 401, Ih: 500, Cl: 350.5, Ch: 500.4 },
  ];
  const seg = bp.find(b => c <= b.hi) || bp[bp.length - 1];
  const aqi = (seg.Ih - seg.Il) / (seg.Ch - seg.Cl) * (c - seg.Cl) + seg.Il;
  return Math.round(aqi);
}

function aqiFromPM10(c) {
  if (c == null) return 0;
  const bp = [
    { hi: 54,    Il: 0,   Ih: 50,  Cl: 0,   Ch: 54 },
    { hi: 154,   Il: 51,  Ih: 100, Cl: 55,  Ch: 154 },
    { hi: 254,   Il: 101, Ih: 150, Cl: 155, Ch: 254 },
    { hi: 354,   Il: 151, Ih: 200, Cl: 255, Ch: 354 },
    { hi: 424,   Il: 201, Ih: 300, Cl: 355, Ch: 424 },
    { hi: 504,   Il: 301, Ih: 400, Cl: 425, Ch: 504 },
    { hi: 604,   Il: 401, Ih: 500, Cl: 505, Ch: 604 },
  ];
  const seg = bp.find(b => c <= b.hi) || bp[bp.length - 1];
  const aqi = (seg.Ih - seg.Il) / (seg.Ch - seg.Cl) * (c - seg.Cl) + seg.Il;
  return Math.round(aqi);
}

export default function AirHealthAdvisor() {
  const [loading, setLoading] = useState(true);
  const [geoAllowed, setGeoAllowed] = useState(true);
  const [error, setError] = useState("");
  const [dataset, setDataset] = useState(null); // normalized data

  useEffect(() => {
    const getData = async () => {
      try {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 15000 }
          );
        }).then(async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;

          // 1) Current weather + hourly for next 24h
          // Open-Meteo: current_weather plus hourly temp, humidity, wind
          const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
            `&current_weather=true&hourly=temperature_2m,relativehumidity_2m,winddirection_10m,windspeed_10m&forecast_days=2&timezone=auto`;

          // 2) Air quality: hourly pm2_5 & pm10
          const airUrl =
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
            `&hourly=pm2_5,pm10&timezone=auto`;

          const [wRes, aRes] = await Promise.all([fetch(weatherUrl), fetch(airUrl)]);
          if (!wRes.ok || !aRes.ok) throw new Error("Failed to fetch from Open-Meteo");

          const weather = await wRes.json();
          const air = await aRes.json();

          // Normalize weather
          const cw = weather.current_weather || {};
          const hourly = weather.hourly || {};
          const nowIndex = 0; // hour 0 of arrays is current/next hour (Open-Meteo returns arrays starting at "hourly.time[0]")

          // Normalize AQ
          const aqh = air.hourly || {};
          // Use current (index 0) and arrays for trend/forecast
          const pm25Now = aqh.pm2_5?.[nowIndex] ?? null;
          const pm10Now = aqh.pm10?.[nowIndex] ?? null;

          const aqiPM25 = aqiFromPM25(pm25Now);
          const aqiPM10 = aqiFromPM10(pm10Now);
          const aqi = Math.max(aqiPM25, aqiPM10);

          // Build pollutant “contribution” pie (we only have pm2_5 and pm10 from this API call)
          const pollutants = {
            pm2_5: { value: pm25Now, unit: "µg/m³", aqi: aqiPM25, aqiContribution: 0 },
            pm10:  { value: pm10Now,  unit: "µg/m³", aqi: aqiPM10, aqiContribution: 0 },
          };
          const sum = (pm25Now || 0) + (pm10Now || 0);
          if (sum > 0) {
            pollutants.pm2_5.aqiContribution = Math.round(((pm25Now || 0) / sum) * 100);
            pollutants.pm10.aqiContribution  = Math.round(((pm10Now  || 0) / sum) * 100);
          }

          // Trend: last 24 hours (if available in arrays)
          const labels = (aqh.time || []).slice(0, 24).map(t => new Date(t).toLocaleTimeString([], { hour: "2-digit" }));
          const values = (aqh.pm2_5 || []).slice(0, 24).map(v => aqiFromPM25(v));
          // Forecast (next 24h) → from weather hours 0..23, reusing pm2_5 if present
          const fLabels = (hourly.time || []).slice(0, 24).map(t => new Date(t).toLocaleTimeString([], { hour: "2-digit" }));
          const fValues = (aqh.pm2_5 || []).slice(0, 24).map(v => aqiFromPM25(v));

          setDataset({
            location: { name: `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}` },
            weather: {
              tempC: cw.temperature,
              windKph: cw.windspeed ? Math.round(cw.windspeed * 3.6) : null, // (if m/s → km/h; OM already returns km/h for current_weather)
              windDeg: cw.winddirection,
              humidity: hourly.relativehumidity_2m?.[nowIndex] ?? null,
            },
            aqi,
            pollutants,
            trend: { labels, values },
            forecast: { labels: fLabels, values: fValues },
          });
          setLoading(false);
        });
      } catch (err) {
        console.error(err);
        setGeoAllowed(false);
        setError("Location permission denied or data unavailable.");
        setLoading(false);
      }
    };
    getData();
  }, []);

  const aqi = dataset?.aqi ?? 0;
  const band = aqiBand(aqi);
  const w = dataset?.weather || {};
  const pm25 = dataset?.pollutants?.pm2_5?.value ?? null;
  const pm10 = dataset?.pollutants?.pm10?.value ?? null;

  // Animated gauge %. AQI 0..500 → 0..100%
  const aqiPercent = Math.min(100, Math.max(0, (aqi / 500) * 100));

  const lineData = useMemo(() => ({
    labels: dataset?.trend?.labels ?? [],
    datasets: [{
      label: "AQI (last 24h, from PM2.5)",
      data: dataset?.trend?.values ?? [],
      tension: 0.35,
      borderWidth: 2,
      pointRadius: 0,
        borderColor: "#14b8a6",                  // UPDATED 🎨 teal line
      backgroundColor: "rgba(20,184,166,0.25)", // UPDATED 🎨 soft teal fill
    }]
  }), [dataset]);

  const barData = useMemo(() => ({
    labels: dataset?.forecast?.labels ?? [],
    datasets: [{
      label: "Forecast AQI (next 24h, PM2.5-based)",
      data: dataset?.forecast?.values ?? [],
      borderWidth: 1,
        borderColor: "#14b8a6",                  // UPDATED 🎨 teal line
      backgroundColor: "rgba(20,184,166,0.25)", // UPDATED 🎨 soft teal fill
    }]
  }), [dataset]);

  const pieData = useMemo(() => ({
    labels: ["PM2.5", "PM10"],
    datasets: [{
      data: [
        dataset?.pollutants?.pm2_5?.aqiContribution ?? 0,
        dataset?.pollutants?.pm10?.aqiContribution ?? 0
      ]
    }]
  }), [dataset]);

  const advice = useMemo(() => {
    const list = [];
    if (aqi <= 50) list.push("Air quality is good. Outdoor activities are safe.");
    if (aqi > 50 && aqi <= 100) list.push("Sensitive groups should limit prolonged outdoor exertion.");
    if (aqi > 100 && aqi <= 150) list.push("Consider N95 mask outdoors. Reduce long outdoor workouts.");
    if (aqi > 150 && aqi <= 200) list.push("Avoid outdoor exercise; keep windows closed; use HEPA air purifier.");
    if (aqi > 200) list.push("Stay indoors if possible. Use N95/N99 mask when going out.");
    if (w.humidity >= 75) list.push("High humidity can worsen perceived pollution—hydrate well.");
    if ((w.windKph ?? 0) < 5) list.push("Low wind → stagnation; pollution may linger longer.");

    // PM specific
    if ((pm25 ?? 0) > 35) list.push("PM2.5 elevated—risk to lungs. Consider indoor activities.");
    if ((pm10 ?? 0) > 150) list.push("PM10 is high—dust exposure likely. Keep masks handy.");
    return list;
  }, [aqi, w.humidity, w.windKph, pm25, pm10]);

  if (loading) {
    return (
      <div className="aqi-wrap">
        <div className="aqi-panel skeleton">
          <div className="loader" />
          <div>Fetching location & air quality…</div>
        </div>
      </div>
    );
  }

  if (!geoAllowed || error) {
    return (
      <div className="aqi-wrap">
        <div className="aqi-panel error">
          <div>⚠️ {error || "Location access required for local AQI."}</div>
          <div className="muted">Enable location and reload.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="aqi-wrap">
      {/* Header */}
      <div className="aqi-header">
        <div className="brand">
          <img src="/appLogo.jpeg" alt="Healieve" />
          <div className="brand-text">Healieve • Air Health Advisor</div>
        </div>
        <div className="muted">{dataset?.location?.name || "Your Area"}</div>
      </div>

      {/* Top: Gauge + Weather */}
      <div className="grid top">
        {/* AQI Gauge */}
        <div className="aqi-panel">
          <div className="panel-title">Air Quality Index</div>
          <div className="gauge-wrap">
            <motion.div
              className="gauge"
              style={{ ["--p"]: `${aqiPercent}%`, ["--g"]: band.color }}
              transition={{ duration: 0.8 }}
            >
              <div className="gauge-center">
                <motion.div
                  key={aqi}
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.35 }}
                  className="aqi-value"
                >
                  {Math.round(aqi)}
                </motion.div>
                <div className="aqi-band" style={{ color: band.color }}>{band.name}</div>
              </div>
            </motion.div>
            <div className="aqi-legend">
              {AQI_LEVELS.map((b) => (
                <div className="chip" style={{ background: b.color }} key={b.max}>{b.name}</div>
              ))}
            </div>
          </div>

          <div className="facts">
            <div className="fact">
              <div className="fact-key">PM2.5</div>
              <div className="fact-val">{pm25 ?? "—"} µg/m³</div>
            </div>
            <div className="fact">
              <div className="fact-key">PM10</div>
              <div className="fact-val">{pm10 ?? "—"} µg/m³</div>
            </div>
          </div>
        </div>

        {/* Weather */}
        <div className="aqi-panel">
          <div className="panel-title">Weather Now</div>
          <div className="weather-grid">
            {/* Thermometer */}
            <div className="thermo-card">
              <div className="thermo">
                <motion.div
                  className="thermo-fill"
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.min(100, Math.max(0, (Number(w.tempC ?? 0) + 10) * 2))}%` }} /* -10..40C -> 0..100% */
                  transition={{ duration: 0.8 }}
                />
              </div>
              <div className="thermo-value">{w.tempC ?? "—"}°C</div>
            </div>

            {/* Humidity */}
            <div className="hum-card">
              <div className="hum-label">Humidity</div>
              <div className="hum-value">{w.humidity ?? "—"}%</div>
              <div className="bar">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, w.humidity ?? 0))}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>

            {/* Wind */}
            <div className="wind-card">
              <div className="wind-scene">
                <div className="gust g1" />
                <div className="gust g2" />
                <div className="gust g3" />
                <div className="compass">
                  <motion.div
                    className="needle"
                    animate={{ rotate: w.windDeg ?? 0 }}
                    transition={{ type: "spring", stiffness: 120, damping: 12 }}
                  />
                </div>
              </div>
              <div className="wind-value">{w.windKph ?? "—"} km/h</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pollutant pie + Trends */}
      <div className="grid charts">
        <div className="aqi-panel " id="aqi-spacing">
          <div className="panel-title">Pollutant Contribution</div>
          <Pie data={pieData} />
        </div>

        <div className="aqi-panel ">
          <div className="panel-title">AQI Trend (last 24h)</div>
          <Line data={lineData} options={{
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
          }} />
        </div>

        <div className="aqi-panel ">
          <div className="panel-title">AQI Forecast (next 24h)</div>
          <Bar data={barData} options={{
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
          }} />
        </div>
      </div>

      {/* Advice */}
      <div className="aqi-panel">
        <div className="panel-title">Health Recommendations</div>
        <ul className="advice-list">
          <AnimatePresence>
            {advice.map((a, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {a}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}
