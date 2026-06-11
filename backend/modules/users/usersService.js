/**
 * Users Service
 * Handles user profile operations
 */

const User = require("../../models/User");
const CaloriesTracker = require("../../models/CaloriesTracker");
const { hashPassword, comparePassword } = require("../../utils/password");
const { storeFitnessSummary } = require("../rag/ragService");

/**
 * Service: Get user profile
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

/**
 * Service: Update user profile
 */
const updateUserProfile = async (userId, updateData) => {
  // Prevent password update through this endpoint
  delete updateData.passwordHash;
  delete updateData.password;

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Sync updated profile to Redis vector DB if profile-related fields changed
  const profileFields = [
    "currentWeight",
    "goalWeight",
    "age",
    "activityLevel",
    "fitnessGoals",
    "height",
    "gender",
  ];
  const hasProfileChanges = Object.keys(updateData).some((key) =>
    profileFields.includes(key),
  );

  if (hasProfileChanges) {
    const userProfileSummary = `User Profile: ${user.fullName}, ${user.age} years old, ${user.height}cm tall, ${user.currentWeight}kg current weight, goal weight ${user.goalWeight}kg. Gender: ${user.gender}. Activity level: ${user.activityLevel}. Fitness goals: ${user.fitnessGoals.join(", ")}`;
    try {
      await storeFitnessSummary(userId, userProfileSummary, "profile");
      console.log("✅ Updated user profile in Redis vector database");
    } catch (error) {
      console.warn("⚠️ Failed to update user profile in Redis:", error.message);
    }
  }

  return user;
};

/**
 * Service: Update user password
 */
const updatePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select("+passwordHash");

  if (!user) {
    throw new Error("User not found");
  }

  // Verify old password
  const isPasswordValid = await comparePassword(oldPassword, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Current password is incorrect");
  }

  // Hash new password
  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  return { message: "Password updated successfully" };
};

/**
 * Service: Get user weight history (mock implementation)
 * In production, create a separate WeightHistory collection
 */
const getWeightHistory = async (userId, days = 30) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // This is a mock response. In production, query actual weight history
  const history = [
    {
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      weight: user.currentWeight + 5,
    },
    {
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      weight: user.currentWeight + 3,
    },
    {
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      weight: user.currentWeight + 1,
    },
    {
      date: new Date(),
      weight: user.currentWeight,
    },
  ];

  return history;
};

/**
 * Service: Get logging streak (count of unique dates logged)
 */
const getLoggingStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Get all unique dates where calories were logged
  const calorieEntries = await CaloriesTracker.find({ userId })
    .select("date")
    .sort({ date: -1 });

  // Count unique dates
  const uniqueDates = new Set();
  calorieEntries.forEach((entry) => {
    const dateStr = entry.date.toISOString().split("T")[0];
    uniqueDates.add(dateStr);
  });

  return {
    totalDaysLogged: uniqueDates.size,
    lastLogDate: calorieEntries.length > 0 ? calorieEntries[0].date : null,
  };
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  updatePassword,
  getWeightHistory,
  getLoggingStreak,
};
