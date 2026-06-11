/**
 * useAuth Hook
 * Custom hook for authentication
 */

import { useAuthStore } from "../context/authStore";

export const useAuth = () => {
  const {
    user,
    token,
    isLoading,
    error,
    sessionChecked,
    signup,
    login,
    checkSession,
    updateUserProfile,
    logout,
    updateUser,
    clearError,
  } = useAuthStore();

  const isAuthenticated = !!token && !!user;

  return {
    user,
    token,
    isLoading,
    error,
    sessionChecked,
    isAuthenticated,
    signup,
    login,
    checkSession,
    updateUserProfile,
    logout,
    updateUser,
    clearError,
  };
};
