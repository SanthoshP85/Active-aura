/**
 * Storage Utilities
 * Local storage helper functions
 */

/**
 * Set item in localStorage
 */
export const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("LocalStorage set error:", error);
  }
};

/**
 * Get item from localStorage
 */
export const getStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("LocalStorage get error:", error);
    return defaultValue;
  }
};

/**
 * Remove item from localStorage
 */
export const removeStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("LocalStorage remove error:", error);
  }
};

/**
 * Clear all localStorage
 */
export const clearStorage = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error("LocalStorage clear error:", error);
  }
};
