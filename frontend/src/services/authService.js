/**
 * Authentication Service
 * API calls for auth endpoints
 */

import api from "./api";

/**
 * Signup user
 */
export const authService = {
  signup: async (userData) => {
    const response = await api.post("/auth/signup", userData);
    return response.data.data;
  },

  /**
   * Login user
   */
  login: async (emailOrPhone, password) => {
    const response = await api.post("/auth/login", {
      email: emailOrPhone.includes("@") ? emailOrPhone : null,
      phone: emailOrPhone.includes("@") ? null : emailOrPhone,
      password,
    });
    return response.data.data;
  },

  /**
   * Get current user (session/profile)
   */
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (updateData) => {
    const response = await api.put("/users/profile", updateData);
    return response.data.data;
  },

  /**
   * Logout (client-side only)
   */
  logout: () => {
    // Remove token from storage - handled by store
    return Promise.resolve();
  },
};
