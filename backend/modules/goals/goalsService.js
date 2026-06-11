/**
 * Goals Service
 * Handles user fitness goal management
 */

const Goals = require("../../models/Goals");
const User = require("../../models/User");
const {
  calculateBMR,
  calculateTDEE,
  calculateMacroTargets,
  calculateCalorieAdjustment,
} = require("../../utils/calorieCalculator");
const { storeFitnessSummary } = require("../rag/ragService");

/**
 * Service: Create fitness goal
 */
const createGoal = async (userId, goalData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Calculate recommended calories based on goal
  const bmr = calculateBMR(
    user.currentWeight,
    user.height,
    user.age,
    user.gender,
  );
  const tdee = calculateTDEE(bmr, user.activityLevel);

  // Adjust based on goal
  let targetCalories = tdee;
  if (goalData.goalType === "weight_loss") {
    targetCalories = tdee - 500; // 500 calorie deficit
  } else if (goalData.goalType === "muscle_gain") {
    targetCalories = tdee + 300; // 300 calorie surplus
  }

  // Calculate macro targets
  const macros = calculateMacroTargets(targetCalories, goalData.goalType);

  const goal = new Goals({
    userId,
    goalType: goalData.goalType,
    goalWeight: goalData.goalWeight,
    targetCalories: targetCalories || goalData.targetCalories,
    timeline: goalData.timeline,
    targetActivityMinutes: goalData.targetActivityMinutes || 150,
    proteinTarget: macros.protein,
    carbsTarget: macros.carbs,
    fatsTarget: macros.fats,
    endDate: new Date(Date.now() + goalData.timeline * 7 * 24 * 60 * 60 * 1000),
  });

  await goal.save();

  // Store goal in Redis vector DB
  const goalSummary = `Goal: ${goal.goalType}. Target: ${goal.goalType === "weight_loss" ? goal.goalWeight + "kg" : goal.targetCalories + " calories"}. Timeline: ${goal.timeline} weeks. Target activity: ${goal.targetActivityMinutes} minutes. Macros - Protein: ${goal.proteinTarget}g, Carbs: ${goal.carbsTarget}g, Fats: ${goal.fatsTarget}g.`;
  try {
    await storeFitnessSummary(userId, goalSummary, "goal");
    console.log("✅ Goal stored in Redis vector database");
  } catch (error) {
    console.warn("⚠️ Failed to store goal in Redis:", error.message);
  }

  return goal;
};

/**
 * Service: Get active goals
 */
const getActiveGoals = async (userId) => {
  const goals = await Goals.find({
    userId,
    isActive: true,
  });

  return goals;
};

/**
 * Service: Get all goals (including completed)
 */
const getAllGoals = async (userId) => {
  const goals = await Goals.find({ userId }).sort({ createdAt: -1 });
  return goals;
};

/**
 * Service: Get single goal
 */
const getGoal = async (userId, goalId) => {
  const goal = await Goals.findById(goalId);

  if (!goal) {
    throw new Error("Goal not found");
  }

  if (goal.userId.toString() !== userId.toString()) {
    throw new Error("Unauthorized");
  }

  return goal;
};

/**
 * Service: Update goal progress
 */
const updateGoalProgress = async (userId, goalId, currentWeight) => {
  const goal = await Goals.findById(goalId);

  if (!goal) {
    throw new Error("Goal not found");
  }

  if (goal.userId.toString() !== userId.toString()) {
    throw new Error("Unauthorized");
  }

  // Calculate progress percentage
  const startWeight = goal.startDate
    ? (await User.findById(userId)).currentWeight
    : currentWeight;
  const totalWeightChange = Math.abs(goal.goalWeight - startWeight);
  const currentChange = Math.abs(goal.goalWeight - currentWeight);
  const progressPercentage = Math.round(
    (currentChange / totalWeightChange) * 100,
  );

  goal.progressPercentage = Math.min(100, Math.max(0, progressPercentage));

  await goal.save();
  return goal;
};

/**
 * Service: Complete goal
 */
const completeGoal = async (userId, goalId) => {
  const goal = await Goals.findById(goalId);

  if (!goal) {
    throw new Error("Goal not found");
  }

  if (goal.userId.toString() !== userId.toString()) {
    throw new Error("Unauthorized");
  }

  goal.isActive = false;
  goal.progressPercentage = 100;
  await goal.save();

  return goal;
};

/**
 * Service: Delete goal
 */
const deleteGoal = async (userId, goalId) => {
  const goal = await Goals.findById(goalId);

  if (!goal) {
    throw new Error("Goal not found");
  }

  if (goal.userId.toString() !== userId.toString()) {
    throw new Error("Unauthorized");
  }

  await Goals.findByIdAndDelete(goalId);
  return { message: "Goal deleted" };
};

module.exports = {
  createGoal,
  getActiveGoals,
  getAllGoals,
  getGoal,
  updateGoalProgress,
  completeGoal,
  deleteGoal,
};
