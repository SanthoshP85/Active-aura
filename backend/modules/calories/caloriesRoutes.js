/**
 * Calories Routes
 * Defines all calorie tracking endpoints
 */

const express = require("express");
const router = express.Router();
const {
  logFoodController,
  getDailySummary,
  getRange,
  searchFoodController,
  removeFoodController,
} = require("./caloriesController");
const { validate, logFoodSchema } = require("../../utils/validation");
const authenticateToken = require("../../middleware/auth");

// All routes require authentication
router.use(authenticateToken);

router.post("/log", validate(logFoodSchema), logFoodController);
router.get("/daily", getDailySummary);
router.get("/range", getRange);
router.get("/search", searchFoodController);
router.delete("/food/:foodId", removeFoodController);

module.exports = router;
