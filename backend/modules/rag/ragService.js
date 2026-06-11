/**
 * RAG (Retrieval Augmented Generation) Service
 * Uses Pinecone Vector Database for context retrieval
 * Embeds user fitness data and retrieves relevant context for LLM
 */

const { getPineconeService } = require("../../utils/pineconeService");
const hfService = require("../../utils/huggingFaceService");
const { v4: uuidv4 } = require("uuid");

/**
 * Store user fitness summary in Pinecone Vector DB
 * @param {string} userId - User ID
 * @param {string} summary - Text content to embed and store
 * @param {string} dataType - Optional: "profile", "food", "activity", "goal" (for better organization)
 */
const storeFitnessSummary = async (userId, summary, dataType = "general") => {
  try {
    const pineconeService = getPineconeService();

    // Generate unique ID for this vector
    const id = `${userId}-${dataType}-${uuidv4()}`;

    // Store in Pinecone using HuggingFace embeddings
    await pineconeService.upsertVector(id, summary, {
      userId: userId.toString(),
      dataType,
      summary: summary.substring(0, 500), // Store first 500 chars
    });

    console.log(
      `✅ Stored ${dataType} vector for user ${userId} in Pinecone: ${id}`,
    );
    return id;
  } catch (error) {
    console.error(
      `❌ Error storing fitness summary in Pinecone: ${error.message}`,
    );
    return null;
  }
};

/**
 * Retrieve similar fitness context from Pinecone Vector DB
 */
const retrieveContext = async (userId, query, topK = 3) => {
  try {
    const pineconeService = getPineconeService();

    // Search similar vectors in Pinecone
    const results = await pineconeService.searchSimilar(query, topK);

    // Filter by user ID if available
    const userResults = results.filter(
      (result) => result.metadata?.userId === userId.toString(),
    );

    // Return the text content from top matches
    return userResults
      .slice(0, topK)
      .map((result) => result.metadata?.text || result.text || "");
  } catch (error) {
    console.error(
      `❌ Error retrieving context from Pinecone: ${error.message}`,
    );
    return [];
  }
};

/**
 * Generate fitness summary from user data
 */
const generateFitnessSummary = (userData) => {
  const summary = `
User Profile:
- Name: ${userData.fullName}
- Weight: ${userData.currentWeight}kg → Goal: ${userData.goalWeight}kg
- Height: ${userData.height}cm, Age: ${userData.age}
- Activity Level: ${userData.activityLevel}
- Fitness Goals: ${userData.fitnessGoals?.join(", ") || "Not specified"}

Recent Statistics:
- Daily Calories Target: ${userData.targetCalories || "Not set"}
- Current Progress: ${userData.progressPercentage || 0}%
- Active Goals: ${userData.activeGoals || 0}
- Weekly Activities: ${userData.weeklyActivities || 0}
- Average Daily Calories: ${userData.avgDailyCalories || 0}

Last 7 Days Summary:
- Total Workouts: ${userData.totalWorkouts || 0}
- Total Calories Burned: ${userData.caloriesBurned || 0}
- Avg Daily Intake: ${userData.avgIntake || 0}
- Consistency Score: ${userData.consistency || 0}%
  `.trim();

  return summary;
};

module.exports = {
  storeFitnessSummary,
  retrieveContext,
  generateFitnessSummary,
};
