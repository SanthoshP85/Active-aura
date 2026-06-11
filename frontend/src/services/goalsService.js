/**
 * Goals Service
 * API calls for fitness goals endpoints
 */

import api from "./api";

export const goalsService = {
  /**
   * Create goal
   */
  createGoal: async (goalData) => {
    const response = await api.post("/goals", goalData);
    return response.data.data;
  },

  /**
   * Get all goals
   */
  getGoals: async () => {
    const response = await api.get("/goals");
    return response.data.data;
  },

  /**
   * Get active goal
   */
  getActiveGoal: async () => {
    const response = await api.get("/goals/active");
    return response.data.data;
  },

  /**
   * Get goal by ID
   */
  getGoal: async (goalId) => {
    const response = await api.get(`/goals/${goalId}`);
    return response.data.data;
  },

  /**
   * Update goal
   */
  updateGoal: async (goalId, goalData) => {
    const response = await api.put(`/goals/${goalId}`, goalData);
    return response.data.data;
  },

  /**
   * Delete goal
   */
  deleteGoal: async (goalId) => {
    const response = await api.delete(`/goals/${goalId}`);
    return response.data.data;
  },

  /**
   * Get goal progress
   */
  getProgress: async (goalId) => {
    const response = await api.get(`/goals/${goalId}/progress`);
    return response.data.data;
  },

  /**
   * Complete goal
   */
  completeGoal: async (goalId) => {
    const response = await api.post(`/goals/${goalId}/complete`);
    return response.data.data;
  },
};
