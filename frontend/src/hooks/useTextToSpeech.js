/**
 * Text-to-Speech Hook
 * Uses browser's Web Speech API (speechSynthesis)
 */

import { useState, useCallback, useEffect } from "react";

const useTextToSpeech = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  const speak = useCallback((text) => {
    if (!isSupported) {
      setError("Text-to-speech not supported");
      return;
    }

    if (!text || text.trim().length === 0) {
      return;
    }

    window.speechSynthesis.cancel();
    setError(null);

    try {
      const cleanText = text
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .replace(/#{1,6}\s/g, "")
        .replace(/`/g, "")
        .replace(/\n+/g, ". ")
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = "en-US";

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) => v.name.includes("Google") || v.name.includes("Microsoft") || v.name.includes("Samantha")
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = (event) => {
        setError(event.error || "Speech failed");
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);

    } catch (err) {
      setError(err.message || "Failed to speak");
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, [isSupported]);

  return {
    speak,
    stop,
    isPlaying,
    error,
    isSupported,
  };
};

export default useTextToSpeech;

