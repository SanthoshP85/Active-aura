/**
 * Redis Debug Controller
 * Allows viewing stored vectors (development only)
 */

const { getRedisClient } = require("../../config/redis");
const axios = require("axios");

/**
 * Get all Redis keys for a user (Upstash REST API compatible)
 */
const getRedisDataForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const redis = getRedisClient();

    if (!redis) {
      return res.status(503).json({
        success: false,
        message: "Redis not connected",
      });
    }

    // Check if using Upstash REST API
    if (redis.isUpstash) {
      return await getUpstashData(userId, redis, res);
    }

    // Local Redis - use keys command
    return await getLocalRedisData(userId, redis, res);
  } catch (error) {
    console.error("Error getting Redis data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve Redis data",
      error: error.message,
    });
  }
};

/**
 * Get data from Upstash REST API
 * Note: Upstash REST API doesn't support KEYS/SCAN commands
 * We use a workaround: query predefined patterns
 */
const getUpstashData = async (userId, redis, res) => {
  try {
    const data = [];

    console.log(`📡 Attempting to query Upstash for user ${userId}...`);
    console.log(
      `📡 Looking for vectors with pattern: fitness:${userId}:dataType:*`,
    );

    // Query by attempting to fetch commonly-used key patterns
    // Since vectors are stored as: fitness:userId:dataType:UUID
    // We can query known dataType patterns
    const commonPatterns = [
      `fitness:${userId}:profile`,
      `fitness:${userId}:food`,
      `fitness:${userId}:activity`,
      `fitness:${userId}:goal`,
    ];

    // Try to find at least one vector with each pattern to confirm data exists
    console.log(`🔍 Searching for vectors with known patterns...`);

    for (const pattern of commonPatterns) {
      try {
        const response = await axios.post(
          `${redis.url}/hgetall/${pattern}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${redis.token}`,
            },
          },
        );

        if (
          response.data &&
          response.data.result &&
          Object.keys(response.data.result).length > 0
        ) {
          data.push({
            key: pattern,
            type: pattern.split(":")[2],
            data: response.data.result,
          });
          console.log(`✅ Found vector at key: ${pattern}`);
        }
      } catch (error) {
        // Key doesn't exist, continue
        console.log(`⏭️ No vector at pattern: ${pattern}`);
      }
    }

    // If still no data, provide helpful tips
    if (data.length === 0) {
      console.log(
        `⚠️ No vectors found with common patterns. Vectors may not be synced yet.`,
      );
      console.log(
        `💡 Upstash limitation: REST API cannot scan for keys with UUIDs.`,
      );
      console.log(`💡 Vectors are stored as: fitness:${userId}:dataType:UUID`);
    }

    return res.json({
      success: true,
      message: `Data for user ${userId}`,
      provider: "Upstash REST API",
      userId,
      totalVectors: data.length,
      note: "Upstash REST API has limitations - SCAN/KEYS commands not supported",
      data,
      troubleshooting: {
        issue:
          data.length === 0
            ? "No vectors found with common patterns"
            : "Vectors retrieved successfully",
        keyFormat: `fitness:${userId}:dataType:UUID`,
        commonDataTypes: ["profile", "food", "activity", "goal"],
        reason:
          data.length === 0
            ? "Vectors may not have been synced, or are stored with UUIDs making REST API queries difficult"
            : "Success",
        solutions: [
          "Check if backend startup sync ran (check backend logs)",
          "Verify user has logged food/activities after signup",
          "Use Upstash console at https://console.upstash.io/redis to browse all keys",
          "Use KEYS or SCAN command: KEYS fitness:*",
          "Switch to local Redis for full support",
        ],
      },
      tip: "To view all vectors, use SCAN command at https://console.upstash.io or check MongoDB directly",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to query Upstash",
      error: error.message,
    });
  }
};

/**
 * Get data from local Redis
 */
const getLocalRedisData = async (userId, redis, res) => {
  try {
    // Get all keys for this user
    const keys = await redis.keys(`fitness:${userId}:*`);

    const data = [];

    for (const key of keys) {
      try {
        const value = await redis.hGetAll(key);
        if (value) {
          // Parse embedding if stored as string
          if (value.embedding && typeof value.embedding === "string") {
            try {
              value.embedding = JSON.parse(value.embedding);
              value.embeddingDimensions = value.embedding.length;
            } catch (e) {
              // Keep as string if not valid JSON
            }
          }

          data.push({
            key,
            data: value,
          });
        }
      } catch (error) {
        console.warn(`Failed to get key ${key}:`, error.message);
      }
    }

    return res.json({
      success: true,
      message: `Found ${data.length} vectors for user ${userId}`,
      provider: "Local Redis",
      userId,
      totalVectors: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to query Redis",
      error: error.message,
    });
  }
};

/**
 * Get statistics about Redis storage
 */
const getRedisStats = async (req, res) => {
  try {
    const redis = getRedisClient();

    if (!redis) {
      return res.status(503).json({
        success: false,
        message: "Redis not connected",
      });
    }

    if (redis.isUpstash) {
      return res.json({
        success: true,
        provider: "Upstash",
        message: "Upstash REST API doesn't support SCAN/INFO commands",
        url: redis.url,
        note: "Query specific keys with GET /api/debug/redis/:userId endpoint",
      });
    }

    // Local Redis stats
    try {
      const info = await redis.info("stats");
      const dbsize = await redis.dbSize();

      return res.json({
        success: true,
        provider: "Local Redis",
        dbSize: dbsize,
        info: info,
      });
    } catch (error) {
      return res.json({
        success: true,
        provider: "Local Redis",
        dbSize: "Unable to retrieve",
        error: error.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get Redis stats",
      error: error.message,
    });
  }
};

/**
 * Clear all Redis data for a user
 */
const clearUserData = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const redis = getRedisClient();

    if (!redis) {
      return res.status(503).json({
        success: false,
        message: "Redis not connected",
      });
    }

    if (redis.isUpstash) {
      return res.json({
        success: false,
        message: "Cannot delete data with Upstash REST API (no DEL support)",
        tip: "Use local Redis for delete operations",
      });
    }

    // Delete all keys for user
    const keys = await redis.keys(`fitness:${userId}:*`);
    let deleted = 0;

    for (const key of keys) {
      try {
        await redis.del(key);
        deleted++;
      } catch (error) {
        console.warn(`Failed to delete ${key}:`, error.message);
      }
    }

    return res.json({
      success: true,
      message: `Cleared ${deleted} vectors for user ${userId}`,
      userId,
      deletedCount: deleted,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear Redis data",
      error: error.message,
    });
  }
};

module.exports = {
  getRedisDataForUser,
  getRedisStats,
  clearUserData,
};
