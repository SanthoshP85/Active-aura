/**
 * LLM Rate Limiter Service
 * Handles rate limiting, caching, and retry logic for LLM API calls
 * Prevents 429 (Too Many Requests) errors from Gemini/OpenAI
 */

// In-memory cache for LLM responses
const llmCache = new Map();

// Request queue for rate limiting
const requestQueue = [];
let isProcessing = false;

const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 10, // Gemini free tier: ~10 requests/min
  cacheExpireMins: 60, // Cache responses for 1 hour
  retryAttempts: 3,
  retryDelayMs: 1000, // Start with 1 second
};

/**
 * Generate cache key from LLM parameters
 */
const generateCacheKey = (message, systemPrompt) => {
  return `${message}::${systemPrompt}`.substring(0, 200);
};

/**
 * Check if cached response is still valid
 */
const isCacheValid = (cachedAt) => {
  const ageMinutes = (Date.now() - cachedAt) / (1000 * 60);
  return ageMinutes < RATE_LIMIT_CONFIG.cacheExpireMins;
};

/**
 * Get cached LLM response
 */
const getCachedResponse = (message, systemPrompt) => {
  const key = generateCacheKey(message, systemPrompt);
  const cached = llmCache.get(key);

  if (cached && isCacheValid(cached.createdAt)) {
    console.log("📦 Cache hit for LLM request");
    return cached.response;
  }

  if (cached) {
    llmCache.delete(key); // Remove expired cache
  }

  return null;
};

/**
 * Cache LLM response
 */
const cacheResponse = (message, systemPrompt, response) => {
  const key = generateCacheKey(message, systemPrompt);
  llmCache.set(key, {
    response,
    createdAt: Date.now(),
  });
};

/**
 * Sleep helper for delays
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Process queue with rate limiting
 */
const processQueue = async () => {
  if (isProcessing || requestQueue.length === 0) {
    return;
  }

  isProcessing = true;

  while (requestQueue.length > 0) {
    const { fn, resolve, reject } = requestQueue.shift();

    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      reject(error);
    }

    // Rate limiting: add delay between requests
    if (requestQueue.length > 0) {
      const delayMs = (60 * 1000) / RATE_LIMIT_CONFIG.maxRequestsPerMinute;
      await sleep(delayMs);
    }
  }

  isProcessing = false;
};

/**
 * Exponential backoff retry logic
 */
const callWithRetry = async (fn, attempt = 1) => {
  try {
    return await fn();
  } catch (error) {
    // Check if it's a rate limit error (429)
    if (
      error.response?.status === 429 &&
      attempt < RATE_LIMIT_CONFIG.retryAttempts
    ) {
      const backoffMs =
        RATE_LIMIT_CONFIG.retryDelayMs * Math.pow(2, attempt - 1);
      console.log(
        `⏳ Rate limited. Retrying in ${backoffMs}ms... (Attempt ${attempt}/${RATE_LIMIT_CONFIG.retryAttempts})`,
      );
      await sleep(backoffMs);
      return callWithRetry(fn, attempt + 1);
    }

    throw error;
  }
};

/**
 * Main function to call LLM with rate limiting and caching
 */
const callLLMWithRateLimit = async (message, systemPrompt, llmCallFn) => {
  // Check cache first
  const cachedResponse = getCachedResponse(message, systemPrompt);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Add to queue and wait for processing
  return new Promise((resolve, reject) => {
    requestQueue.push({
      fn: async () => {
        try {
          const response = await callWithRetry(llmCallFn);
          cacheResponse(message, systemPrompt, response);
          return response;
        } catch (error) {
          throw error;
        }
      },
      resolve,
      reject,
    });

    processQueue();
  });
};

/**
 * Get cache statistics
 */
const getCacheStats = () => {
  return {
    cachedItems: llmCache.size,
    queuedRequests: requestQueue.length,
    isProcessing,
    config: RATE_LIMIT_CONFIG,
  };
};

/**
 * Clear cache (for testing or management)
 */
const clearCache = () => {
  const size = llmCache.size;
  llmCache.clear();
  console.log(`🗑️ Cleared ${size} cached LLM responses`);
};

module.exports = {
  callLLMWithRateLimit,
  getCacheStats,
  clearCache,
  RATE_LIMIT_CONFIG,
};
