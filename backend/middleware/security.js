/**
 * CORS and Security Middleware Setup
 */

const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

/**
 * Configure CORS
 */
const getCorsOrigins = () => {
  const allowedOrigins = [
    "http://localhost:3000", // Local development
    "http://localhost:5000", // Local backend (for health checks)
  ];

  // Add ngrok domains (both frontend and backend)
  if (process.env.NGROK_FRONTEND_URL) {
    allowedOrigins.push(process.env.NGROK_FRONTEND_URL);
  }
  if (process.env.NGROK_BACKEND_URL) {
    allowedOrigins.push(process.env.NGROK_BACKEND_URL);
  }

  // Allow custom frontend URL from env (for Vercel deployment)
  if (
    process.env.FRONTEND_URL &&
    !allowedOrigins.includes(process.env.FRONTEND_URL)
  ) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  return allowedOrigins;
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getCorsOrigins();

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is allowed
    if (
      allowedOrigins.some(
        (allowed) =>
          origin === allowed ||
          origin.includes(
            allowed.replace("http://", "").replace("https://", ""),
          ),
      )
    ) {
      callback(null, true);
    } else if (origin.includes("vercel.app")) {
      // Allow all Vercel deployments
      callback(null, true);
    } else if (origin.includes("ngrok")) {
      // Allow ngrok URLs
      callback(null, true);
    } else if (process.env.NODE_ENV === "development") {
      // In development, be more lenient
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

const getCorsMiddleware = () => cors(corsOptions);

/**
 * Security Headers with Helmet
 */
const getHelmetMiddleware = () => helmet();

/**
 * Rate Limiting
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true,
  message: "Too many login attempts, please try again later.",
});

module.exports = {
  getCorsMiddleware,
  getHelmetMiddleware,
  limiter,
  authLimiter,
};
