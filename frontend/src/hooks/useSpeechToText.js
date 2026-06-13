/**
 * Speech-to-Text Hook
 * Uses browser's Web Speech API (SpeechRecognition)
 */

import { useState, useRef, useCallback, useEffect } from "react";

const useSpeechToText = (options = {}) => {
  const { onTranscript, onError, language = "en-US", continuous = false } = options;

  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);

  // Keep refs updated
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onErrorRef.current = onError;
  }, [onTranscript, onError]);

  // Check if supported
  const isSupported = typeof window !== "undefined" && 
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      console.log("🎤 Recognition started");
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }

      if (finalTranscript && onTranscriptRef.current) {
        console.log("🎤 Final:", finalTranscript);
        onTranscriptRef.current(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("🎤 Error:", event.error);
      
      let errorMessage = "Speech error";
      switch (event.error) {
        case "not-allowed":
          errorMessage = "Microphone access denied";
          break;
        case "no-speech":
          errorMessage = "No speech detected";
          break;
        case "network":
          errorMessage = "Network error";
          break;
        default:
          errorMessage = "Error: " + event.error;
      }

      setError(errorMessage);
      setIsListening(false);
      if (onErrorRef.current) onErrorRef.current(errorMessage);
    };

    recognition.onend = () => {
      console.log("🎤 Recognition ended");
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch (e) {}
    };
  }, [language, continuous]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError("Speech recognition not available");
      return;
    }

    setError(null);
    try {
      recognitionRef.current.start();
    } catch (err) {
      if (err.name !== "InvalidStateError") {
        setError("Failed to start");
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    error,
    isSupported,
    startListening,
    stopListening,
  };
};

export default useSpeechToText;
