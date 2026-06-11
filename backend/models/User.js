/**
 * User Model
 * Stores user account and profile information
 */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please provide full name"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Please provide phone number"],
      unique: true,
      match: [/^\+?1?\d{9,15}$/, "Please provide a valid phone number"],
    },
    passwordHash: {
      type: String,
      required: [true, "Please provide password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    currentWeight: {
      type: Number,
      required: [true, "Please provide current weight in kg"],
      min: [30, "Weight must be realistic"],
      max: [500, "Weight must be realistic"],
    },
    goalWeight: {
      type: Number,
      required: [true, "Please provide goal weight in kg"],
      min: [30, "Weight must be realistic"],
      max: [500, "Weight must be realistic"],
    },
    height: {
      type: Number,
      required: [true, "Please provide height in cm"],
      min: [100, "Height must be realistic"],
      max: [250, "Height must be realistic"],
    },
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
      required: [true, "Please select activity level"],
      default: "moderate",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: [true, "Please provide gender"],
    },
    age: {
      type: Number,
      required: [true, "Please provide age"],
      min: [13, "You must be at least 13 years old"],
      max: [120, "Please provide a valid age"],
    },
    fitnessGoals: [
      {
        type: String,
        enum: [
          "weight_loss",
          "muscle_gain",
          "endurance",
          "flexibility",
          "general_health",
        ],
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
  },
);

// Index for fast lookups
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });

module.exports = mongoose.model("User", userSchema);
