// utils/healthCalc.js
export function calcBMI(kg, cm) {
  if (!kg || !cm) return null;
  const m = cm / 100;
  return +(kg / (m * m)).toFixed(1);
}

export function calcBMR({ gender, age, heightCm, weightKg }) {
  if (!age || !heightCm || !weightKg) return null;
  const s = (gender || "").toLowerCase() === "female" ? -161 : 5;
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + s);
}

export function activityFactor(level) {
  const map = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    "very active": 1.9,
  };
  return map[(level || "").toLowerCase()] || 1.375;
}

export function calcTDEE(bmr, level) {
  if (!bmr) return null;
  return Math.round(bmr * activityFactor(level));
}

export function macroSplit(targetCalories, split = { protein: 30, carbs: 45, fats: 25 }) {
  if (!targetCalories) return null;
  const pCals = (split.protein / 100) * targetCalories;
  const cCals = (split.carbs / 100) * targetCalories;
  const fCals = (split.fats / 100) * targetCalories;
  return {
    grams: {
      protein: Math.round(pCals / 4),
      carbs: Math.round(cCals / 4),
      fats: Math.round(fCals / 9),
    },
    percent: split,
  };
}
