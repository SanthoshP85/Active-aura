/**
 * Calorie Calculator Utility
 * Calculates BMR, TDEE, and macro recommendations
 */

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor formula
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - Gender: 'male' or 'female'
 * @returns {number} BMR in calories
 */
const calculateBMR = (weight, height, age, gender) => {
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - Activity level
 * @returns {number} TDEE in calories
 */
const calculateTDEE = (bmr, activityLevel) => {
  const activityFactors = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  return Math.round(bmr * (activityFactors[activityLevel] || 1.55));
};

/**
 * Calculate macro targets based on goal and TDEE
 * @param {number} tdee - Total Daily Energy Expenditure
 * @param {string} goalType - Type of fitness goal
 * @returns {object} Macro targets
 */
const calculateMacroTargets = (tdee, goalType) => {
  const macros = {
    weight_loss: {
      // 30% protein, 40% carbs, 30% fat - higher protein for satiety
      proteinPercentage: 0.3,
      carbsPercentage: 0.4,
      fatsPercentage: 0.3,
    },
    muscle_gain: {
      // 30% protein, 45% carbs, 25% fat - high protein for muscle synthesis
      proteinPercentage: 0.3,
      carbsPercentage: 0.45,
      fatsPercentage: 0.25,
    },
    endurance: {
      // 20% protein, 55% carbs, 25% fat - high carbs for energy
      proteinPercentage: 0.2,
      carbsPercentage: 0.55,
      fatsPercentage: 0.25,
    },
    flexibility: {
      // 25% protein, 50% carbs, 25% fat - balanced
      proteinPercentage: 0.25,
      carbsPercentage: 0.5,
      fatsPercentage: 0.25,
    },
    general_health: {
      // 25% protein, 45% carbs, 30% fat - balanced
      proteinPercentage: 0.25,
      carbsPercentage: 0.45,
      fatsPercentage: 0.3,
    },
  };

  const distribution = macros[goalType] || macros.general_health;

  return {
    protein: Math.round((tdee * distribution.proteinPercentage) / 4), // 4 cal/gram
    carbs: Math.round((tdee * distribution.carbsPercentage) / 4), // 4 cal/gram
    fats: Math.round((tdee * distribution.fatsPercentage) / 9), // 9 cal/gram
  };
};

/**
 * Calculate calorie deficit/surplus for weight change goal
 * @param {number} currentWeight - Current weight in kg
 * @param {number} goalWeight - Goal weight in kg
 * @param {number} timeline - Timeline in weeks
 * @returns {object} Weight loss rate and daily calorie adjustment
 */
const calculateCalorieAdjustment = (currentWeight, goalWeight, timeline) => {
  const weightDifference = Math.abs(goalWeight - currentWeight);
  const weeklyChange = weightDifference / timeline;

  // 0.5 kg per week = ~500 cal/day deficit, 1 kg per week = ~1000 cal/day deficit
  const dailyAdjustment = Math.round((weeklyChange * 7000) / 7); // 7000 cal = 1kg body weight

  return {
    totalWeightChange: weightDifference,
    weeklyWeightChange: weeklyChange.toFixed(2),
    dailyCalorieAdjustment:
      goalWeight < currentWeight ? -dailyAdjustment : dailyAdjustment,
  };
};

module.exports = {
  calculateBMR,
  calculateTDEE,
  calculateMacroTargets,
  calculateCalorieAdjustment,
};
