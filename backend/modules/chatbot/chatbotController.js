/**
 * Chatbot Controller
 * Handles chatbot HTTP requests
 */

const { getChatbotResponse } = require("./chatbotService");
const { successResponse, errorResponse } = require("../../utils/response");

/**
 * Controller: Send message to chatbot
 * POST /api/chatbot/message
 */
const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return errorResponse(res, 400, "Message is required");
    }

    const response = await getChatbotResponse(req.userId, message);

    return successResponse(res, 200, "Chatbot response", {
      userMessage: message,
      chatbotResponse: response,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
};
