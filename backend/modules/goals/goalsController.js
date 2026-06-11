/**
 * Goals Controller
 * Handles fitness goal HTTP requests
 */

const {
  createGoal,
  getActiveGoals,
  getAllGoals,
  getGoal,
  updateGoalProgress,
  completeGoal,
  deleteGoal,
} = require("./goalsService");
const { successResponse, errorResponse } = require("../../utils/response");

/**
 * Controller: Create goal
 * POST /api/goals
 */
const createGoalController = async (req, res, next) => {
  try {
    const goalData = req.validatedData;
    const goal = await createGoal(req.userId, goalData);

    return successResponse(res, 201, "Goal created successfully", goal);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get active goals
 * GET /api/goals/active
 */
const getActiveGoalsController = async (req, res, next) => {
  try {
    const goals = await getActiveGoals(req.userId);

    return successResponse(res, 200, "Active goals fetched", goals);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get all goals
 * GET /api/goals
 */
const getAllGoalsController = async (req, res, next) => {
  try {
    const goals = await getAllGoals(req.userId);

    return successResponse(res, 200, "All goals fetched", goals);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get single goal
 * GET /api/goals/:goalId
 */
const getGoalController = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const goal = await getGoal(req.userId, goalId);

    return successResponse(res, 200, "Goal fetched", goal);
  } catch (error) {
    if (error.message === "Unauthorized") {
      return errorResponse(res, 403, error.message);
    }
    next(error);
  }
};

/**
 * Controller: Update goal progress
 * PUT /api/goals/:goalId/progress
 */
const updateGoalProgressController = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const { currentWeight } = req.body;

    if (!currentWeight) {
      return errorResponse(res, 400, "Current weight is required");
    }

    const goal = await updateGoalProgress(req.userId, goalId, currentWeight);

    return successResponse(res, 200, "Goal progress updated", goal);
  } catch (error) {
    if (error.message === "Unauthorized") {
      return errorResponse(res, 403, error.message);
    }
    next(error);
  }
};

/**
 * Controller: Complete goal
 * PUT /api/goals/:goalId/complete
 */
const completeGoalController = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const goal = await completeGoal(req.userId, goalId);

    return successResponse(res, 200, "Goal completed", goal);
  } catch (error) {
    if (error.message === "Unauthorized") {
      return errorResponse(res, 403, error.message);
    }
    next(error);
  }
};

/**
 * Controller: Delete goal
 * DELETE /api/goals/:goalId
 */
const deleteGoalController = async (req, res, next) => {
  try {
    const { goalId } = req.params;
    const result = await deleteGoal(req.userId, goalId);

    return successResponse(res, 200, result.message);
  } catch (error) {
    if (error.message === "Unauthorized") {
      return errorResponse(res, 403, error.message);
    }
    next(error);
  }
};

module.exports = {
  createGoalController,
  getActiveGoalsController,
  getAllGoalsController,
  getGoalController,
  updateGoalProgressController,
  completeGoalController,
  deleteGoalController,
};
