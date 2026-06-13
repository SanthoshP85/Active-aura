/**
 * Speech-to-Text Service
 * Converts audio to text using HuggingFace Whisper
 * Model: openai/whisper-base
 */

const axios = require("axios");

const STT_CONFIG = {
  model: "openai/whisper-base",
  apiUrl: "https://api-inference.huggingface.co/models/openai/whisper-base",
  maxAudioSize: 10 * 1024 * 1024, // 10MB
  maxDuration: 30, // seconds
  supportedFormats: ["webm", "wav", "mp3", "ogg", "m4a", "flac"],
  retryAttempts: 2,
  retryDelay: 1000,
  timeout: 30000,
};

/**
 * Sleep utility for retry logic
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Transcribe audio buffer to text
 * @param {Buffer} audioBuffer - Audio file buffer
 * @returns {Promise<{text: string, confidence: number, error?: string}>}
 */
const transcribeAudio = async (audioBuffer) => {
  try {
    // Validate API key
    if (!process.env.HUGGINGFACE_API_KEY) {
      return {
        text: "",
        confidence: 0,
        error: "HUGGINGFACE_API_KEY not configured",
      };
    }

    // Validate input
    if (!audioBuffer || audioBuffer.length === 0) {
      return { text: "", confidence: 0, error: "Empty audio buffer" };
    }

    if (audioBuffer.length > STT_CONFIG.maxAudioSize) {
      return {
        text: "",
        confidence: 0,
        error: "Audio file too large (max 10MB)",
      };
    }

    // Retry logic for model loading
    let lastError = null;
    for (let attempt = 0; attempt <= STT_CONFIG.retryAttempts; attempt++) {
      try {
        const response = await axios.post(STT_CONFIG.apiUrl, audioBuffer, {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            "Content-Type": "audio/wav",
          },
          timeout: STT_CONFIG.timeout,
        });

        const result = response.data;
        console.log(`[STT] Transcribed: "${result.text?.substring(0, 50)}..."`);

        return {
          text: result.text?.trim() || "",
          confidence: 0.85,
          error: null,
        };
      } catch (axiosError) {
        lastError = axiosError;

        // Handle model loading (503)
        if (axiosError.response?.status === 503) {
          const data = axiosError.response.data;
          if (data?.estimated_time && attempt < STT_CONFIG.retryAttempts) {
            console.log(
              `[STT] Model loading, waiting ${data.estimated_time}s...`,
            );
            await sleep(Math.min(data.estimated_time * 1000, 20000));
            continue;
          }
          return {
            text: "",
            confidence: 0,
            error: "Model is loading, please try again",
          };
        }

        // Network errors
        if (
          axiosError.code === "ENOTFOUND" ||
          axiosError.code === "ECONNREFUSED"
        ) {
          console.error("[STT] Network error - cannot reach HuggingFace API");
          return {
            text: "",
            confidence: 0,
            error:
              "Cannot connect to STT service. Check your internet connection.",
          };
        }

        if (attempt < STT_CONFIG.retryAttempts) {
          console.log(`[STT] Attempt ${attempt + 1} failed, retrying...`);
          await sleep(STT_CONFIG.retryDelay);
        }
      }
    }

    throw lastError || new Error("Max retries exceeded");
  } catch (error) {
    console.error("[STT] Service error:", error.message || error);
    return {
      text: "",
      confidence: 0,
      error: "STT service unavailable. Check your internet connection.",
    };
  }
};

/**
 * Check if audio format is supported
 */
const isSupportedFormat = (mimeType) => {
  if (!mimeType) return false;
  const format = mimeType.split("/")[1]?.split(";")[0]?.toLowerCase();
  return STT_CONFIG.supportedFormats.includes(format);
};

module.exports = {
  STT_CONFIG,
  transcribeAudio,
  isSupportedFormat,
};
