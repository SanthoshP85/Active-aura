/**
 * Authentication Routes
 * Defines all auth-related endpoints
 */

const express = require("express");
const router = express.Router();
const { signup, login, getCurrentUser } = require("./authController");
const {
  validate,
  signupSchema,
  loginSchema,
} = require("../../utils/validation");
const authenticateToken = require("../../middleware/auth");
const { authLimiter } = require("../../middleware/security");

// Public routes
router.post("/signup", authLimiter, validate(signupSchema), signup);
router.post("/login", authLimiter, validate(loginSchema), login);

// Protected routes
router.get("/me", authenticateToken, getCurrentUser);

module.exports = router;
