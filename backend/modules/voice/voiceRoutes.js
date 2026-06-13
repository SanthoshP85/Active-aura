/**
 * Voice Routes
 * Separate endpoints for STT, TTS, and combined pipeline
 */

const express = require("express");
const multer = require("multer");
const authenticateToken = require("../../middleware/auth");
const {
  speechToText,
  textToSpeech,
  textToSpeechStream,
  voiceChat,
  textToVoiceChat,
} = require("./voiceController");

const router = express.Router();

// Configure multer for audio uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"), false);
    }
  },
});

// ============================================
// STANDALONE ENDPOINTS (can be used separately)
// ============================================

// Speech-to-Text only
router.post("/stt", authenticateToken, upload.single("audio"), speechToText);

// Text-to-Speech only (returns JSON with base64)
router.post("/tts", authenticateToken, textToSpeech);

// Text-to-Speech stream (returns audio directly)
router.post("/tts/stream", authenticateToken, textToSpeechStream);

// ============================================
// COMBINED PIPELINE ENDPOINTS
// ============================================

// Voice-to-Voice: Audio → Aura → Audio
router.post("/chat", authenticateToken, upload.single("audio"), voiceChat);

// Text-to-Voice: Text → Aura → Audio
router.post("/chat/text", authenticateToken, textToVoiceChat);

module.exports = router;
