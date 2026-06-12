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
  let prompt = `You are Aura, an AI fitness assistant from ActiveAura. You provide personalized, data-driven fitness advice with an encouraging and supportive personality.
  
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
${JSON.stringify(context, null, 2)}

INSIGHTS TO CONSIDER:
${context.recentInsights
  .map((i) => `- ${i.title}: ${i.recommendation}`)
  .join("\n")}

RETRIEVED CONTEXT FROM PREVIOUS SUMMARIES:
${context.ragContext.join("\n\n")}

Now, respond to the user's query based ONLY on this data.`;

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
 * Main chatbot response function
 */
const getChatbotResponse = async (userId, userQuery) => {
  try {
    // Prepare context
    const context = await prepareContext(userId, userQuery);
    if (!context) {
      return {
        summary: "Unable to process request",
        recommendation: "Please try again",
        confidenceScore: 0,
      };
    }

    // Build system prompt
    const systemPrompt = buildSystemPrompt(context);

    // Get LLM response
    const llmResponse = await callLLM(userQuery, systemPrompt);

    // Calculate confidence score
    const confidenceScore = calculateConfidenceScore(context);

    return {
      summary: llmResponse,
      recommendation: extractRecommendation(llmResponse),
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
  // Simple extraction - in production, use more sophisticated parsing
  const lines = response.split("\n");
  const recommendation =
    lines.find((line) => line.toLowerCase().includes("recommend")) || lines[0];
  return recommendation?.substring(0, 200) || response.substring(0, 200);
};

module.exports = {
  prepareContext,
  buildSystemPrompt,
  callLLM,
  getChatbotResponse,
  calculateConfidenceScore,
};
