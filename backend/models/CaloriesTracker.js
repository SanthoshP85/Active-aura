/**
 * CaloriesTracker Model
 * Daily calorie intake tracking
 */

const mongoose = require("mongoose");

const caloriesTrackerSchema = new mongoose.Schema(
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
      default: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
      },
    },
    totalCalories: {
      type: Number,
      default: 0,
    },
    totalProtein: {
      type: Number,
      default: 0, // in grams
    },
    totalCarbs: {
      type: Number,
      default: 0, // in grams
    },
    totalFats: {
      type: Number,
      default: 0, // in grams
    },
    breakfast: {
      calories: { type: Number, default: 0 },
      items: [{ type: mongoose.Schema.Types.ObjectId, ref: "FoodsLogged" }],
    },
    lunch: {
      calories: { type: Number, default: 0 },
      items: [{ type: mongoose.Schema.Types.ObjectId, ref: "FoodsLogged" }],
    },
    dinner: {
      calories: { type: Number, default: 0 },
      items: [{ type: mongoose.Schema.Types.ObjectId, ref: "FoodsLogged" }],
    },
    snacks: {
      calories: { type: Number, default: 0 },
      items: [{ type: mongoose.Schema.Types.ObjectId, ref: "FoodsLogged" }],
    },
    notes: String,
  },
  {
    timestamps: true,
  },
);

// Compound index for unique date per user
caloriesTrackerSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("CaloriesTracker", caloriesTrackerSchema);
