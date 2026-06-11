/**
 * Users Routes
 * Defines all user-related endpoints
 */

const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  getWeightHistoryController,
  getStreakController,
} = require("./usersController");
const authenticateToken = require("../../middleware/auth");

// All routes require authentication
router.use(authenticateToken);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);
router.get("/weight-history", getWeightHistoryController);
router.get("/streak", getStreakController);

module.exports = router;
