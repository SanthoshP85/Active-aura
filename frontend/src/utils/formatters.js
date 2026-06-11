/**
 * Formatters
 * Data formatting utilities
 */

import { format, parseISO } from "date-fns";

/**
 * Format date to readable string
 */
export const formatDate = (date, formatStr = "MMM dd, yyyy") => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch {
    return "Invalid date";
  }
};

/**
 * Format time to HH:mm
 */
export const formatTime = (date) => {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "HH:mm");
  } catch {
    return "Invalid time";
  }
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (num, decimals = 0) => {
  return Number(num).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format calories
 */
export const formatCalories = (calories) => {
  return `${formatNumber(Math.round(calories))} kcal`;
};

/**
 * Format weight in kg
 */
export const formatWeight = (weight) => {
  return `${formatNumber(weight, 1)} kg`;
};

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  return `${formatNumber(value * 100, decimals)}%`;
};

/**
 * Format duration in minutes to hours:minutes
 */
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

/**
 * Format macro nutrients
 */
export const formatMacros = (protein, carbs, fats) => {
  return {
    protein: `${formatNumber(protein, 1)}g`,
    carbs: `${formatNumber(carbs, 1)}g`,
    fats: `${formatNumber(fats, 1)}g`,
  };
};

/**
 * Get calorie status (deficit/maintenance/surplus)
 */
export const getCalorieStatus = (consumed, target) => {
  const diff = consumed - target;
  if (Math.abs(diff) < 100) return "maintenance";
  return diff > 0 ? "surplus" : "deficit";
};

/**
 * Format weight change
 */
export const formatWeightChange = (current, goal) => {
  const diff = current - goal;
  const direction = diff > 0 ? "+" : "";
  return `${direction}${formatNumber(diff, 1)} kg`;
};
