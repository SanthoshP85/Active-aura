/**
 * Activities Controller
 * Handles activity tracking HTTP requests
 */

const {
  logActivity,
  getActivitiesRange,
  getActivitiesByDate,
  getWeeklySummary,
  updateActivity,
  deleteActivity,
} = require("./activitiesService");
const { successResponse, errorResponse } = require("../../utils/response");

/**
 * Controller: Log activity
 * POST /api/activities/log
 */
const logActivityController = async (req, res, next) => {
  try {
    const activityData = req.validatedData;
    const activity = await logActivity(req.userId, activityData);

    return successResponse(res, 201, "Activity logged successfully", activity);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get activities by date range
 * GET /api/activities/range?startDate=2024-01-01&endDate=2024-01-31
 */
const getRange = async (req, res, next) => {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date();

    const activities = await getActivitiesRange(req.userId, startDate, endDate);

    return successResponse(res, 200, "Activities fetched", {
      startDate,
      endDate,
      count: activities.length,
      activities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get activities by date
 * GET /api/activities/date?date=2024-01-01
 */
const getByDate = async (req, res, next) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const activities = await getActivitiesByDate(req.userId, date);

    return successResponse(res, 200, "Activities fetched", {
      date,
      count: activities.length,
      activities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get weekly summary
 * GET /api/activities/weekly?date=2024-01-01
 */
const getWeeklySummaryController = async (req, res, next) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const summary = await getWeeklySummary(req.userId, date);

    return successResponse(res, 200, "Weekly summary fetched", summary);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Update activity
 * PUT /api/activities/:activityId
 */
const updateActivityController = async (req, res, next) => {
  try {
    const { activityId } = req.params;
    const activity = await updateActivity(req.userId, activityId, req.body);

    return successResponse(res, 200, "Activity updated", activity);
  } catch (error) {
    if (error.message === "Unauthorized") {
      return errorResponse(res, 403, error.message);
    }
    next(error);
  }
};

/**
 * Controller: Delete activity
 * DELETE /api/activities/:activityId
 */
const deleteActivityController = async (req, res, next) => {
  try {
    const { activityId } = req.params;
    const result = await deleteActivity(req.userId, activityId);

    return successResponse(res, 200, result.message);
  } catch (error) {
    if (error.message === "Unauthorized") {
      return errorResponse(res, 403, error.message);
    }
    next(error);
  }
};

module.exports = {
  logActivityController,
  getRange,
  getByDate,
  getWeeklySummaryController,
  updateActivityController,
  deleteActivityController,
};
