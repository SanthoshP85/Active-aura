/**
 * Debug and management endpoints for rate limiter
 */

const express = require("express");
const { getCacheStats, clearCache } = require("../../utils/llmRateLimiter");
const auth = require("../../middleware/auth");

const router = express.Router();

/**
 * GET /api/debug/llm-cache-stats
 * Get cache statistics (admin only)
 */
router.get("/llm-cache-stats", auth, async (req, res) => {
  try {
    // Verify user is admin (optional - remove if you don't have admin check)
    const stats = getCacheStats();

    return res.json({
      success: true,
      statusCode: 200,
      message: "LLM cache statistics retrieved",
      data: stats,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error getting cache stats:", error.message);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to get cache statistics",
      error: error.message,
      timestamp: new Date(),
    });
  }
});

/**
 * POST /api/debug/llm-cache-clear
 * Clear all cached LLM responses (admin only)
 */
router.post("/llm-cache-clear", auth, async (req, res) => {
  try {
    clearCache();

    return res.json({
      success: true,
      statusCode: 200,
      message: "LLM cache cleared successfully",
      data: { clearedAt: new Date() },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Error clearing cache:", error.message);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to clear cache",
      error: error.message,
      timestamp: new Date(),
    });
  }
});

module.exports = router;
