/**
 * ActiveAura Backend - Main Application Entry Point
 * Express.js + MongoDB + Redis Stack + AI (OpenAI/Gemini)
 */

require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const { connectRedis } = require("./config/redis");
const {
  getCorsMiddleware,
  getHelmetMiddleware,
  limiter,
} = require("./middleware/security");
const errorHandler = require("./middleware/errorHandler");
const apiRoutes = require("./routes/apiRoutes");

const app = express();

// ============ INITIALIZATION ============

/**
 * Initialize application
 */
const initializeApp = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis (optional)
    await connectRedis();

    console.log("✅ All services connected");

    // Note: Data syncing now happens on-demand during user actions
    // - Profile sync on signup and profile updates
    // - Food logs sync when logged
    // - Activities sync when logged
    // - Goals sync when created/updated
  } catch (error) {
    console.error("❌ Failed to initialize services:", error);
    process.exit(1);
  }
};

// ============ MIDDLEWARE SETUP ============

console.log("dkshfhdskjh");
// Security middleware
app.use(getHelmetMiddleware());
app.use(getCorsMiddleware());

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Rate limiting
app.use("/api/", limiter);

// Request logging (development)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ============ ROUTES ============

// API routes
app.use("/api", apiRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "ActiveAura API",
    version: "1.0.0",
    description: "AI-powered fitness application backend",
    docs: "/api/health",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      calories: "/api/calories",
      activities: "/api/activities",
      goals: "/api/goals",
      insights: "/api/insights",
      chatbot: "/api/chatbot",
    },
  });
});

// ============ ERROR HANDLING ============

// Error handler middleware (must be last)
app.use(errorHandler);

// ============ SERVER START ============

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Initialize services
    await initializeApp();

    // Start server
    app.listen(PORT, () => {
      console.log(
        `\n🚀 ActiveAura Backend running on http://localhost:${PORT}`,
      );
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Environment: ${process.env.NODE_ENV || "development"}\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

// Start server
startServer();

module.exports = app;
