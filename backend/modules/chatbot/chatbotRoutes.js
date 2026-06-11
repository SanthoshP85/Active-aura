/**
 * Chatbot Routes
 * Defines all chatbot endpoints
 */

const express = require("express");
const router = express.Router();
const { sendMessage } = require("./chatbotController");
const authenticateToken = require("../../middleware/auth");

// All routes require authentication
router.use(authenticateToken);

router.post("/message", sendMessage);

module.exports = router;
