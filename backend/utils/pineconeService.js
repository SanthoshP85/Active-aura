/**
 * Pinecone Vector Store Service
 * Handles vector embeddings and similarity search using Pinecone
 * Replaces Upstash Vector DB for better reliability
 */

const { Pinecone } = require("@pinecone-database/pinecone");
const hfService = require("./huggingFaceService");

class PineconeVectorStore {
  constructor() {
    this.pinecone = null;
    this.index = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      const apiKey = process.env.PINECONE_API_KEY;
      const indexName = process.env.PINECONE_INDEX_NAME;

      if (!apiKey || !indexName) {
        console.warn(
          "⚠️ Pinecone not configured. Set PINECONE_API_KEY and PINECONE_INDEX_NAME",
        );
        return;
      }

      this.pinecone = new Pinecone({
        apiKey: apiKey,
      });

      this.index = this.pinecone.index(indexName);
      this.isInitialized = true;

      console.log("✅ Pinecone Vector Store initialized");
    } catch (error) {
      console.error("❌ Failed to initialize Pinecone:", error.message);
      throw error;
    }
  }

  /**
   * Upsert vector data to Pinecone
   */
  async upsertVector(id, text, metadata = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.index) {
      console.warn("⚠️ Pinecone not available, skipping vector store");
      return null;
    }

    try {
      // Generate embedding
      const embedding = await hfService.generateQueryEmbedding(text);

      // Validate embedding
      if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new Error(
          `Invalid embedding: expected non-empty array, got ${JSON.stringify(embedding)}`,
        );
      }

      // Upsert to Pinecone
      await this.index.upsert([
        {
          id: id,
          values: embedding,
          metadata: {
            text: text.substring(0, 1000), // Store first 1000 chars
            ...metadata,
            timestamp: new Date().toISOString(),
          },
        },
      ]);

      console.log(`✅ Vector stored in Pinecone: ${id}`);
      return id;
    } catch (error) {
      console.error(`❌ Failed to upsert vector to Pinecone: ${error.message}`);
      // Don't re-throw - allow graceful degradation
      return null;
    }
  }

  /**
   * Search for similar vectors
   */
  async searchSimilar(query, topK = 5) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.index) {
      console.warn("⚠️ Pinecone not available, skipping search");
      return [];
    }

    try {
      // Generate query embedding
      const queryEmbedding = await hfService.generateQueryEmbedding(query);

      // Search in Pinecone
      const results = await this.index.query({
        vector: queryEmbedding,
        topK: topK,
        includeMetadata: true,
      });

      return results.matches.map((match) => ({
        id: match.id,
        score: match.score,
        text: match.metadata?.text || "",
        metadata: match.metadata,
      }));
    } catch (error) {
      console.error(`❌ Failed to search Pinecone: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete vector from Pinecone
   */
  async deleteVector(id) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.index) {
      console.warn("⚠️ Pinecone not available, skipping delete");
      return null;
    }

    try {
      await this.index.deleteOne(id);
      console.log(`✅ Vector deleted from Pinecone: ${id}`);
      return id;
    } catch (error) {
      console.error(
        `❌ Failed to delete vector from Pinecone: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Clear all vectors (use with caution!)
   */
  async deleteAll() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.index) {
      console.warn("⚠️ Pinecone not available, skipping clear");
      return null;
    }

    try {
      await this.index.deleteAll();
      console.log("✅ All vectors deleted from Pinecone");
    } catch (error) {
      console.error(`❌ Failed to clear Pinecone: ${error.message}`);
      throw error;
    }
  }
}

// Singleton instance
let instance = null;

const getPineconeService = () => {
  if (!instance) {
    instance = new PineconeVectorStore();
  }
  return instance;
};

module.exports = {
  PineconeVectorStore,
  getPineconeService,
};
