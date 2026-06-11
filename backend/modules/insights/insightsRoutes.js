/**
 * Insights Routes
 * Defines all insights endpoints
 */

const express = require("express");
const router = express.Router();
const { getInsights } = require("./insightsController");
const authenticateToken = require("../../middleware/auth");

// All routes require authentication
router.use(authenticateToken);

router.get("/", getInsights);

module.exports = router;
