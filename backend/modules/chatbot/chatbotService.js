/**
 * Chatbot Service
 * AI-powered fitness chatbot using RAG and insights
 * Grounded in user data - never hallucinate
 */

const {
  retrieveContext,
  generateFitnessSummary,
} = require("../rag/ragService");
const { generateAllInsights } = require("../insights/insightsService");
const { callLLM } = require("../../utils/llmService");
const User = require("../../models/User");
const Goals = require("../../models/Goals");
const CaloriesTracker = require("../../models/CaloriesTracker");
const Activities = require("../../models/Activities");

/**
 * Response limits configuration
 */
const RESPONSE_CONFIG = {
  maxResponseLength: 300, // Maximum characters in response (reduced)
  maxSentences: 3, // Maximum sentences in response (reduced)
  maxContextItems: 2, // Maximum RAG context items
  maxInsights: 2, // Maximum insights to include
};

/**
 * Prepare context for LLM
 * Combines user data, insights, and retrieved context
 */
const prepareContext = async (userId, query) => {
  try {
    const user = await User.findById(userId);
    const goal = await Goals.findOne({ userId, isActive: true });
    const insights = await generateAllInsights(userId);

    // Get recent data
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTracker = await CaloriesTracker.findOne({
      userId,
      date: today,
    });

    const weekActivities = await Activities.find({
      userId,
      date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    // Retrieve relevant context from RAG
    const ragContext = await retrieveContext(userId, query, 2);

    const context = {
      userProfile: {
        fullName: user.fullName,
        currentWeight: user.currentWeight,
        goalWeight: user.goalWeight,
        height: user.height,
        age: user.age,
        activityLevel: user.activityLevel,
        fitnessGoals: user.fitnessGoals,
      },
      activeGoal: goal
        ? {
            type: goal.goalType,
            targetCalories: goal.targetCalories,
            goalWeight: goal.goalWeight,
            progressPercentage: goal.progressPercentage,
            timeline: goal.timeline,
          }
        : null,
      todayMetrics: todayTracker
        ? {
            totalCalories: todayTracker.totalCalories,
            totalProtein: todayTracker.totalProtein,
            totalCarbs: todayTracker.totalCarbs,
            totalFats: todayTracker.totalFats,
          }
        : null,
      weekActivities: {
        count: weekActivities.length,
        totalMinutes: weekActivities.reduce((sum, a) => sum + a.duration, 0),
        totalCaloriesBurned: weekActivities.reduce(
          (sum, a) => sum + a.caloriesBurned,
          0,
        ),
      },
      recentInsights: insights.insights.slice(0, 3),
      ragContext: ragContext,
    };

    return context;
  } catch (error) {
    console.error("Error preparing context:", error);
    return null;
  }
};

/**
 * Build system prompt for LLM
 */
const buildSystemPrompt = (context) => {
  // Limit context data to reduce token usage
  const limitedInsights = context.recentInsights.slice(
    0,
    RESPONSE_CONFIG.maxInsights,
  );
  const limitedRagContext = context.ragContext.slice(
    0,
    RESPONSE_CONFIG.maxContextItems,
  );

  let prompt = `You are Aura, a friendly AI fitness assistant.

STRICT RESPONSE RULES:
- Reply in EXACTLY 2-3 short sentences
- Maximum 50 words total
- Be warm but brief
- Give ONE specific tip if relevant
- Use the user's data when available

USER PROFILE: ${context.userProfile?.fullName || "User"}, Weight: ${context.userProfile?.currentWeight || "N/A"}kg, Goal: ${context.userProfile?.goalWeight || "N/A"}kg

TODAY: ${context.todayMetrics ? `${context.todayMetrics.totalCalories} calories consumed` : "No meals logged yet"}

THIS WEEK: ${context.weekActivities?.count || 0} workouts, ${context.weekActivities?.totalCaloriesBurned || 0} calories burned

GOAL: ${context.activeGoal ? `${context.activeGoal.type} - ${context.activeGoal.progressPercentage}% complete` : "No active goal"}

Respond briefly and helpfully.`;

  return prompt;
};

/**
 * Calculate confidence score based on data availability
 */
const calculateConfidenceScore = (context) => {
  let score = 0.5; // Base score

  if (context.userProfile) score += 0.1;
  if (context.activeGoal) score += 0.15;
  if (context.todayMetrics) score += 0.1;
  if (context.weekActivities.count > 0) score += 0.15;
  if (context.recentInsights.length > 0) score += 0.15;
  if (context.ragContext.length > 0) score += 0.1;

  return Math.min(1.0, score);
};

/**
 * Truncate response to configured limits
 */
const truncateResponse = (response) => {
  if (!response) return response;

  let truncated = response.trim();

  // Remove any markdown formatting that makes it look messy
  truncated = truncated
    .replace(/\*\*/g, "") // Remove bold **
    .replace(/\*/g, "") // Remove italics *
    .replace(/#{1,6}\s/g, "") // Remove headers #
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/`/g, "") // Remove inline code
    .replace(/\n{2,}/g, " ") // Replace multiple newlines with space
    .replace(/\n/g, " ") // Replace single newlines with space
    .trim();

  // Limit by sentence count FIRST (more important)
  const sentences = truncated.match(/[^.!?]+[.!?]+/g) || [truncated];
  if (sentences.length > RESPONSE_CONFIG.maxSentences) {
    truncated = sentences
      .slice(0, RESPONSE_CONFIG.maxSentences)
      .join(" ")
      .trim();
  }

  // Then limit by character count
  if (truncated.length > RESPONSE_CONFIG.maxResponseLength) {
    truncated = truncated.substring(0, RESPONSE_CONFIG.maxResponseLength);
    // End at last complete sentence
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf("."),
      truncated.lastIndexOf("!"),
      truncated.lastIndexOf("?"),
    );
    if (lastSentenceEnd > truncated.length * 0.4) {
      truncated = truncated.substring(0, lastSentenceEnd + 1);
    }
  }

  return truncated;
};

/**
 * Format response for consistency
 */
const formatResponse = (response) => {
  if (!response) return response;

  // Clean up extra whitespace and normalize
  let formatted = response.replace(/\s+/g, " ").trim();

  // Ensure it ends with proper punctuation
  if (formatted && !formatted.match(/[.!?]$/)) {
    formatted += ".";
  }

  return formatted;
};

/**
 * Main chatbot response function
 */
const getChatbotResponse = async (userId, userQuery) => {
  try {
    // Prepare context
    const context = await prepareContext(userId, userQuery);
    if (!context) {
      return {
        summary: "Unable to process request. Please try again.",
        recommendation: "Please try again",
        confidenceScore: 0,
      };
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt(context);

    // Get LLM response with max token limit
    const llmResponse = await callLLM(userQuery, systemPrompt, {
      maxTokens: 200, // Limit LLM output tokens
      temperature: 0.7,
    });

    // Truncate and format the response
    const formattedResponse = formatResponse(truncateResponse(llmResponse));

    // Calculate confidence score
    const confidenceScore = calculateConfidenceScore(context);

    return {
      summary: formattedResponse,
      recommendation: extractRecommendation(formattedResponse),
      confidenceScore,
      dataAvailable: {
        hasProfile: !!context.userProfile,
        hasGoal: !!context.activeGoal,
        hasTodayData: !!context.todayMetrics,
        hasWeeklyData: context.weekActivities.count > 0,
      },
    };
  } catch (error) {
    console.error("Chatbot error:", error);
    return {
      summary: "I encountered an error processing your request.",
      recommendation: "Please try again",
      confidenceScore: 0,
    };
  }
};

/**
 * Extract actionable recommendation from LLM response
 */
const extractRecommendation = (response) => {
  if (!response) return "";

  // Simple extraction - find recommendation or first sentence
  const lines = response.split("\n").filter((line) => line.trim());
  const recommendation =
    lines.find((line) => line.toLowerCase().includes("recommend")) ||
    lines.find((line) => line.toLowerCase().includes("suggest")) ||
    lines.find((line) => line.toLowerCase().includes("try")) ||
    lines[0];

  // Limit recommendation length
  const maxLength = 150;
  if (recommendation && recommendation.length > maxLength) {
    return recommendation.substring(0, maxLength) + "...";
  }
  return recommendation || response.substring(0, maxLength);
};

module.exports = {
  RESPONSE_CONFIG,
  prepareContext,
  buildSystemPrompt,
  truncateResponse,
  formatResponse,
  getChatbotResponse,
  calculateConfidenceScore,
  extractRecommendation,
};
