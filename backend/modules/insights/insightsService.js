/**
 * Insights Engine Service
 * Rule-based insights generation with LLM explanations
 * All insights are grounded in user-provided data
 * Includes rate limiting and HuggingFace AI integration
 */

const User = require("../../models/User");
const Goals = require("../../models/Goals");
const CaloriesTracker = require("../../models/CaloriesTracker");
const Activities = require("../../models/Activities");
const { callLLM } = require("../../utils/llmService");
const { callLLMWithRateLimit } = require("../../utils/llmRateLimiter");
const hfService = require("../../utils/huggingFaceService");

/**
 * Detect calorie surplus/deficit
 */
const analyzeCalorieTrend = async (userId, days = 7) => {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const trackers = await CaloriesTracker.find({
    userId,
    date: { $gte: startDate },
  });

  if (trackers.length === 0) {
    return null;
  }

  const user = await User.findById(userId);
  const goal = await Goals.findOne({ userId, isActive: true });

  const avgCalories =
    trackers.reduce((sum, t) => sum + t.totalCalories, 0) / trackers.length;
  const targetCalories = goal?.targetCalories || 2000;
  const difference = avgCalories - targetCalories;

  let insight = {
    type: "calorie_trend",
    severity: "info",
    title: "Calorie Pattern",
    data: {
      avgCalories: Math.round(avgCalories),
      targetCalories: Math.round(targetCalories),
      difference: Math.round(difference),
      trend: difference > 0 ? "surplus" : "deficit",
    },
    recommendation: "",
  };

  if (Math.abs(difference) > 500) {
    insight.severity = difference > 0 ? "warning" : "success";

    if (difference > 500) {
      insight.title = "⚠️ Calorie Surplus Detected";
    } else if (difference < -500) {
      insight.title = "✅ Calorie Deficit Achieved";
    }

    // Generate personalized recommendation using HuggingFace AI
    try {
      const userData = {
        name: user.fullName,
        age: user.age,
        currentWeight: user.currentWeight,
        goalWeight: user.goalWeight,
        activityLevel: user.activityLevel,
        goalType: goal?.goalType || "general fitness",
        avgCalories: Math.round(avgCalories),
        targetCalories: Math.round(targetCalories),
        difference: Math.abs(Math.round(difference)),
        trend: difference > 0 ? "surplus" : "deficit",
      };

      const llmResponse = await hfService.generateInsight(
        "calorie_trend",
        userData,
      );

      if (llmResponse && llmResponse.trim()) {
        insight.recommendation = llmResponse;
      } else {
        // Fallback
        insight.recommendation =
          difference > 500
            ? `You're consuming ${Math.abs(Math.round(difference))} more calories than target. Consider reducing portion sizes or increasing exercise.`
            : `You're maintaining a good deficit of ${Math.abs(Math.round(difference))} calories daily. Keep up this pace for steady, healthy weight loss.`;
      }
    } catch (error) {
      console.warn(
        "⚠️ Failed to generate HuggingFace insight for calorie trend:",
        error.message,
      );
      // Fallback to basic recommendation
      insight.recommendation =
        difference > 500
          ? `You're consuming ${Math.abs(Math.round(difference))} more calories than target. Consider reducing portion sizes or increasing exercise.`
          : `You're maintaining a good deficit of ${Math.abs(Math.round(difference))} calories daily. Keep up this pace for steady, healthy weight loss.`;
    }
  }

  return insight;
};

/**
 * Detect weight plateau
 */
const analyzeWeightPlateau = async (userId, days = 30) => {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  // Mock weight history - in production, query actual weight tracking collection
  const user = await User.findById(userId);
  const goal = await Goals.findOne({ userId, isActive: true });

  // Generate personalized recommendation using HuggingFace AI
  let recommendation =
    "Continue with your current routine. Weight fluctuations are normal.";
  try {
    const userData = {
      name: user.fullName,
      age: user.age,
      currentWeight: user.currentWeight,
      goalWeight: user.goalWeight,
      height: user.height,
      gender: user.gender,
      activityLevel: user.activityLevel,
      goalType: goal?.goalType || "general fitness",
      goalTimeline: goal?.timeline || "not set",
    };

    recommendation = await hfService.generateInsight(
      "weight_plateau",
      userData,
    );
  } catch (error) {
    console.warn(
      "⚠️ Failed to generate HuggingFace insight for weight plateau:",
      error.message,
    );
  }

  return {
    type: "weight_plateau",
    severity: "info",
    title: "Weight Trend",
    data: {
      currentWeight: user.currentWeight,
      goalWeight: user.goalWeight,
      plateau: false, // Replace with actual calculation
    },
    recommendation,
  };
};

/**
 * Detect overtraining
 */
const analyzeOvertraining = async (userId, days = 7) => {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const activities = await Activities.find({
    userId,
    date: { $gte: startDate },
  });

  if (activities.length === 0) {
    return null;
  }

  const totalMinutes = activities.reduce((sum, a) => sum + a.duration, 0);
  const totalCaloriesBurned = activities.reduce(
    (sum, a) => sum + a.caloriesBurned,
    0,
  );
  const highIntensityCount = activities.filter(
    (a) => a.intensity === "high" || a.intensity === "very_high",
  ).length;

  let insight = {
    type: "overtraining",
    severity: "info",
    title: "Activity Summary",
    data: {
      totalMinutes,
      totalCaloriesBurned: Math.round(totalCaloriesBurned),
      workoutCount: activities.length,
      highIntensityCount,
    },
    recommendation:
      "Good activity level! Remember to include rest days for recovery.",
  };

  // Flag potential overtraining
  if (totalMinutes > 300 && highIntensityCount > 4) {
    insight.severity = "warning";
    insight.title = "⚠️ Potential Overtraining";
    insight.recommendation = `You logged ${totalMinutes} minutes with ${highIntensityCount} high-intensity sessions this week.
      Consider adding more low-intensity activities and ensure adequate rest days (at least 1-2 per week).`;
  } else if (totalMinutes < 150 && activities.length > 0) {
    insight.severity = "info";
    insight.recommendation = `You're below the recommended 150 minutes of activity per week. 
      Try to gradually increase your exercise frequency.`;
  }

  return insight;
};

/**
 * Calculate goal progress percentage
 */
const analyzeGoalProgress = async (userId) => {
  const goal = await Goals.findOne({ userId, isActive: true });

  if (!goal) {
    return null;
  }

  const user = await User.findById(userId);
  const weightDifference = Math.abs(user.goalWeight - user.currentWeight);
  const initialDifference =
    Math.abs(goal.goalWeight - user.currentWeight) + weightDifference;
  const progressPercentage = Math.round(
    (weightDifference / initialDifference) * 100,
  );

  let recommendation = `You're ${Math.min(100, progressPercentage)}% of the way to your ${goal.goalType} goal. Keep up the great work!`;

  // Generate personalized recommendation using HuggingFace AI
  try {
    const userData = {
      name: user.fullName,
      age: user.age,
      currentWeight: user.currentWeight,
      goalWeight: goal.goalWeight,
      goalType: goal.goalType,
      timeline: goal.timeline,
      targetCalories: goal.targetCalories,
      targetActivityMinutes: goal.targetActivityMinutes,
      progressPercentage: Math.min(100, progressPercentage),
      remainingWeight: Math.abs(goal.goalWeight - user.currentWeight),
    };

    recommendation = await hfService.generateInsight("goal_progress", userData);
  } catch (error) {
    console.warn(
      "⚠️ Failed to generate HuggingFace insight for goal progress:",
      error.message,
    );
  }

  let severity = "info";
  let title = "🎯 Goal Progress";

  if (progressPercentage > 75) {
    severity = "success";
    title = "🎉 Almost There!";
  } else if (progressPercentage > 50) {
    severity = "success";
    title = "👏 Excellent Progress";
  }

  let insight = {
    type: "goal_progress",
    severity,
    title,
    data: {
      goalType: goal.goalType,
      currentWeight: user.currentWeight,
      goalWeight: goal.goalWeight,
      progressPercentage: Math.min(100, progressPercentage),
      remainingWeight: Math.abs(goal.goalWeight - user.currentWeight),
      timeline: `${goal.timeline} weeks`,
    },
    recommendation,
  };

  return insight;
};

/**
 * Analyze macro distribution
 */
const analyzeMacroDistribution = async (userId, days = 7) => {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const trackers = await CaloriesTracker.find({
    userId,
    date: { $gte: startDate },
  });

  if (trackers.length === 0) {
    return null;
  }

  const avgProtein =
    trackers.reduce((sum, t) => sum + t.totalProtein, 0) / trackers.length;
  const avgCarbs =
    trackers.reduce((sum, t) => sum + t.totalCarbs, 0) / trackers.length;
  const avgFats =
    trackers.reduce((sum, t) => sum + t.totalFats, 0) / trackers.length;

  const goal = await Goals.findOne({ userId, isActive: true });

  let insight = {
    type: "macro_distribution",
    severity: "info",
    title: "Macro Breakdown",
    data: {
      avgProtein: Math.round(avgProtein),
      avgCarbs: Math.round(avgCarbs),
      avgFats: Math.round(avgFats),
      proteinPercentage: Math.round(
        ((avgProtein * 4) / (avgProtein * 4 + avgCarbs * 4 + avgFats * 9)) *
          100,
      ),
    },
    recommendation:
      "Your macro distribution looks balanced. Keep logging consistently!",
  };

  if (
    goal?.goalType === "muscle_gain" &&
    avgProtein < goal.proteinTarget * 0.8
  ) {
    insight.severity = "warning";
    insight.recommendation = `For muscle gain, aim for ${goal.proteinTarget}g protein daily. 
      You're averaging ${Math.round(avgProtein)}g - increase protein intake for better muscle synthesis.`;
  }

  return insight;
};

/**
 * Generate all insights for user
 */
const generateAllInsights = async (userId) => {
  try {
    const insights = [];

    const calorieInsight = await analyzeCalorieTrend(userId);
    if (calorieInsight) insights.push(calorieInsight);

    const plateauInsight = await analyzeWeightPlateau(userId);
    if (plateauInsight) insights.push(plateauInsight);

    const overtrainingInsight = await analyzeOvertraining(userId);
    if (overtrainingInsight) insights.push(overtrainingInsight);

    const goalInsight = await analyzeGoalProgress(userId);
    if (goalInsight) insights.push(goalInsight);

    const macroInsight = await analyzeMacroDistribution(userId);
    if (macroInsight) insights.push(macroInsight);

    return {
      userId,
      generatedAt: new Date(),
      insights,
    };
  } catch (error) {
    console.error("Error generating insights:", error.message);
    return { userId, insights: [] };
  }
};

module.exports = {
  analyzeCalorieTrend,
  analyzeWeightPlateau,
  analyzeOvertraining,
  analyzeGoalProgress,
  analyzeMacroDistribution,
  generateAllInsights,
};
