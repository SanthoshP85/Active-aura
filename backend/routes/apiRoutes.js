/**
 * Main API Routes
 * Combines all module routes
 */

const express = require("express");
const authRoutes = require("../modules/auth/authRoutes");
const usersRoutes = require("../modules/users/usersRoutes");
const caloriesRoutes = require("../modules/calories/caloriesRoutes");
const activitiesRoutes = require("../modules/activities/activitiesRoutes");
const goalsRoutes = require("../modules/goals/goalsRoutes");
const insightsRoutes = require("../modules/insights/insightsRoutes");
const chatbotRoutes = require("../modules/chatbot/chatbotRoutes");
const voiceRoutes = require("../modules/voice/voiceRoutes");
const {
  getRedisDataForUser,
  getRedisStats,
  clearUserData,
} = require("../modules/rag/redisDebugController");
const {
  testVectorConnection,
  testUpsert,
} = require("../modules/rag/vectorDebugController");
const llmDebugRoutes = require("../modules/rag/debugController");

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API version endpoint
router.get("/version", (req, res) => {
  res.json({ version: "1.0.0", api: "ActiveAura API" });
});

// Debug routes (development only)
router.get("/debug/redis/stats", getRedisStats);
router.get("/debug/redis/:userId", getRedisDataForUser);
router.delete("/debug/redis/:userId", clearUserData);
router.get("/debug/vector/test", testVectorConnection);
router.post("/debug/vector/upsert-test", testUpsert);
router.use("/debug/llm", llmDebugRoutes);

// Mount all module routes
router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/calories", caloriesRoutes);
router.use("/activities", activitiesRoutes);
router.use("/goals", goalsRoutes);
router.use("/insights", insightsRoutes);
router.use("/chatbot", chatbotRoutes);
router.use("/voice", voiceRoutes);

// 404 handler
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

module.exports = router;
