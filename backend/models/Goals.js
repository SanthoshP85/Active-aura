/**
 * Goals Model
 * Stores user fitness goals and targets
 */

const mongoose = require("mongoose");

const goalsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    goalType: {
      type: String,
      enum: [
        "weight_loss",
        "muscle_gain",
        "endurance",
        "flexibility",
        "general_health",
      ],
      required: [true, "Please specify goal type"],
    },
    goalWeight: {
      type: Number,
      required: [true, "Please provide goal weight"],
    },
    targetCalories: {
      type: Number,
      required: [true, "Please provide daily calorie target"],
      min: [1000, "Calorie target too low"],
      max: [5000, "Calorie target too high"],
    },
    timeline: {
      type: Number, // in weeks
      required: [true, "Please specify timeline in weeks"],
      min: [1, "Timeline must be at least 1 week"],
      max: [104, "Timeline cannot exceed 2 years"],
    },
    targetActivityMinutes: {
      type: Number, // per week
      default: 150,
    },
    proteinTarget: {
      type: Number, // in grams
      default: 0,
    },
    carbsTarget: {
      type: Number, // in grams
      default: 0,
    },
    fatsTarget: {
      type: Number, // in grams
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: Date,
    notes: String,
  },
  {
    timestamps: true,
  },
);

goalsSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model("Goals", goalsSchema);
