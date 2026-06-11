/**
 * Data Store
 * Zustand store for app data
 */

import { create } from "zustand";
import { caloriesService } from "../services/caloriesService";
import { activitiesService } from "../services/activitiesService";
import { goalsService } from "../services/goalsService";
import { insightsService } from "../services/insightsService";
import { userService } from "../services/userService";

export const useDataStore = create((set) => ({
  // State
  calories: {
    daily: null,
    history: [],
    trends: null,
    isLoading: false,
  },
  activities: {
    daily: [],
    history: [],
    weekly: null,
    trends: null,
    isLoading: false,
  },
  goals: {
    all: [],
    active: null,
    isLoading: false,
  },
  insights: {
    all: [],
    isLoading: false,
  },
  user: {
    weightHistory: [],
    streak: null,
    isLoading: false,
  },

  // Calories actions
  fetchDailyCalories: async (date) => {
    set((state) => ({ calories: { ...state.calories, isLoading: true } }));
    try {
      const response = await caloriesService.getDailySummary(date);
      set((state) => ({
        calories: { ...state.calories, daily: response, isLoading: false },
      }));
      return response;
    } catch (error) {
      set((state) => ({ calories: { ...state.calories, isLoading: false } }));
      throw error;
    }
  },

  logFood: async (foodData) => {
    try {
      const response = await caloriesService.logFood(foodData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  fetchCalorieHistory: async (startDate, endDate) => {
    set((state) => ({ calories: { ...state.calories, isLoading: true } }));
    try {
      const response = await caloriesService.getHistory(startDate, endDate);
      set((state) => ({
        calories: {
          ...state.calories,
          history: response,
          isLoading: false,
        },
      }));
      return response;
    } catch (error) {
      set((state) => ({ calories: { ...state.calories, isLoading: false } }));
      throw error;
    }
  },

  // Activities actions
  fetchDailyActivities: async (date) => {
    set((state) => ({ activities: { ...state.activities, isLoading: true } }));
    try {
      const response = await activitiesService.getDailyActivities(date);
      set((state) => ({
        activities: {
          ...state.activities,
          daily: response,
          isLoading: false,
        },
      }));
      return response;
    } catch (error) {
      set((state) => ({
        activities: { ...state.activities, isLoading: false },
      }));
      throw error;
    }
  },

  logActivity: async (activityData) => {
    try {
      const response = await activitiesService.logActivity(activityData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Goals actions
  fetchGoals: async () => {
    set((state) => ({ goals: { ...state.goals, isLoading: true } }));
    try {
      const response = await goalsService.getGoals();
      set((state) => ({
        goals: { ...state.goals, all: response, isLoading: false },
      }));
      return response;
    } catch (error) {
      set((state) => ({ goals: { ...state.goals, isLoading: false } }));
      throw error;
    }
  },

  createGoal: async (goalData) => {
    try {
      const response = await goalsService.createGoal(goalData);
      set((state) => ({
        goals: { ...state.goals, all: [...state.goals.all, response] },
      }));
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Insights actions
  fetchInsights: async (days = 7) => {
    set((state) => ({ insights: { ...state.insights, isLoading: true } }));
    try {
      const response = await insightsService.getInsightsByDuration(days);
      // Response is already unwrapped by insightsService
      const insightsArray = Array.isArray(response)
        ? response
        : response.insights || [];
      set((state) => ({
        insights: {
          ...state.insights,
          all: insightsArray,
          isLoading: false,
        },
      }));
      return insightsArray;
    } catch (error) {
      set((state) => ({ insights: { ...state.insights, isLoading: false } }));
      throw error;
    }
  },

  // User actions
  fetchWeightHistory: async (days = 30) => {
    set((state) => ({ user: { ...state.user, isLoading: true } }));
    try {
      const response = await userService.getWeightHistory(days);
      set((state) => ({
        user: { ...state.user, weightHistory: response, isLoading: false },
      }));
      return response;
    } catch (error) {
      set((state) => ({ user: { ...state.user, isLoading: false } }));
      throw error;
    }
  },

  fetchStreak: async () => {
    set((state) => ({ user: { ...state.user, isLoading: true } }));
    try {
      const response = await userService.getStreak();
      set((state) => ({
        user: { ...state.user, streak: response, isLoading: false },
      }));
      return response;
    } catch (error) {
      set((state) => ({ user: { ...state.user, isLoading: false } }));
      throw error;
    }
  },
}));
