/**
 * Calories Service
 * API calls for calorie tracking endpoints
 */

import api from "./api";

// Helper to format date in local timezone
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const caloriesService = {
  /**
   * Get daily calorie summary
   */
  getDailySummary: async (date) => {
    const response = await api.get("/calories/daily", {
      params: { date: formatLocalDate(date) },
    });
    return response.data.data;
  },

  /**
   * Log food item
   */
  logFood: async (foodData) => {
    const response = await api.post("/calories/log", foodData);
    return response.data.data;
  },

  /**
   * Update food item
   */
  updateFood: async (foodId, foodData) => {
    const response = await api.put(`/calories/food/${foodId}`, foodData);
    return response.data.data;
  },

  /**
   * Delete food item
   */
  deleteFood: async (foodId) => {
    const response = await api.delete(`/calories/food/${foodId}`);
    return response.data.data;
  },

  /**
   * Search food by name (using public API)
   */
  searchFood: async (query) => {
    const response = await api.get("/calories/search", {
      params: { query },
    });
    return response.data.data;
  },

  /**
   * Get calorie history
   */
  getHistory: async (startDate, endDate) => {
    const response = await api.get("/calories/history", {
      params: {
        startDate: formatLocalDate(startDate),
        endDate: formatLocalDate(endDate),
      },
    });
    return response.data.data;
  },

  /**
   * Get calorie trends
   */
  getTrends: async (days = 30) => {
    const response = await api.get("/calories/trends", {
      params: { days },
    });
    return response.data.data;
  },

  /**
   * Get macro breakdown
   */
  getMacroBreakdown: async (date) => {
    const response = await api.get("/calories/macros", {
      params: { date: formatLocalDate(date) },
    });
    return response.data.data;
  },
};
