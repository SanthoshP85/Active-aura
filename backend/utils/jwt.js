/**
 * JWT Utility Functions
 * Handles token generation and verification
 */

const jwt = require("jsonwebtoken");

/**
 * Generate JWT Token
 * @param {string} userId - User's MongoDB ID
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ userId, type: "access" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

/**
 * Verify JWT Token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * Decode JWT Token without verification
 * @param {string} token - JWT token to decode
 * @returns {object} Decoded token payload
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
};
