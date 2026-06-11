/**
 * Users Controller
 * Handles user profile HTTP requests
 */

const {
  getUserProfile,
  updateUserProfile,
  updatePassword,
  getWeightHistory,
  getLoggingStreak,
} = require("./usersService");
const { successResponse, errorResponse } = require("../../utils/response");

/**
 * Controller: Get user profile
 * GET /api/users/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await getUserProfile(req.userId);

    return successResponse(res, 200, "Profile fetched", {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      currentWeight: user.currentWeight,
      goalWeight: user.goalWeight,
      height: user.height,
      age: user.age,
      gender: user.gender,
      activityLevel: user.activityLevel,
      fitnessGoals: user.fitnessGoals,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Update user profile
 * PUT /api/users/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const updateData = req.body;
    const user = await updateUserProfile(req.userId, updateData);

    return successResponse(res, 200, "Profile updated", {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      currentWeight: user.currentWeight,
      goalWeight: user.goalWeight,
      height: user.height,
      age: user.age,
      gender: user.gender,
      activityLevel: user.activityLevel,
      fitnessGoals: user.fitnessGoals,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Update password
 * PUT /api/users/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return errorResponse(res, 400, "Passwords do not match");
    }

    await updatePassword(req.userId, currentPassword, newPassword);

    return successResponse(res, 200, "Password changed successfully");
  } catch (error) {
    if (error.message === "Current password is incorrect") {
      return errorResponse(res, 401, error.message);
    }
    next(error);
  }
};

/**
 * Controller: Get weight history
 * GET /api/users/weight-history?days=30
 */
const getWeightHistoryController = async (req, res, next) => {
  try {
    const days = req.query.days || 30;
    const history = await getWeightHistory(req.userId, parseInt(days));

    return successResponse(res, 200, "Weight history fetched", history);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get logging streak
 * GET /api/users/streak
 */
const getStreakController = async (req, res, next) => {
  try {
    const streakData = await getLoggingStreak(req.userId);

    return successResponse(res, 200, "Streak data fetched", streakData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getWeightHistoryController,
  getStreakController,
};
