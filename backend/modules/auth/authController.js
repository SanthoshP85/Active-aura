/**
 * Authentication Controller
 * Handles HTTP requests for auth endpoints
 */

const { signupService, loginService } = require("./authService");
const { successResponse, errorResponse } = require("../../utils/response");

/**
 * Controller: Signup
 * POST /api/auth/signup
 */
const signup = async (req, res, next) => {
  try {
    const userData = req.validatedData;
    const result = await signupService(userData);

    return successResponse(res, 201, "Signup successful", {
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Login
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, phone, password } = req.validatedData;
    const result = await loginService(email, phone, password);

    return successResponse(res, 200, "Login successful", {
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    if (error.message.includes("Invalid")) {
      return errorResponse(res, 401, error.message);
    }
    next(error);
  }
};

/**
 * Controller: Get Current User
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const user = req.user;

    return successResponse(res, 200, "User fetched", {
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
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  getCurrentUser,
};
