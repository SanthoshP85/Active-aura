/**
 * User Service
 * API calls for user endpoints
 */

import api from "./api";

export const userService = {
  /**
   * Get user profile
   */
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (userData) => {
    const response = await api.put("/users/profile", userData);
    return response.data.data;
  },

  /**
   * Get user statistics
   */
  getStats: async () => {
    const response = await api.get("/users/profile");
    return response.data.data;
  },

  /**
   * Update password
   */
  updatePassword: async (oldPassword, newPassword, confirmPassword) => {
    const response = await api.put("/users/change-password", {
      currentPassword: oldPassword,
      newPassword,
      confirmPassword,
    });
    return response.data.data;
  },

  /**
   * Get weight history
   */
  getWeightHistory: async (days = 30) => {
    const response = await api.get("/users/weight-history", {
      params: { days },
    });
    return response.data.data;
  },

  /**
   * Get logging streak
   */
  getStreak: async () => {
    const response = await api.get("/users/streak");
    return response.data.data;
  },
};
