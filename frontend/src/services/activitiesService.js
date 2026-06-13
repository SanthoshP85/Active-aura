/**
 * Activities Service
 * API calls for workout/activity endpoints
 */

import api from "./api";

// Helper to format date in local timezone
const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

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
    // Format date in local timezone to avoid UTC conversion issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const response = await api.get("/activities/daily", {
      params: { date: dateStr },
    });
    // Backend returns { date, count, activities }, extract the activities array
    return response.data.data?.activities || [];
  },

  /**
   * Get activity history
   */
  getHistory: async (startDate, endDate) => {
    // Format dates in local timezone
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    const response = await api.get("/activities/history", {
      params: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
      },
    });
    return response.data.data;
  },

  /**
   * Get weekly summary
   */
  getWeeklySummary: async (weekStartDate) => {
    const response = await api.get("/activities/weekly", {
      params: { date: formatLocalDate(weekStartDate) },
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
