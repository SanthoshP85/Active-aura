/**
 * Voice Controller
 * API endpoints for STT, TTS, and voice pipeline
 */

const { transcribeAudio, isSupportedFormat } = require("./sttService");
const { synthesizeSpeech, audioToBase64 } = require("./ttsService");
const { processVoiceToVoice, processTextToVoice } = require("./voicePipeline");

/**
 * POST /api/voice/stt
 * Speech-to-Text only (standalone)
 */
const speechToText = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No audio file provided" });
    }

    if (!isSupportedFormat(req.file.mimetype)) {
      return res
        .status(400)
        .json({ success: false, error: "Unsupported audio format" });
    }

    const result = await transcribeAudio(req.file.buffer);

    if (result.error) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      text: result.text,
      confidence: result.confidence,
    });
  } catch (error) {
    console.error("[Voice Controller] STT error:", error);
    res.status(500).json({ success: false, error: "Speech-to-text failed" });
  }
};

/**
 * POST /api/voice/tts
 * Text-to-Speech only (standalone)
 * Returns base64 audio
 */
const textToSpeech = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No text provided" });
    }

    const result = await synthesizeSpeech(text);

    if (result.error) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({
      success: true,
      audio: audioToBase64(result.audio),
      duration: result.duration,
      format: "audio/flac",
    });
  } catch (error) {
    console.error("[Voice Controller] TTS error:", error);
    res.status(500).json({ success: false, error: "Text-to-speech failed" });
  }
};

/**
 * POST /api/voice/tts/stream
 * Text-to-Speech - returns audio stream directly
 */
const textToSpeechStream = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res
        .status(400)
        .json({ success: false, error: "No text provided" });
    }

    const result = await synthesizeSpeech(text);

    if (result.error || !result.audio) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.set({
      "Content-Type": "audio/flac",
      "Content-Length": result.audio.length,
      "Cache-Control": "no-cache",
    });
    res.send(result.audio);
  } catch (error) {
    console.error("[Voice Controller] TTS Stream error:", error);
    res.status(500).json({ success: false, error: "Text-to-speech failed" });
  }
};

/**
 * POST /api/voice/chat
 * Complete voice pipeline: Audio In → Aura → Audio Out
 */
const voiceChat = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: "User not authenticated" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No audio file provided" });
    }

    const result = await processVoiceToVoice(userId, req.file.buffer);

    if (result.error && !result.ttsError) {
      return res.status(400).json({ success: false, ...result });
    }

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[Voice Controller] Voice Chat error:", error);
    res.status(500).json({ success: false, error: "Voice chat failed" });
  }
};

/**
 * POST /api/voice/chat/text
 * Text input → Aura → Audio output
 */
const textToVoiceChat = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const { text } = req.body;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, error: "User not authenticated" });
    }

    if (!text) {
      return res
        .status(400)
        .json({ success: false, error: "No text provided" });
    }

    const result = await processTextToVoice(userId, text);

    if (result.error && !result.audioBase64) {
      return res.status(400).json({ success: false, ...result });
    }

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[Voice Controller] Text-to-Voice error:", error);
    res
      .status(500)
      .json({ success: false, error: "Text-to-voice chat failed" });
  }
};

module.exports = {
  speechToText,
  textToSpeech,
  textToSpeechStream,
  voiceChat,
  textToVoiceChat,
};
