/**
 * Helper Functions
 * Miscellaneous utility functions
 */

/**
 * Calculate BMI
 */
export const calculateBMI = (weight, height) => {
  // height in cm, weight in kg
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

/**
 * Get BMI category
 */
export const getBMICategory = (bmi) => {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal weight";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

/**
 * Calculate calorie deficit needed for weight loss
 * Assumes 7700 kcal = 1 kg weight loss
 */
export const calculateDailyDeficitNeeded = (
  currentWeight,
  goalWeight,
  weeksDuration,
) => {
  const weightToLose = currentWeight - goalWeight;
  const totalDeficitNeeded = weightToLose * 7700;
  const daysTotal = weeksDuration * 7;
  return totalDeficitNeeded / daysTotal;
};

/**
 * Estimate TDEE (Total Daily Energy Expenditure) using Harris-Benedict
 */
export const estimateTDEE = (age, gender, weight, height, activityLevel) => {
  let bmr;

  if (gender === "male") {
    bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));
};

/**
 * Get greeting message based on time
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

/**
 * Chunk array
 */
export const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (current, target) => {
  if (target === 0) return 0;
  const progress = (current / target) * 100;
  return Math.min(Math.round(progress), 100);
};

/**
 * Get color based on value
 */
export const getValueColor = (value, target, threshold = 0.1) => {
  const percentage = value / target;
  if (percentage >= 1 - threshold && percentage <= 1 + threshold)
    return "success";
  if (percentage < 1) return "warning";
  return "danger";
};

/**
 * Debounce function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Get day name from date
 */
export const getDayName = (date) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return days[dateObj.getDay()];
};
