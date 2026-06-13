/**
 * Validation Utility Functions
 * Input validation schemas using Joi
 */

const Joi = require("joi");

const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const phoneRegex = /^\+?1?\d{9,15}$/;

// ============ AUTH SCHEMAS ============

const signupSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Full name is required",
    "string.min": "Full name must be at least 2 characters",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email",
    "string.empty": "Email is required",
  }),
  phone: Joi.string().pattern(phoneRegex).required().messages({
    "string.pattern.base": "Please provide a valid phone number",
    "string.empty": "Phone is required",
  }),
  password: Joi.string().min(6).max(50).required().messages({
    "string.min": "Password must be at least 6 characters",
    "string.empty": "Password is required",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),
  currentWeight: Joi.number().min(30).max(500).required().messages({
    "number.base": "Current weight must be a number",
    "string.empty": "Current weight is required",
  }),
  goalWeight: Joi.number().min(30).max(500).required().messages({
    "number.base": "Goal weight must be a number",
    "string.empty": "Goal weight is required",
  }),
  height: Joi.number().min(100).max(250).required().messages({
    "number.base": "Height must be a number",
    "string.empty": "Height is required",
  }),
  age: Joi.number().min(13).max(120).required().messages({
    "number.base": "Age must be a number",
    "string.empty": "Age is required",
  }),
  gender: Joi.string().valid("male", "female", "other").required().messages({
    "any.only": "Please select a valid gender",
  }),
  activityLevel: Joi.string()
    .valid("sedentary", "light", "moderate", "active", "very_active")
    .default("moderate"),
  fitnessGoals: Joi.array().items(
    Joi.string().valid(
      "weight_loss",
      "muscle_gain",
      "endurance",
      "flexibility",
      "general_health",
    ),
  ),
});

const loginSchema = Joi.object({
  email: Joi.string().email().optional().allow(null).messages({
    "string.email": "Please provide a valid email",
  }),
  phone: Joi.string().pattern(phoneRegex).optional().allow(null).messages({
    "string.pattern.base": "Please provide a valid phone number",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
}).external(async (value) => {
  if (!value.email && !value.phone) {
    throw new Error("Either email or phone is required");
  }
});

// ============ GOALS SCHEMAS ============

const createGoalSchema = Joi.object({
  goalType: Joi.string()
    .valid(
      "weight_loss",
      "muscle_gain",
      "endurance",
      "flexibility",
      "general_health",
    )
    .required(),
  goalWeight: Joi.number().required(),
  targetCalories: Joi.number().min(1000).max(5000).required(),
  timeline: Joi.number().min(1).max(104).required(),
  targetActivityMinutes: Joi.alternatives()
    .try(Joi.number().min(0), Joi.string(), Joi.allow(null))
    .optional(),
  proteinTarget: Joi.alternatives()
    .try(Joi.number().min(0), Joi.string(), Joi.allow(null))
    .optional(),
  carbsTarget: Joi.alternatives()
    .try(Joi.number().min(0), Joi.string(), Joi.allow(null))
    .optional(),
  fatsTarget: Joi.alternatives()
    .try(Joi.number().min(0), Joi.string(), Joi.allow(null))
    .optional(),
  notes: Joi.string().max(500).optional(),
}).unknown(true);

// ============ CALORIES SCHEMAS ============

const logFoodSchema = Joi.object({
  foodName: Joi.string().max(200).required().messages({
    "string.empty": "Food name is required",
    "string.max": "Food name cannot exceed 200 characters",
  }),
  mealType: Joi.string()
    .valid("breakfast", "lunch", "dinner", "snacks")
    .required()
    .messages({
      "any.only": "Please select a valid meal type",
      "any.required": "Meal type is required",
    }),
  servingSize: Joi.string().default("100g").optional(),
  servingQuantity: Joi.number().positive().default(1).optional(),
  calories: Joi.number().min(0).required().messages({
    "number.base": "Calories must be a number",
    "number.min": "Calories cannot be negative",
    "any.required": "Calories is required",
  }),
  protein: Joi.number().min(0).optional().allow(null, "").messages({
    "number.min": "Protein cannot be negative",
  }),
  carbs: Joi.number().min(0).optional().allow(null, "").messages({
    "number.min": "Carbs cannot be negative",
  }),
  fats: Joi.number().min(0).optional().allow(null, "").messages({
    "number.min": "Fats cannot be negative",
  }),
  fiber: Joi.number().min(0).optional().allow(null, ""),
  sugar: Joi.number().min(0).optional().allow(null, ""),
  notes: Joi.string().max(500).optional().allow(null, ""),
  date: Joi.date().optional(),
});

// ============ ACTIVITIES SCHEMAS ============

const logActivitySchema = Joi.object({
  date: Joi.date().required().messages({
    "date.base": "Please provide a valid date",
    "any.required": "Activity date is required",
  }),
  workoutType: Joi.string()
    .valid(
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
    )
    .required()
    .messages({
      "any.only": "Please select a valid workout type",
      "any.required": "Workout type is required",
    }),
  duration: Joi.number().min(1).max(480).required().messages({
    "number.base": "Duration must be a number",
    "number.min": "Duration must be at least 1 minute",
    "number.max": "Duration cannot exceed 480 minutes (8 hours)",
    "any.required": "Duration is required",
  }),
  caloriesBurned: Joi.number().min(0).required().messages({
    "number.base": "Calories burned must be a number",
    "number.min": "Calories burned cannot be negative",
    "any.required": "Calories burned is required",
  }),
  intensity: Joi.string()
    .valid("low", "moderate", "high", "very_high")
    .default("moderate")
    .messages({
      "any.only": "Intensity must be low, moderate, high, or very_high",
    }),
  distance: Joi.number().min(0).optional().messages({
    "number.base": "Distance must be a number",
    "number.min": "Distance cannot be negative",
  }),
  heartRateAvg: Joi.number().min(0).optional().messages({
    "number.base": "Average heart rate must be a number",
    "number.min": "Heart rate cannot be negative",
  }),
  heartRateMax: Joi.number().min(0).optional().messages({
    "number.base": "Max heart rate must be a number",
    "number.min": "Heart rate cannot be negative",
  }),
  notes: Joi.string().max(500).optional().allow("", null).messages({
    "string.max": "Notes cannot exceed 500 characters",
  }),
});

// ============ VALIDATION FUNCTION ============

const validate = (schema) => {
  return async (req, res, next) => {
    try {
      // Convert string numbers to actual numbers for numeric fields
      const body = { ...req.body };

      // Convert numeric fields if they're strings
      const numericFields = [
        "goalWeight",
        "targetCalories",
        "timeline",
        "targetActivityMinutes",
        "proteinTarget",
        "carbsTarget",
        "fatsTarget",
        "age",
        "currentWeight",
        "height",
      ];

      numericFields.forEach((field) => {
        if (
          body[field] !== undefined &&
          body[field] !== null &&
          body[field] !== ""
        ) {
          if (typeof body[field] === "string") {
            body[field] = parseFloat(body[field]);
          }
        }
      });

      const value = await schema.validateAsync(body, {
        abortEarly: false,
        stripUnknown: true,
      });

      req.validatedData = value;
      next();
    } catch (error) {
      // Handle Joi validation errors
      if (error.details) {
        const errors = {};
        const messages = [];

        error.details.forEach((detail) => {
          errors[detail.path.join(".")] = detail.message;
          messages.push(detail.message);
        });

        return res.status(400).json({
          success: false,
          message: messages.join(". "),
          errors,
        });
      }

      // Handle external validation errors
      return res.status(400).json({
        success: false,
        message: error.message || "Please check your input and try again.",
      });
    }
  };
};

module.exports = {
  validate,
  signupSchema,
  loginSchema,
  createGoalSchema,
  logFoodSchema,
  logActivitySchema,
};
