/**
 * FoodsLogged Model
 * Individual food items logged by users
 */

const mongoose = require("mongoose");

const foodsLoggedSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    caloriesTrackerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CaloriesTracker",
      required: [true, "Calories Tracker ID is required"],
      index: true,
    },
    foodName: {
      type: String,
      required: [true, "Food name is required"],
      trim: true,
    },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snacks"],
      required: [true, "Meal type is required"],
    },
    servingSize: {
      type: String,
      default: "100g",
    },
    servingQuantity: {
      type: Number,
      default: 1,
    },
    calories: {
      type: Number,
      required: [true, "Calories are required"],
      min: [0, "Calories cannot be negative"],
    },
    protein: {
      type: Number,
      default: 0, // in grams
    },
    carbs: {
      type: Number,
      default: 0, // in grams
    },
    fats: {
      type: Number,
      default: 0, // in grams
    },
    fiber: {
      type: Number,
      default: 0, // in grams
    },
    sugar: {
      type: Number,
      default: 0, // in grams
    },
    source: {
      type: String,
      enum: ["manual", "api", "custom"],
      default: "manual",
    },
    externalFoodId: String, // ID from external calorie API if applicable
    notes: String,
  },
  {
    timestamps: true,
  },
);

foodsLoggedSchema.index({ userId: 1, createdAt: -1 });
foodsLoggedSchema.index({ caloriesTrackerId: 1 });

module.exports = mongoose.model("FoodsLogged", foodsLoggedSchema);
