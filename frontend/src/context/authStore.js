/**
 * Auth Store
 * Zustand store for authentication state
 * Token is stored in localStorage, user data in context
 */

import { create } from "zustand";
import { authService } from "../services/authService";

const TOKEN_KEY = "token";

export const useAuthStore = create((set, get) => ({
  // State - Initialize from localStorage
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
  isLoading: false,
  error: null,
  sessionChecked: false,

  // Actions
  signup: async (signupData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.signup(signupData);
      // authService returns response.data.data due to API response mapping
      const userData = response;
      const { user, token } = userData;

      // Store token in localStorage
      localStorage.setItem(TOKEN_KEY, token);

      set({
        user,
        token,
        isLoading: false,
      });

      return userData;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Signup failed";
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  login: async (emailOrPhone, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(emailOrPhone, password);
      // authService returns response.data.data due to API response mapping
      const loginData = response;
      const { user, token } = loginData;

      // Store token in localStorage
      localStorage.setItem(TOKEN_KEY, token);

      set({
        user,
        token,
        isLoading: false,
      });

      return loginData;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Login failed";
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  // Check session on app load - only if token exists
  checkSession: async () => {
    const token = get().token;

    // Only check session if we have a token
    if (!token) {
      set({ sessionChecked: true });
      return null;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await authService.getCurrentUser();
      // authService already returns the unwrapped data (response.data.data)
      const user = response;

      set({
        user,
        isLoading: false,
        sessionChecked: true,
      });

      return user;
    } catch (error) {
      // Token is invalid or expired
      localStorage.removeItem(TOKEN_KEY);
      set({
        user: null,
        token: null,
        isLoading: false,
        sessionChecked: true,
      });
      return null;
    }
  },

  // Update user profile
  updateUserProfile: async (updateData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.updateProfile(updateData);
      // authService already returns the unwrapped data (response.data.data)
      const user = response;

      set({
        user,
        isLoading: false,
      });

      return user;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Update failed";
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({
      user: null,
      token: null,
      error: null,
      sessionChecked: true,
    });
  },

  updateUser: (userData) => {
    set({ user: userData });
  },

  clearError: () => set({ error: null }),
}));
