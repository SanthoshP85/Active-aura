/**
 * Authentication Service
 * Handles signup, login, and token management
 */

const User = require("../../models/User");
const { hashPassword, comparePassword } = require("../../utils/password");
const { generateToken } = require("../../utils/jwt");
const { storeFitnessSummary } = require("../rag/ragService");

/**
 * Service: User Signup
 */
const signupService = async (userData) => {
  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email: userData.email }, { phone: userData.phone }],
  });

  if (existingUser) {
    const field = existingUser.email === userData.email ? "email" : "phone";
    throw new Error(`${field} already registered`);
  }

  // Hash password
  const passwordHash = await hashPassword(userData.password);

  // Create user
  const user = new User({
    fullName: userData.fullName,
    email: userData.email,
    phone: userData.phone,
    passwordHash,
    currentWeight: userData.currentWeight,
    goalWeight: userData.goalWeight,
    height: userData.height,
    age: userData.age,
    gender: userData.gender,
    activityLevel: userData.activityLevel || "moderate",
    fitnessGoals: userData.fitnessGoals || [],
  });

  await user.save();

  // Store user profile in Redis for RAG retrieval
  const userProfileSummary = `User Profile: ${userData.fullName}, ${userData.age} years old, ${userData.height}cm tall, ${userData.currentWeight}kg current weight, goal weight ${userData.goalWeight}kg. Gender: ${userData.gender}. Activity level: ${userData.activityLevel}. Fitness goals: ${userData.fitnessGoals.join(", ")}`;
  try {
    await storeFitnessSummary(user._id, userProfileSummary, "profile");
    console.log("✅ User profile stored in Redis vector database");
  } catch (error) {
    console.warn("⚠️ Failed to store user profile in Redis:", error.message);
  }

  // Generate token
  const token = generateToken(user._id);

  return {
    user: {
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
    },
    token,
  };
};

/**
 * Service: User Login
 */
const loginService = async (email, phone, password) => {
  // Find user by email or phone
  const user = await User.findOne({
    $or: [{ email }, { phone }],
  }).select("+passwordHash");

  if (!user) {
    throw new Error("Invalid email/phone or password");
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error("Invalid email/phone or password");
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  return {
    user: {
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
    },
    token,
  };
};

module.exports = {
  signupService,
  loginService,
};
