/**
 * Activities Routes
 * Defines all activity tracking endpoints
 */

const express = require("express");
const router = express.Router();
const {
  logActivityController,
  getRange,
  getByDate,
  getWeeklySummaryController,
  updateActivityController,
  deleteActivityController,
} = require("./activitiesController");
const { validate, logActivitySchema } = require("../../utils/validation");
const authenticateToken = require("../../middleware/auth");

// All routes require authentication
router.use(authenticateToken);

router.post("/log", validate(logActivitySchema), logActivityController);
router.get("/range", getRange);
router.get("/date", getByDate);
router.get("/daily", getByDate); // Alias for frontend compatibility
router.get("/weekly", getWeeklySummaryController);
router.put("/:activityId", updateActivityController);
router.delete("/:activityId", deleteActivityController);

module.exports = router;
