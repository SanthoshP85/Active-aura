/**
 * useData Hook
 * Custom hook for app data
 */

import { useDataStore } from "../context/dataStore";

export const useData = () => {
  const {
    calories,
    activities,
    goals,
    insights,
    user,
    fetchDailyCalories,
    logFood,
    fetchCalorieHistory,
    fetchDailyActivities,
    logActivity,
    fetchGoals,
    createGoal,
    fetchInsights,
    fetchWeightHistory,
    fetchStreak,
  } = useDataStore();

  return {
    calories,
    activities,
    goals,
    insights,
    user,
    fetchDailyCalories,
    logFood,
    fetchCalorieHistory,
    fetchDailyActivities,
    logActivity,
    fetchGoals,
    createGoal,
    fetchInsights,
    fetchWeightHistory,
    fetchStreak,
  };
};
