/**
 * useUser Hook
 * Custom hook for user data
 */

import { useUserStore } from "../context/userStore";

export const useUser = () => {
  const {
    profile,
    stats,
    isLoading,
    error,
    fetchProfile,
    fetchStats,
    updateProfile,
    updatePassword,
    clearError,
  } = useUserStore();

  return {
    profile,
    stats,
    isLoading,
    error,
    fetchProfile,
    fetchStats,
    updateProfile,
    updatePassword,
    clearError,
  };
};
