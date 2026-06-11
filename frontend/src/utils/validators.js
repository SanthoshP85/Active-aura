/**
 * Validators
 * Input validation utilities
 */

/**
 * Validate email
 */
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate phone number (basic)
 */
export const validatePhone = (phone) => {
  const regex = /^\+?1?\d{9,15}$/;
  return regex.test(phone.replace(/[\s\-\(\)]/g, ""));
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  return {
    isValid: password.length >= 6,
    hasMinLength: password.length >= 6,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*]/.test(password),
  };
};

/**
 * Validate required field
 */
export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== "";
};

/**
 * Validate age
 */
export const validateAge = (age) => {
  const ageNum = Number(age);
  return ageNum >= 13 && ageNum <= 120;
};

/**
 * Validate weight
 */
export const validateWeight = (weight) => {
  const weightNum = Number(weight);
  return weightNum >= 30 && weightNum <= 500;
};

/**
 * Validate height
 */
export const validateHeight = (height) => {
  const heightNum = Number(height);
  return heightNum >= 100 && heightNum <= 250;
};

/**
 * Validate calorie target
 */
export const validateCalorieTarget = (calories) => {
  const calorieNum = Number(calories);
  return calorieNum >= 1000 && calorieNum <= 5000;
};

/**
 * Get validation error message
 */
export const getValidationError = (field, value) => {
  if (!validateRequired(value)) return `${field} is required`;

  switch (field.toLowerCase()) {
    case "email":
      return validateEmail(value) ? "" : "Invalid email format";
    case "phone":
      return validatePhone(value) ? "" : "Invalid phone number";
    case "password":
      return validatePassword(value).isValid
        ? ""
        : "Password must be at least 6 characters";
    case "age":
      return validateAge(value) ? "" : "Age must be between 13 and 120";
    case "weight":
      return validateWeight(value)
        ? ""
        : "Weight must be between 30 and 500 kg";
    case "height":
      return validateHeight(value)
        ? ""
        : "Height must be between 100 and 250 cm";
    default:
      return "";
  }
};
