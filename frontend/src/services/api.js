/**
 * Axios Instance
 * Centralized API configuration
 */

import axios from "axios";
import { API_BASE_URL } from "../utils/constants";
import { useUIStore } from "../context/uiStore";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor - Add token to headers
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response Interceptor - Handle errors globally
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { showError } = useUIStore.getState();

    // Extract error message from response
    let errorMessage = "An unexpected error occurred";

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errors) {
      // Handle validation errors - join all error messages
      const errors = error.response.data.errors;
      if (typeof errors === "object") {
        errorMessage = Object.values(errors).join(". ");
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Handle specific status codes
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      errorMessage = "Session expired. Please log in again.";
    } else if (error.response?.status === 403) {
      errorMessage = "You don't have permission to perform this action.";
    } else if (error.response?.status === 404) {
      errorMessage =
        error.response.data?.message || "The requested resource was not found.";
    } else if (error.response?.status === 500) {
      errorMessage = "Server error. Please try again later.";
    } else if (!error.response) {
      errorMessage = "Network error. Please check your connection.";
    }

    // Show error banner
    showError(errorMessage);

    return Promise.reject(error);
  },
);

export default api;
