/**
 * Activities Service
 * API calls for workout/activity endpoints
 */

import api from "./api";

export const activitiesService = {
  /**
   * Log activity
   */
  logActivity: async (activityData) => {
    const response = await api.post("/activities/log", activityData);
    return response.data.data;
  },

  /**
   * Get activity by ID
   */
  getActivity: async (activityId) => {
    const response = await api.get(`/activities/${activityId}`);
    return response.data.data;
  },

  /**
   * Update activity
   */
  updateActivity: async (activityId, activityData) => {
    const response = await api.put(`/activities/${activityId}`, activityData);
    return response.data.data;
  },

  /**
   * Delete activity
   */
  deleteActivity: async (activityId) => {
    const response = await api.delete(`/activities/${activityId}`);
    return response.data.data;
  },

  /**
   * Get daily activities
   */
  getDailyActivities: async (date) => {
    const response = await api.get("/activities/daily", {
      params: { date: date.toISOString().split("T")[0] },
    });
    return response.data.data;
  },

  /**
   * Get activity history
   */
  getHistory: async (startDate, endDate) => {
    const response = await api.get("/activities/history", {
      params: {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
    });
    return response.data.data;
  },

  /**
   * Get weekly summary
   */
  getWeeklySummary: async (weekStartDate) => {
    const response = await api.get("/activities/weekly", {
      params: { date: weekStartDate.toISOString().split("T")[0] },
    });
    return response.data.data;
  },

  /**
   * Get activity trends
   */
  getTrends: async (days = 30) => {
    const response = await api.get("/activities/trends", {
      params: { days },
    });
    return response.data.data;
  },
};
