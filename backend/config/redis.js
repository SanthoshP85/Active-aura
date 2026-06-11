/**
 * Redis Stack Configuration
 * Connects to Redis for Vector Database operations
 * Prefers Upstash REST API if available, otherwise uses local Redis
 */

const { createClient } = require("redis");

let redisClient;

const connectRedis = async () => {
  try {
    // Check if Upstash credentials are available
    if (
      process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
      console.log("🚀 Using Upstash Redis REST API");
      // For Upstash, we'll use REST calls in the service layer
      // Store the Upstash config for later use
      redisClient = {
        isUpstash: true,
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      };
      console.log("✅ Upstash Redis Configured");
      return redisClient;
    }

    // Fall back to local Redis
    redisClient = createClient({
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    await redisClient.connect();
    console.log("✅ Redis Connected");
    return redisClient;
  } catch (error) {
    console.error(`❌ Redis Connection Error: ${error.message}`);
    // Redis is optional for RAG, continue without it
    console.warn("⚠️ Continuing without Redis support");
    return null;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    console.warn("⚠️ Redis client not initialized");
  }
  return redisClient;
};

module.exports = {
  connectRedis,
  getRedisClient,
};
