/**
 * Calories Controller
 * Handles calorie tracking HTTP requests
 */

const {
  getOrCreateDailyTracker,
  logFood,
  getDailyCaloriesSummary,
  getCalorieRange,
  searchFood,
  removeFood,
} = require("./caloriesService");
const { successResponse, errorResponse } = require("../../utils/response");

/**
 * Controller: Log food
 * POST /api/calories/log
 */
const logFoodController = async (req, res, next) => {
  try {
    const foodData = {
      ...req.validatedData,
      date: req.body.date || new Date(),
    };

    const result = await logFood(req.userId, foodData);

    return successResponse(res, 201, "Food logged successfully", {
      food: result.food,
      dailyTotal: {
        totalCalories: result.tracker.totalCalories,
        totalProtein: result.tracker.totalProtein,
        totalCarbs: result.tracker.totalCarbs,
        totalFats: result.tracker.totalFats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get daily summary
 * GET /api/calories/daily?date=2024-01-01
 */
const getDailySummary = async (req, res, next) => {
  try {
    // Pass date string directly to avoid timezone issues
    const dateStr = req.query.date || new Date().toISOString().split("T")[0];
    const summary = await getDailyCaloriesSummary(req.userId, dateStr);

    return successResponse(res, 200, "Daily summary fetched", summary);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get calorie range
 * GET /api/calories/range?startDate=2024-01-01&endDate=2024-01-31
 */
const getRange = async (req, res, next) => {
  try {
    const startDate =
      new Date(req.query.startDate) ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date();

    const trackers = await getCalorieRange(req.userId, startDate, endDate);

    return successResponse(res, 200, "Calorie range fetched", {
      startDate,
      endDate,
      days: trackers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Search food
 * GET /api/calories/search?q=chicken
 */
const searchFoodController = async (req, res, next) => {
  try {
    const query = req.query.q;

    if (!query || query.length < 2) {
      return errorResponse(
        res,
        400,
        "Search query must be at least 2 characters",
      );
    }

    const results = await searchFood(query);

    return successResponse(res, 200, "Food search results", results);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Remove food
 * DELETE /api/calories/food/:foodId
 */
const removeFoodController = async (req, res, next) => {
  try {
    const { foodId } = req.params;
    const updatedTracker = await removeFood(req.userId, foodId);

    return successResponse(res, 200, "Food removed", {
      tracker: updatedTracker,
    });
  } catch (error) {
    if (error.message === "Unauthorized") {
      return errorResponse(res, 403, error.message);
    }
    next(error);
  }
};

module.exports = {
  logFoodController,
  getDailySummary,
  getRange,
  searchFoodController,
  removeFoodController,
};
