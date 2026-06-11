/**
 * User Store
 * Zustand store for user data
 */

import { create } from "zustand";
import { userService } from "../services/userService";

export const useUserStore = create((set) => ({
  // State
  profile: null,
  stats: null,
  isLoading: false,
  error: null,

  // Actions
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getProfile();
      set({ profile: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to fetch profile";
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getStats();
      set({ stats: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to fetch stats";
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  updateProfile: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.updateProfile(userData);
      set({ profile: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to update profile";
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  updatePassword: async (oldPassword, newPassword, confirmPassword) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.updatePassword(
        oldPassword,
        newPassword,
        confirmPassword,
      );
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to update password";
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
