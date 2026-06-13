/**
 * Error Handling Middleware
 * Centralized error handling for all routes
 */

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Joi validation error
  if (err.isJoi) {
    const errors = err.details.map((detail) => detail.message).join(". ");
    return res.status(400).json({
      success: false,
      message: errors,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.keys(err.errors).reduce((acc, key) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});
    const errorMessages = Object.values(errors).join(". ");

    return res.status(400).json({
      success: false,
      message: errorMessages || "Validation error. Please check your input.",
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
    return res.status(400).json({
      success: false,
      message: `${fieldName} already exists. Please use a different ${field}.`,
    });
  }

  // Mongoose cast error
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid data format. Please check your input.",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Your session is invalid. Please log in again.",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Your session has expired. Please log in again.",
    });
  }

  // Network/Connection errors
  if (err.code === "ECONNREFUSED" || err.code === "ENOTFOUND") {
    return res.status(503).json({
      success: false,
      message: "Service temporarily unavailable. Please try again later.",
    });
  }

  // Rate limiting
  if (err.status === 429 || err.message?.includes("rate limit")) {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please wait a moment and try again.",
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500
      ? "Something went wrong. Please try again later."
      : err.message || "An error occurred";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
