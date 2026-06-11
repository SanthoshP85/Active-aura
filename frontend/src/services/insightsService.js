/**
 * Insights Service
 * API calls for insights endpoints
 */

import api from "./api";

export const insightsService = {
  /**
   * Get all insights
   */
  getInsights: async () => {
    const response = await api.get("/insights");
    // Backend returns { success, data: { userId, generatedAt, insights: [...] } }
    return response.data.data?.insights || response.data.insights || [];
  },

  /**
   * Get insights for specific duration
   */
  getInsightsByDuration: async (days = 7) => {
    const response = await api.get("/insights", {
      params: { days },
    });
    // Backend returns { success, data: { userId, generatedAt, insights: [...] } }
    return response.data.data?.insights || response.data.insights || [];
  },

  /**
   * Get calorie trend insight
   */
  getCalorieTrend: async (days = 7) => {
    const response = await api.get("/insights/calorie-trend", {
      params: { days },
    });
    return response.data.data?.insights || response.data.insights || [];
  },

  /**
   * Get weight plateau insight
   */
  getWeightPlateau: async (days = 30) => {
    const response = await api.get("/insights/weight-plateau", {
      params: { days },
    });
    return response.data.data;
  },

  /**
   * Get overtraining insight
   */
  getOvertraining: async (days = 7) => {
    const response = await api.get("/insights/overtraining", {
      params: { days },
    });
    return response.data.data;
  },

  /**
   * Get goal progress insight
   */
  getGoalProgress: async (goalId) => {
    const response = await api.get(`/insights/goal/${goalId}`);
    return response.data.data;
  },
};
