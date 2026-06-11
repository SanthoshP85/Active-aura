/**
 * LLM Service
 * Centralized LLM calling logic
 * Supports: HuggingFace (primary), Gemini, OpenAI (fallbacks)
 * Separated to avoid circular dependencies
 */

const axios = require("axios");
const hfService = require("./huggingFaceService");

/**
 * Sleep helper for delays
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Call API with exponential backoff retry logic
 */
const callWithRetry = async (fn, maxAttempts = 3, initialDelayMs = 1000) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (attempt > 1) {
        const backoffMs = initialDelayMs * Math.pow(2, attempt - 2);
        console.log(
          `Retry attempt ${attempt}/${maxAttempts} - Waiting ${backoffMs}ms...`,
        );
        await sleep(backoffMs);
      }
      return await fn();
    } catch (error) {
      lastError = error;
      const status = error.response?.status;
      const isRetryable =
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        error.code === "ECONNABORTED" ||
        error.code === "ENOTFOUND";

      if (!isRetryable || attempt === maxAttempts) {
        throw error;
      }
      console.warn(
        `Attempt ${attempt}/${maxAttempts} failed (${status || error.code}), will retry...`,
      );
    }
  }
  throw lastError;
};

/**
 * Call OpenAI API
 */
const callOpenAI = async (userQuery, systemPrompt) => {
  try {
    console.log("Making OpenAI API request...");
    const response = await callWithRetry(
      async () => {
        return await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userQuery },
            ],
            temperature: 0.7,
            max_tokens: 500,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
            timeout: 30000,
          },
        );
      },
      3,
      1000,
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error.message);
    throw error;
  }
};

/**
 * Call Gemini API
 */
const callGemini = async (userQuery, systemPrompt) => {
  try {
    console.log("Making Gemini API request...");
    const response = await callWithRetry(
      async () => {
        return await axios.post(
          `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            contents: [
              { parts: [{ text: systemPrompt }, { text: userQuery }] },
            ],
          },
          { timeout: 30000 },
        );
      },
      3,
      1000,
    );
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw error;
  }
};

/**
 * Generate mock response for development
 */
const generateMockResponse = (userQuery) => {
  const responses = {
    calorie:
      "Based on your data, try tracking your meals consistently to meet your daily calorie targets.",
    workout:
      "Your recent activity shows good consistency. Keep up the great work!",
    weight:
      "Weight fluctuates naturally. Focus on trends over weeks, not days.",
    macro:
      "Your macro distribution looks balanced. Continue with your current approach.",
    default:
      "I'd recommend tracking your metrics consistently to get better personalized recommendations.",
  };

  for (const [key, value] of Object.entries(responses)) {
    if (userQuery.toLowerCase().includes(key)) {
      return value;
    }
  }
  return responses.default;
};

/**
 * Call LLM with context
 * Provider priority: HuggingFace > Gemini > OpenAI > Mock
 */
const callLLM = async (userQuery, systemPrompt, options = {}) => {
  try {
    const provider = process.env.LLM_PROVIDER || "huggingface";
    console.log(`LLM Provider: ${provider}`);
    console.log(`User Query: ${userQuery.substring(0, 50)}...`);

    // Try HuggingFace first (primary)
    if (provider === "huggingface" || !provider.includes("gemini")) {
      try {
        console.log("Calling HuggingFace...");
        const response = await hfService.callLLM(
          userQuery,
          systemPrompt,
          options,
        );
        console.log(`HuggingFace Response: ${response.substring(0, 100)}...`);
        return response;
      } catch (error) {
        console.warn("HuggingFace failed:", error.message);

        // Fallback to Gemini
        if (
          process.env.GEMINI_API_KEY &&
          process.env.GEMINI_API_KEY !== "your-gemini-api-key"
        ) {
          console.warn("Trying Gemini as fallback...");
          try {
            return await callGemini(userQuery, systemPrompt);
          } catch (geminiError) {
            console.warn("Gemini also failed");
          }
        }

        // Fallback to OpenAI
        if (
          process.env.OPENAI_API_KEY &&
          process.env.OPENAI_API_KEY !== "your-openai-api-key"
        ) {
          console.warn("Trying OpenAI as fallback...");
          try {
            return await callOpenAI(userQuery, systemPrompt);
          } catch (openaiError) {
            console.warn("OpenAI also failed");
          }
        }

        // All providers failed, use mock
        console.warn("All providers failed - using mock response");
        return generateMockResponse(userQuery);
      }
    } else if (provider === "gemini" && process.env.GEMINI_API_KEY) {
      console.log("Calling Gemini...");
      try {
        const response = await callGemini(userQuery, systemPrompt);
        console.log(`Gemini Response: ${response.substring(0, 100)}...`);
        return response;
      } catch (error) {
        console.error("Gemini Error:", error.message);
        return generateMockResponse(userQuery);
      }
    } else if (provider === "openai" && process.env.OPENAI_API_KEY) {
      console.log("Calling OpenAI...");
      try {
        const response = await callOpenAI(userQuery, systemPrompt);
        console.log(`OpenAI Response: ${response.substring(0, 100)}...`);
        return response;
      } catch (error) {
        console.error("OpenAI Error:", error.message);
        return generateMockResponse(userQuery);
      }
    } else {
      console.warn("Using mock LLM response - API keys not configured");
      return generateMockResponse(userQuery);
    }
  } catch (error) {
    console.error("LLM call error:", error.message);
    return generateMockResponse(userQuery);
  }
};

module.exports = {
  callLLM,
  generateMockResponse,
  callGemini,
  callOpenAI,
};
