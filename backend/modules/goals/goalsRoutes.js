/**
 * Goals Routes
 * Defines all fitness goal endpoints
 */

const express = require("express");
const router = express.Router();
const {
  createGoalController,
  getActiveGoalsController,
  getAllGoalsController,
  getGoalController,
  updateGoalProgressController,
  completeGoalController,
  deleteGoalController,
} = require("./goalsController");
const { validate, createGoalSchema } = require("../../utils/validation");
const authenticateToken = require("../../middleware/auth");

// All routes require authentication
router.use(authenticateToken);

router.post("/", validate(createGoalSchema), createGoalController);
router.get("/active", getActiveGoalsController);
router.get("/", getAllGoalsController);
router.get("/:goalId", getGoalController);
router.put("/:goalId/progress", updateGoalProgressController);
router.put("/:goalId/complete", completeGoalController);
router.delete("/:goalId", deleteGoalController);

module.exports = router;
