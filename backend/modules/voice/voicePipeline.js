/**
 * Voice Pipeline - Complete Voice Flow Orchestration
 *
 * Flow: User Voice → STT → LLM (Aura) → TTS → Audio Response
 */

const { transcribeAudio } = require("./sttService");
const { synthesizeSpeech, audioToBase64 } = require("./ttsService");
const { getChatbotResponse } = require("../chatbot/chatbotService");

/**
 * Pipeline configuration
 */
const PIPELINE_CONFIG = {
  enableTTS: true,
  enableSTT: true,
  maxProcessingTime: 30000, // 30 seconds
};

/**
 * Process complete voice-to-voice interaction
 *
 * @param {string} userId - User ID
 * @param {Buffer} audioBuffer - Input audio buffer
 * @returns {Promise<Object>}
 */
const processVoiceToVoice = async (userId, audioBuffer) => {
  const startTime = Date.now();

  try {
    // Step 1: Speech-to-Text
    console.log("[Voice Pipeline] Step 1: Transcribing audio...");
    const sttResult = await transcribeAudio(audioBuffer);

    if (sttResult.error || !sttResult.text) {
      return {
        userText: "",
        auraResponse: "",
        audioBase64: "",
        audioDuration: 0,
        confidence: 0,
        processingTime: Date.now() - startTime,
        error: sttResult.error || "Could not transcribe audio",
      };
    }

    console.log(`[Voice Pipeline] Transcribed: "${sttResult.text}"`);

    // Step 2: Get Aura's response (LLM)
    console.log("[Voice Pipeline] Step 2: Getting Aura response...");
    const chatResponse = await getChatbotResponse(userId, sttResult.text);

    if (!chatResponse.summary) {
      return {
        userText: sttResult.text,
        auraResponse: "",
        audioBase64: "",
        audioDuration: 0,
        confidence: sttResult.confidence,
        processingTime: Date.now() - startTime,
        error: "Failed to get response from Aura",
      };
    }

    console.log(
      `[Voice Pipeline] Aura says: "${chatResponse.summary.substring(0, 50)}..."`,
    );

    // Step 3: Text-to-Speech
    console.log("[Voice Pipeline] Step 3: Synthesizing speech...");
    const ttsResult = await synthesizeSpeech(chatResponse.summary);

    if (ttsResult.error || !ttsResult.audio) {
      // Return text response even if TTS fails
      return {
        userText: sttResult.text,
        auraResponse: chatResponse.summary,
        audioBase64: "",
        audioDuration: 0,
        confidence: chatResponse.confidenceScore,
        processingTime: Date.now() - startTime,
        error: `TTS failed: ${ttsResult.error}`,
        ttsError: true,
      };
    }

    console.log(
      `[Voice Pipeline] Complete! Processing time: ${Date.now() - startTime}ms`,
    );

    return {
      userText: sttResult.text,
      auraResponse: chatResponse.summary,
      audioBase64: audioToBase64(ttsResult.audio),
      audioDuration: ttsResult.duration,
      confidence: chatResponse.confidenceScore,
      processingTime: Date.now() - startTime,
      error: null,
    };
  } catch (error) {
    console.error("[Voice Pipeline] Error:", error);
    return {
      userText: "",
      auraResponse: "",
      audioBase64: "",
      audioDuration: 0,
      confidence: 0,
      processingTime: Date.now() - startTime,
      error: error.message,
    };
  }
};

/**
 * Process text input and return voice response
 * (For adding TTS to existing text chat)
 *
 * @param {string} userId - User ID
 * @param {string} textInput - Text query
 * @returns {Promise<Object>}
 */
const processTextToVoice = async (userId, textInput) => {
  const startTime = Date.now();

  try {
    // Step 1: Get Aura's response
    console.log("[Text-to-Voice] Getting Aura response...");
    const chatResponse = await getChatbotResponse(userId, textInput);

    if (!chatResponse.summary) {
      return {
        auraResponse: "",
        audioBase64: "",
        audioDuration: 0,
        confidence: 0,
        processingTime: Date.now() - startTime,
        error: "Failed to get response",
      };
    }

    // Step 2: Convert to speech
    console.log("[Text-to-Voice] Synthesizing speech...");
    const ttsResult = await synthesizeSpeech(chatResponse.summary);

    return {
      auraResponse: chatResponse.summary,
      audioBase64: ttsResult.audio ? audioToBase64(ttsResult.audio) : "",
      audioDuration: ttsResult.duration || 0,
      confidence: chatResponse.confidenceScore,
      processingTime: Date.now() - startTime,
      error: ttsResult.error || null,
    };
  } catch (error) {
    console.error("[Text-to-Voice] Error:", error);
    return {
      auraResponse: "",
      audioBase64: "",
      audioDuration: 0,
      confidence: 0,
      processingTime: Date.now() - startTime,
      error: error.message,
    };
  }
};

module.exports = {
  PIPELINE_CONFIG,
  processVoiceToVoice,
  processTextToVoice,
};
