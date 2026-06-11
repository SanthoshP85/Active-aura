/**
 * HuggingFace Unified AI Service
 * Integrates HuggingFace models for:
 * - LLM (text generation) - using HuggingFace Router API (https://router.huggingface.co/v1)
 * - Embeddings (vector representations)
 * - Used by chatbot, insights, and RAG pipeline
 *
 * MATCHES ChatBotLearn backend implementation
 */

const { OpenAI } = require("openai");
const { HfInference } = require("@huggingface/inference");

class HuggingFaceAIService {
  constructor() {
    this.openaiClient = null;
    this.hfInference = null;
    this.hfApiKey = null;
    this.embeddingProvider = null;
    this.isInitialized = false;
  }

  initialize() {
    if (this.isInitialized) return;

    const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;

    if (!hfToken) {
      throw new Error(
        "HuggingFace API key not found. Set HF_TOKEN or HUGGINGFACE_API_KEY",
      );
    }

    this.hfApiKey = hfToken;

    // Initialize OpenAI client pointing to HuggingFace Router
    // This is the same approach used in ChatBotLearn
    this.openaiClient = new OpenAI({
      baseURL: "https://router.huggingface.co/v1",
      apiKey: hfToken,
    });

    // Initialize HF Inference for embeddings
    this.hfInference = new HfInference(hfToken);

    // Set embedding provider (from .env, defaults to huggingface_api)
    this.embeddingProvider =
      process.env.EMBEDDING_PROVIDER || "huggingface_api";

    this.isInitialized = true;
    console.log(
      "✅ HuggingFace AI Service initialized with provider:",
      this.embeddingProvider,
    );
    console.log(
      "Using HuggingFace Router API (https://router.huggingface.co/v1)",
    );
  }

  /**
   * Call LLM for text generation using HuggingFace Router API
   * Uses OpenAI client with HuggingFace Router as baseURL
   * SAME APPROACH AS CHATBOTLEARN
   */
  async callLLM(userQuery, systemPrompt, options = {}) {
    if (!this.isInitialized) this.initialize();

    const models = [
      "meta-llama/Meta-Llama-3-8B-Instruct",
      "microsoft/DialoGPT-medium",
      "HuggingFaceH4/zephyr-7b-beta",
      "mistralai/Mistral-7B-Instruct-v0.1",
    ];

    let lastError = null;

    for (const model of models) {
      try {
        console.log(`🤖 Trying HuggingFace model: ${model}`);

        const chatCompletion = await this.openaiClient.chat.completions.create({
          model: model,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userQuery,
            },
          ],
          max_tokens: options.maxTokens || 512,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.95,
        });

        console.log(`✅ Successfully used model: ${model}`);
        return chatCompletion.choices[0].message.content;
      } catch (modelError) {
        console.log(`⚠️ Model ${model} failed:`, modelError.message);
        lastError = modelError;
        continue;
      }
    }

    // All models failed
    console.error("❌ All HuggingFace models failed:", lastError?.message);
    throw lastError;
  }

  /**
   * Generate embeddings for text (for vector search, insights comparison)
   * Uses HuggingFace Inference API with fallback to mock embeddings
   */
  async generateEmbeddings(texts) {
    if (!this.isInitialized) this.initialize();

    try {
      // Handle both single string and array of strings
      const input = Array.isArray(texts) ? texts : [texts];

      console.log(
        `📊 Generating embeddings for ${input.length} text(s) using ${this.embeddingProvider}...`,
      );

      // Use HuggingFace Inference API for feature extraction
      const embeddings = await this.hfInference.featureExtraction({
        model:
          process.env.HUGGINGFACE_EMBEDDING_MODEL ||
          "sentence-transformers/all-MiniLM-L6-v2",
        inputs: input,
      });

      // Normalize: return array of arrays
      if (!Array.isArray(embeddings[0])) {
        return [embeddings]; // Single embedding
      }

      return embeddings; // Multiple embeddings
    } catch (error) {
      console.warn(`⚠️ HuggingFace Inference API failed: ${error.message}`);
      console.log(`📊 Falling back to mock embeddings (384-dim)...`);

      // Fallback to mock embeddings
      const input = Array.isArray(texts) ? texts : [texts];
      return input.map((text) => this.generateMockEmbedding(text));
    }
  }

  /**
   * Generate mock embedding (384-dimensional vector)
   * Used when HuggingFace API is unavailable
   */
  generateMockEmbedding(text) {
    // Simple hash-based mock embedding
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    const embedding = [];
    const dimensions =
      parseInt(process.env.HUGGINGFACE_EMBEDDING_DIMENSIONS) || 384;

    for (let i = 0; i < dimensions; i++) {
      // Deterministic pseudo-random values based on hash and index
      const seed = hash + i;
      const x = Math.sin(seed) * Math.cos(seed + 1);
      // Normalize to reasonable range: -1 to 1, then round to 4 decimal places
      const normalized =
        Math.round(Math.max(-1, Math.min(1, x)) * 10000) / 10000;
      embedding.push(normalized);
    }

    return embedding;
  }

  /**
   * Generate embedding for a single query
   * Used for similarity search
   */
  async generateQueryEmbedding(query) {
    const embeddings = await this.generateEmbeddings(query);
    return embeddings[0] || embeddings;
  }

  /**
   * Generate insight recommendations using HuggingFace Router
   * SAME APPROACH AS callLLM - using OpenAI client with HF Router
   */
  async generateInsight(insightType, userData, options = {}) {
    if (!this.isInitialized) this.initialize();

    const systemPrompts = {
      calorie_trend: `You are a nutrition coach. Analyze the user's calorie data and provide a SHORT (1-2 sentences) personalized actionable recommendation. Be specific with numbers.`,

      weight_plateau: `You are a fitness coach. Based on the user's weight data, provide a SHORT (1-2 sentences) personalized recommendation about weight trends.`,

      overtraining: `You are a recovery specialist. Analyze the user's activity data and provide a SHORT (1-2 sentences) recommendation about training frequency and rest days.`,

      goal_progress: `You are a motivational coach. Based on the user's goal progress, provide a SHORT (1-2 sentences) personalized motivational message and next steps.`,

      macro_distribution: `You are a macro nutrition expert. Analyze the user's macro distribution and provide a SHORT (1-2 sentences) specific recommendation.`,
    };

    const userPrompt = `User Data:\n${JSON.stringify(userData, null, 2)}\n\nProvide your recommendation:`;
    const systemPrompt =
      systemPrompts[insightType] || systemPrompts.calorie_trend;

    // Use model fallback chain like callLLM
    const models = [
      process.env.HUGGINGFACE_CHAT_MODEL ||
        "meta-llama/Meta-Llama-3-8B-Instruct",
      "meta-llama/Meta-Llama-3-8B-Instruct",
      "microsoft/DialoGPT-medium",
      "HuggingFaceH4/zephyr-7b-beta",
    ];

    let lastError = null;

    for (const model of models) {
      try {
        console.log(`💬 Generating ${insightType} insight using ${model}...`);

        const chatCompletion = await this.openaiClient.chat.completions.create({
          model: model,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          max_tokens: 150,
          temperature: 0.5,
          top_p: 0.9,
        });

        console.log(`✅ Insight generated successfully with ${model}`);
        return chatCompletion.choices[0].message.content;
      } catch (modelError) {
        console.log(`⚠️ Model ${model} failed: ${modelError.message}`);
        lastError = modelError;
        // Continue to next model
      }
    }

    // All models failed, return fallback
    console.warn(
      `⚠️ Failed to generate ${insightType} insight: ${lastError?.message}`,
    );
    return this.getFallbackInsight(insightType);
  }

  /**
   * Fallback insights for when API fails
   */
  getFallbackInsight(insightType) {
    const fallbacks = {
      calorie_trend:
        "Keep tracking your meals consistently. Aim to match your daily calorie target for steady progress.",
      weight_plateau:
        "Weight fluctuates naturally. Focus on trends over weeks rather than daily changes.",
      overtraining:
        "Ensure you have adequate rest days (1-2 per week) for recovery.",
      goal_progress:
        "You're making progress! Continue with your current routine and stay consistent.",
      macro_distribution:
        "Your macros look balanced. Continue with your current approach.",
    };

    return fallbacks[insightType] || fallbacks.calorie_trend;
  }

  /**
   * Compare similarity between two texts
   * Used for finding related insights or messages
   */
  async calculateSimilarity(text1, text2) {
    try {
      const [embedding1, embedding2] = await this.generateEmbeddings([
        text1,
        text2,
      ]);

      // Cosine similarity
      const dotProduct = embedding1.reduce(
        (sum, a, i) => sum + a * embedding2[i],
        0,
      );
      const magnitude1 = Math.sqrt(
        embedding1.reduce((sum, a) => sum + a * a, 0),
      );
      const magnitude2 = Math.sqrt(
        embedding2.reduce((sum, a) => sum + a * a, 0),
      );

      const similarity = dotProduct / (magnitude1 * magnitude2);
      return similarity;
    } catch (error) {
      console.error("Similarity calculation failed:", error.message);
      return 0;
    }
  }

  /**
   * Generate chatbot response with RAG context
   */
  async generateChatResponse(userQuery, ragContext, userProfile = {}) {
    if (!this.isInitialized) this.initialize();

    const systemPrompt = `You are ActiveAura, a personalized AI fitness assistant. 
You provide data-driven fitness advice based on the user's actual metrics and goals.

IMPORTANT RULES:
1. Base ALL recommendations ONLY on the user's actual data provided
2. NEVER hallucinate or invent statistics
3. Be specific with numbers from their data
4. If insufficient data, ask for more information

User Profile: ${JSON.stringify(userProfile, null, 2)}

Context from user's fitness data:
${ragContext}

Provide a helpful, encouraging response.`;

    return this.callLLM(userQuery, systemPrompt, {
      maxTokens: 500,
      temperature: 0.7,
    });
  }
}

// Export singleton instance directly
module.exports = new HuggingFaceAIService();
