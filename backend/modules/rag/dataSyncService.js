/**
 * Data Sync Service
 * Syncs existing MongoDB data to Redis vectors on startup
 */

const User = require("../../models/User");
const CaloriesTracker = require("../../models/CaloriesTracker");
const Activities = require("../../models/Activities");
const Goals = require("../../models/Goals");
const FoodsLogged = require("../../models/FoodsLogged");
const { storeFitnessSummary } = require("./ragService");

/**
 * Sync all existing user profiles to Redis vectors
 */
const syncUserProfilesToRedis = async () => {
  try {
    console.log("🔄 Syncing user profiles to Redis...");
    const users = await User.find({});

    let synced = 0;
    for (const user of users) {
      const profileSummary = `User Profile: ${user.fullName}, ${user.age} years old, ${user.height}cm tall, ${user.currentWeight}kg current weight, goal weight ${user.goalWeight}kg. Gender: ${user.gender}. Activity level: ${user.activityLevel}. Fitness goals: ${user.fitnessGoals.join(", ")}`;

      try {
        await storeFitnessSummary(user._id, profileSummary, "profile");
        synced++;
      } catch (error) {
        console.warn(
          `⚠️ Failed to sync profile for user ${user._id}:`,
          error.message,
        );
      }
    }
    console.log(`✅ Synced ${synced}/${users.length} user profiles to Redis`);
    return synced;
  } catch (error) {
    console.error("❌ Error syncing user profiles:", error.message);
    return 0;
  }
};

/**
 * Sync all existing calorie logs to Redis vectors
 */
const syncCalorieLogsToRedis = async () => {
  try {
    console.log("🔄 Syncing calorie logs to Redis...");
    const foods = await FoodsLogged.find({});

    let synced = 0;
    for (const food of foods) {
      const foodSummary = `Logged food: ${food.foodName} (${food.calories} cal). Macros: ${food.protein}g protein, ${food.carbs}g carbs, ${food.fats}g fat.`;

      try {
        await storeFitnessSummary(food.userId, foodSummary, "food");
        synced++;
      } catch (error) {
        console.warn(`⚠️ Failed to sync food log ${food._id}:`, error.message);
      }
    }
    console.log(`✅ Synced ${synced}/${foods.length} calorie logs to Redis`);
    return synced;
  } catch (error) {
    console.error("❌ Error syncing calorie logs:", error.message);
    return 0;
  }
};

/**
 * Sync all existing activities to Redis vectors
 */
const syncActivitiesToRedis = async () => {
  try {
    console.log("🔄 Syncing activities to Redis...");
    const activities = await Activities.find({});

    let synced = 0;
    for (const activity of activities) {
      const activitySummary = `Logged activity: ${activity.workoutType} for ${activity.duration} minutes at ${activity.intensity} intensity. Burned ${activity.caloriesBurned} calories.${activity.distance ? ` Distance: ${activity.distance}km.` : ""}`;

      try {
        await storeFitnessSummary(activity.userId, activitySummary, "activity");
        synced++;
      } catch (error) {
        console.warn(
          `⚠️ Failed to sync activity ${activity._id}:`,
          error.message,
        );
      }
    }
    console.log(`✅ Synced ${synced}/${activities.length} activities to Redis`);
    return synced;
  } catch (error) {
    console.error("❌ Error syncing activities:", error.message);
    return 0;
  }
};

/**
 * Sync all existing goals to Redis vectors
 */
const syncGoalsToRedis = async () => {
  try {
    console.log("🔄 Syncing goals to Redis...");
    const goals = await Goals.find({});

    let synced = 0;
    for (const goal of goals) {
      const goalSummary = `Goal: ${goal.goalType}. Target: ${goal.goalType === "weight_loss" ? goal.goalWeight + "kg" : goal.targetCalories + " calories"}. Progress: ${goal.progressPercentage}%. Timeline: ${goal.timeline}.`;

      try {
        await storeFitnessSummary(goal.userId, goalSummary, "goal");
        synced++;
      } catch (error) {
        console.warn(`⚠️ Failed to sync goal ${goal._id}:`, error.message);
      }
    }
    console.log(`✅ Synced ${synced}/${goals.length} goals to Redis`);
    return synced;
  } catch (error) {
    console.error("❌ Error syncing goals:", error.message);
    return 0;
  }
};

/**
 * Run all syncs on startup
 */
const syncAllDataToRedis = async () => {
  try {
    console.log("\n📊 ========================================");
    console.log("   SYNCING MONGODB TO REDIS VECTORS");
    console.log("   ========================================\n");

    const startTime = Date.now();

    const userCount = await syncUserProfilesToRedis();
    const foodCount = await syncCalorieLogsToRedis();
    const activityCount = await syncActivitiesToRedis();
    const goalCount = await syncGoalsToRedis();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log("\n📊 ========================================");
    console.log("   SYNC COMPLETE");
    console.log("   ========================================");
    console.log(`   User Profiles: ${userCount}`);
    console.log(`   Calorie Logs: ${foodCount}`);
    console.log(`   Activities: ${activityCount}`);
    console.log(`   Goals: ${goalCount}`);
    console.log(`   ────────────────`);
    console.log(
      `   Total Vectors: ${userCount + foodCount + activityCount + goalCount}`,
    );
    console.log(`   Time: ${duration}s`);
    console.log("   ========================================\n");

    return {
      users: userCount,
      foods: foodCount,
      activities: activityCount,
      goals: goalCount,
      total: userCount + foodCount + activityCount + goalCount,
      duration,
    };
  } catch (error) {
    console.error("❌ Error in syncAllDataToRedis:", error);
    return {
      users: 0,
      foods: 0,
      activities: 0,
      goals: 0,
      total: 0,
      duration: 0,
      error: error.message,
    };
  }
};

module.exports = {
  syncAllDataToRedis,
  syncUserProfilesToRedis,
  syncCalorieLogsToRedis,
  syncActivitiesToRedis,
  syncGoalsToRedis,
};
