/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */

const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");

/**
 * Verify JWT Token Middleware
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is missing",
      });
    }

    const decoded = verifyToken(token);

    // Fetch fresh user data
    const user = await User.findById(decoded.userId).select("-passwordHash");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token verification failed",
      error: error.message,
    });
  }
};

module.exports = authenticateToken;
