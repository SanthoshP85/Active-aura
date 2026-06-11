/**
 * Constants
 * App-wide configuration values
 */

/**
 * Get API Base URL
 * Supports both local development and ngrok tunneling
 * Reads from VITE_API_URL environment variable
 */
const getApiBaseUrl = () => {
  // Get from Vite environment variable (prefixed with VITE_)
  const envUrl = import.meta.env.VITE_API_URL;

  if (envUrl) {
    console.log("🔗 API URL from env:", envUrl);
    return envUrl;
  }

  // Default fallback to localhost
  console.log("🔗 Using default localhost API URL");
  return "http://localhost:5000/api";
};

export const API_BASE_URL = getApiBaseUrl();
export const APP_NAME = import.meta.env.VITE_APP_NAME || "ActiveAura";

/**
 * Function to get current API URL (for potential runtime changes)
 */
export const getCurrentApiUrl = () => {
  return import.meta.env.VITE_API_URL || "http://localhost:5000/api";
};

export const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snacks"];
export const ACTIVITY_TYPES = [
  "running",
  "cycling",
  "swimming",
  "walking",
  "gym",
  "yoga",
  "pilates",
  "cardio",
  "strength",
  "sports",
  "other",
];

export const INTENSITY_LEVELS = ["low", "moderate", "high", "very_high"];
export const ACTIVITY_LEVELS = [
  "sedentary",
  "light",
  "moderate",
  "active",
  "very_active",
];
export const FITNESS_GOALS = [
  "weight_loss",
  "muscle_gain",
  "endurance",
  "flexibility",
  "general_health",
];

export const GENDER_OPTIONS = ["male", "female", "other"];

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export const TOKEN_KEY = "auth_token";
export const USER_KEY = "user_data";

// Time durations in milliseconds
export const DURATIONS = {
  TOAST_DURATION: 3000,
  DEBOUNCE_DELAY: 300,
  API_TIMEOUT: 10000,
};
