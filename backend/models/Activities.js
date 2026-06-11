/**
 * Activities Model
 * User workout and activity tracking
 */

const mongoose = require("mongoose");

const activitiesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      index: true,
    },
    workoutType: {
      type: String,
      enum: [
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
      ],
      required: [true, "Workout type is required"],
    },
    duration: {
      type: Number, // in minutes
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
      max: [480, "Duration cannot exceed 8 hours"],
    },
    caloriesBurned: {
      type: Number,
      required: [true, "Calories burned is required"],
      min: [0, "Calories cannot be negative"],
    },
    intensity: {
      type: String,
      enum: ["low", "moderate", "high", "very_high"],
      default: "moderate",
    },
    distance: {
      type: Number, // in kilometers
      default: 0,
    },
    heartRateAvg: Number,
    heartRateMax: Number,
    notes: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

activitiesSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("Activities", activitiesSchema);
