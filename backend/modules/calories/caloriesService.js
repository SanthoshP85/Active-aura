/**
 * Calories Service
 * Handles calorie tracking and food logging
 */

const CaloriesTracker = require("../../models/CaloriesTracker");
const FoodsLogged = require("../../models/FoodsLogged");
const { storeFitnessSummary } = require("../rag/ragService");
const axios = require("axios");

/**
 * Service: Get or create daily calorie tracker
 */
const getOrCreateDailyTracker = async (userId, date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  let tracker = await CaloriesTracker.findOne({
    userId,
    date: startOfDay,
  });

  if (!tracker) {
    tracker = new CaloriesTracker({
      userId,
      date: startOfDay,
    });
    await tracker.save();
  }

  return tracker;
};

/**
 * Service: Log food for a meal
 */
const logFood = async (userId, foodData) => {
  const date = new Date(foodData.date || Date.now());
  date.setHours(0, 0, 0, 0);

  // Get or create daily tracker
  const tracker = await getOrCreateDailyTracker(userId, date);

  // Create food log entry
  const foodLog = new FoodsLogged({
    userId,
    caloriesTrackerId: tracker._id,
    foodName: foodData.foodName,
    mealType: foodData.mealType,
    servingSize: foodData.servingSize,
    servingQuantity: foodData.servingQuantity,
    calories: foodData.calories,
    protein: foodData.protein || 0,
    carbs: foodData.carbs || 0,
    fats: foodData.fats || 0,
    fiber: foodData.fiber || 0,
    sugar: foodData.sugar || 0,
    source: foodData.source || "manual",
  });

  await foodLog.save();

  // Update tracker with new food
  tracker[foodData.mealType].items.push(foodLog._id);
  tracker[foodData.mealType].calories += foodData.calories;

  // Recalculate total
  tracker.totalCalories =
    tracker.breakfast.calories +
    tracker.lunch.calories +
    tracker.dinner.calories +
    tracker.snacks.calories;

  tracker.totalProtein = tracker.totalProtein + (foodData.protein || 0);
  tracker.totalCarbs = tracker.totalCarbs + (foodData.carbs || 0);
  tracker.totalFats = tracker.totalFats + (foodData.fats || 0);

  await tracker.save();

  // Store in Redis for RAG retrieval
  const fitnessSummary = `Logged food: ${foodData.foodName} (${foodData.calories} cal). Macros: ${foodData.protein}g protein, ${foodData.carbs}g carbs, ${foodData.fats}g fat. Daily total: ${tracker.totalCalories} calories.`;
  try {
    await storeFitnessSummary(userId, fitnessSummary, "food");
  } catch (error) {
    console.warn("⚠️ Failed to store in Redis:", error.message);
  }

  return {
    food: foodLog,
    tracker,
  };
};

/**
 * Service: Get daily calorie summary
 */
const getDailyCaloriesSummary = async (userId, date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const tracker = await CaloriesTracker.findOne({
    userId,
    date: startOfDay,
  }).populate({
    path: "breakfast.items lunch.items dinner.items snacks.items",
    select: "foodName calories protein carbs fats mealType",
  });

  if (!tracker) {
    return {
      date: startOfDay,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: [],
      },
    };
  }

  return {
    trackerId: tracker._id,
    date: tracker.date,
    totalCalories: tracker.totalCalories,
    totalProtein: tracker.totalProtein,
    totalCarbs: tracker.totalCarbs,
    totalFats: tracker.totalFats,
    meals: {
      breakfast: tracker.breakfast.items,
      lunch: tracker.lunch.items,
      dinner: tracker.dinner.items,
      snacks: tracker.snacks.items,
    },
  };
};

/**
 * Service: Get calorie range (date range)
 */
const getCalorieRange = async (userId, startDate, endDate) => {
  const trackers = await CaloriesTracker.find({
    userId,
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: 1 });

  return trackers;
};

/**
 * Service: Search food by name using external API
 * Uses USDA FoodData Central API (free tier)
 */
const searchFood = async (foodName) => {
  try {
    // Mock implementation - replace with actual API call
    // Real implementation would use USDA or similar API
    const mockFoods = [
      {
        id: "chicken-breast-100g",
        name: "Chicken Breast (100g)",
        calories: 165,
        protein: 31,
        carbs: 0,
        fats: 3.6,
      },
      {
        id: "banana-medium",
        name: "Banana (Medium)",
        calories: 105,
        protein: 1.3,
        carbs: 27,
        fats: 0.3,
      },
      {
        id: "rice-100g",
        name: "White Rice (100g)",
        calories: 130,
        protein: 2.7,
        carbs: 28,
        fats: 0.3,
      },
    ];

    // Filter by name
    return mockFoods.filter((food) =>
      food.name.toLowerCase().includes(foodName.toLowerCase()),
    );
  } catch (error) {
    console.error("Food search error:", error);
    return [];
  }
};

/**
 * Service: Remove food from a meal
 */
const removeFood = async (userId, foodId) => {
  const food = await FoodsLogged.findById(foodId);
  if (!food) {
    throw new Error("Food not found");
  }

  if (food.userId.toString() !== userId.toString()) {
    throw new Error("Unauthorized");
  }

  // Update tracker
  const tracker = await CaloriesTracker.findById(food.caloriesTrackerId);
  if (tracker) {
    tracker[food.mealType].items = tracker[food.mealType].items.filter(
      (id) => id.toString() !== foodId,
    );
    tracker[food.mealType].calories -= food.calories;

    // Recalculate total
    tracker.totalCalories =
      tracker.breakfast.calories +
      tracker.lunch.calories +
      tracker.dinner.calories +
      tracker.snacks.calories;

    tracker.totalProtein = Math.max(
      0,
      tracker.totalProtein - (food.protein || 0),
    );
    tracker.totalCarbs = Math.max(0, tracker.totalCarbs - (food.carbs || 0));
    tracker.totalFats = Math.max(0, tracker.totalFats - (food.fats || 0));

    await tracker.save();
  }

  await FoodsLogged.findByIdAndDelete(foodId);

  return tracker;
};

module.exports = {
  getOrCreateDailyTracker,
  logFood,
  getDailyCaloriesSummary,
  getCalorieRange,
  searchFood,
  removeFood,
};
