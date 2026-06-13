/**
 * Text-to-Speech Service
 * Converts text to audio using HuggingFace Inference API
 * Model: facebook/mms-tts-eng
 */

const axios = require("axios");

const TTS_CONFIG = {
  // Try different TTS models in order of preference
  models: [
    "Aratako/Irodori-TTS-500M",
    "espnet/kan-bayashi_ljspeech_vits",
    "facebook/fastspeech2-en-ljspeech",
    "microsoft/speecht5_tts",
    "suno/bark-small",
  ],
  // Direct inference API (not router)
  baseUrl: "https://api-inference.huggingface.co/models/",
  maxTextLength: 500,
  retryAttempts: 2,
  retryDelay: 3000,
  timeout: 60000,
};

/**
 * Sleep utility
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Clean text for better TTS output
 */
const cleanTextForTTS = (text) => {
  if (!text) return "";

  let cleaned = text
    // Remove markdown
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/#{1,6}\s/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`/g, "")
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Clean whitespace
    .replace(/\n+/g, ". ")
    .replace(/\s+/g, " ")
    .replace(/\.{2,}/g, ".")
    .trim();

  // Limit length for faster processing
  if (cleaned.length > TTS_CONFIG.maxTextLength) {
    cleaned = cleaned.substring(0, TTS_CONFIG.maxTextLength);
    // End at last complete sentence
    const lastEnd = Math.max(
      cleaned.lastIndexOf("."),
      cleaned.lastIndexOf("!"),
      cleaned.lastIndexOf("?"),
    );
    if (lastEnd > cleaned.length * 0.5) {
      cleaned = cleaned.substring(0, lastEnd + 1);
    }
  }

  return cleaned;
};

/**
 * Convert text to speech audio
 * @param {string} text - Text to convert
 * @returns {Promise<{audio: Buffer, duration: number, error?: string}>}
 */
const synthesizeSpeech = async (text) => {
  try {
    const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
    if (!token) {
      return {
        audio: null,
        duration: 0,
        error: "HuggingFace API key not configured",
      };
    }

    // Validate and clean text
    const cleanedText = cleanTextForTTS(text);
    if (!cleanedText) {
      return { audio: null, duration: 0, error: "Empty text after cleaning" };
    }

    console.log(`[TTS] Synthesizing: "${cleanedText.substring(0, 50)}..."`);

    // Try each model until one works
    for (const model of TTS_CONFIG.models) {
      console.log(`[TTS] Trying model: ${model}`);

      for (let attempt = 0; attempt <= TTS_CONFIG.retryAttempts; attempt++) {
        try {
          const response = await axios.post(
            `${TTS_CONFIG.baseUrl}${model}`,
            { inputs: cleanedText },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              responseType: "arraybuffer",
              timeout: TTS_CONFIG.timeout,
            },
          );

          const audio = Buffer.from(response.data);

          // Check if we got valid audio data
          if (audio.length < 1000) {
            console.log(
              `[TTS] Response too small (${audio.length} bytes), trying next model...`,
            );
            break; // Try next model
          }

          // Estimate duration (~150 words per minute)
          const wordCount = cleanedText.split(/\s+/).length;
          const estimatedDuration = Math.round((wordCount / 150) * 60);

          console.log(`[TTS] ✅ Success with ${model}: ${audio.length} bytes`);

          return {
            audio,
            duration: estimatedDuration,
            error: null,
          };
        } catch (axiosError) {
          const status = axiosError.response?.status;

          // 503 = model loading, wait and retry
          if (status === 503) {
            if (attempt < TTS_CONFIG.retryAttempts) {
              console.log(`[TTS] Model ${model} loading, waiting...`);
              await sleep(TTS_CONFIG.retryDelay);
              continue;
            }
          }

          // 400/404 = model not available, try next model
          if (status === 400 || status === 404) {
            console.log(
              `[TTS] Model ${model} not available (${status}), trying next...`,
            );
            break; // Try next model
          }

          // Network error
          if (
            axiosError.code === "ENOTFOUND" ||
            axiosError.code === "ECONNREFUSED"
          ) {
            console.error(`[TTS] Network error for ${model}`);
            break; // Try next model
          }

          // Other error, retry
          if (attempt < TTS_CONFIG.retryAttempts) {
            await sleep(TTS_CONFIG.retryDelay);
          }
        }
      }
    }

    // All models failed
    return {
      audio: null,
      duration: 0,
      error: "All TTS models unavailable. Please try again later.",
    };
  } catch (error) {
    console.error("[TTS] Service error:", error.message || error);
    return {
      audio: null,
      duration: 0,
      error: `TTS failed: ${error.message || "Unknown error"}`,
    };
  }
};

/**
 * Convert audio buffer to base64
 */
const audioToBase64 = (audioBuffer) => {
  if (!audioBuffer) return "";
  return audioBuffer.toString("base64");
};

module.exports = {
  TTS_CONFIG,
  synthesizeSpeech,
  cleanTextForTTS,
  audioToBase64,
};
