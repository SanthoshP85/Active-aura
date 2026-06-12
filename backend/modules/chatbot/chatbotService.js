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
  maxResponseLength: 500,       // Maximum characters in response
  maxSentences: 5,              // Maximum sentences in response
  maxContextItems: 3,           // Maximum RAG context items
  maxInsights: 2,               // Maximum insights to include
  truncateEllipsis: "...",      // Truncation indicator
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
  const limitedInsights = context.recentInsights.slice(0, RESPONSE_CONFIG.maxInsights);
  const limitedRagContext = context.ragContext.slice(0, RESPONSE_CONFIG.maxContextItems);

  let prompt = `You are Aura, an AI fitness assistant from ActiveAura. You provide personalized, data-driven fitness advice with an encouraging and supportive personality.

RESPONSE FORMAT RULES:
1. Keep responses CONCISE - maximum 3-4 sentences
2. Be direct and actionable
3. Use bullet points for multiple tips
4. No lengthy introductions or conclusions

IMPORTANT RULES:
1. Base ALL recommendations ONLY on the user's actual data provided below
2. NEVER hallucinate or invent statistics
3. Be specific with numbers from their data
4. If insufficient data, say "I need more data to provide a recommendation"
5. Use encouraging, supportive, and motivational tone
6. Give actionable, specific advice
7. Always cite the data you're using
8. Be friendly and helpful, celebrating user achievements

USER DATA:
${JSON.stringify(context.userProfile, null, 2)}

ACTIVE GOAL:
${context.activeGoal ? JSON.stringify(context.activeGoal, null, 2) : "No active goal set"}

TODAY'S METRICS:
${context.todayMetrics ? JSON.stringify(context.todayMetrics, null, 2) : "No data logged today"}

WEEK SUMMARY:
${JSON.stringify(context.weekActivities, null, 2)}

INSIGHTS TO CONSIDER:
${limitedInsights.map((i) => `- ${i.title}: ${i.recommendation}`).join("\n")}

RELEVANT CONTEXT:
${limitedRagContext.join("\n")}

Now, respond to the user's query based ONLY on this data. Keep your response concise and actionable.`;

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

  // Limit by character count
  if (truncated.length > RESPONSE_CONFIG.maxResponseLength) {
    truncated = truncated.substring(0, RESPONSE_CONFIG.maxResponseLength);
    // Try to end at a sentence boundary
    const lastSentenceEnd = Math.max(
      truncated.lastIndexOf("."),
      truncated.lastIndexOf("!"),
      truncated.lastIndexOf("?")
    );
    if (lastSentenceEnd > RESPONSE_CONFIG.maxResponseLength * 0.5) {
      truncated = truncated.substring(0, lastSentenceEnd + 1);
    } else {
      truncated += RESPONSE_CONFIG.truncateEllipsis;
    }
  }

  // Limit by sentence count
  const sentences = truncated.match(/[^.!?]+[.!?]+/g) || [truncated];
  if (sentences.length > RESPONSE_CONFIG.maxSentences) {
    truncated = sentences.slice(0, RESPONSE_CONFIG.maxSentences).join(" ").trim();
  }

  return truncated;
};

/**
 * Format response for consistency
 */
const formatResponse = (response) => {
  if (!response) return response;

  // Clean up extra whitespace
  let formatted = response.replace(/\s+/g, " ").trim();

  // Remove any incomplete sentences at the end
  if (!formatted.match(/[.!?]$/)) {
    const lastPunctuation = Math.max(
      formatted.lastIndexOf("."),
      formatted.lastIndexOf("!"),
      formatted.lastIndexOf("?")
    );
    if (lastPunctuation > formatted.length * 0.7) {
      formatted = formatted.substring(0, lastPunctuation + 1);
    }
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
      maxTokens: 200,  // Limit LLM output tokens
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
  const lines = response.split("\n").filter(line => line.trim());
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
