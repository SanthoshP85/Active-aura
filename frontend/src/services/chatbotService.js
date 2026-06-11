/**
 * Chatbot Service
 * API calls for chatbot endpoints
 */

import api from "./api";

export const chatbotService = {
  /**
   * Send message to chatbot
   */
  sendMessage: async (message) => {
    const response = await api.post("/chatbot/message", {
      message,
    });
    return response.data.data;
  },

  /**
   * Get chat history
   */
  getHistory: async (limit = 50) => {
    const response = await api.get("/chatbot/history", {
      params: { limit },
    });
    return response.data.data;
  },

  /**
   * Get chatbot context
   */
  getContext: async () => {
    const response = await api.get("/chatbot/context");
    return response.data.data;
  },

  /**
   * Clear chat history
   */
  clearHistory: async () => {
    const response = await api.delete("/chatbot/history");
    return response.data.data;
  },
};
