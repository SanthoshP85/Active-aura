/**
 * Insights Controller
 * Handles insight HTTP requests
 */

const { generateAllInsights } = require("./insightsService");
const { successResponse } = require("../../utils/response");

/**
 * Controller: Get all insights
 * GET /api/insights
 */
const getInsights = async (req, res, next) => {
  try {
    const insightsData = await generateAllInsights(req.userId);

    return successResponse(res, 200, "Insights generated", insightsData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInsights,
};
