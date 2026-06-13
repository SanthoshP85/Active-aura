/**
 * Real-Time Voice Agent Hook
 * Enables natural voice conversation with Aura
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { chatbotService } from "../services/chatbotService";

const useVoiceAgent = (options = {}) => {
  const {
    onUserSpeech,
    onAuraResponse,
    onError,
    silenceTimeout = 2000,
    language = "en-US",
  } = options;

  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [error, setError] = useState(null);

  // Refs for state tracking (avoids stale closures)
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const restartTimerRef = useRef(null);
  const stateRef = useRef({
    isActive: false,
    isSpeaking: false,
    isListening: false,
    isProcessing: false,
  });
  const accumulatedTextRef = useRef("");

  // Refs for callbacks (to avoid stale closures in useEffect)
  const handleUserInputRef = useRef(null);
  const scheduleRestartRef = useRef(null);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const SpeechRecognition =
    typeof window !== "undefined"
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;
  const speechSynthesis =
    typeof window !== "undefined" ? window.speechSynthesis : null;

  const isSupported = !!(SpeechRecognition && speechSynthesis);

  // Clear silence timer only
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // Clear all timers (used on stop)
  const clearAllTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  // Helper to start recognition (used by timer callback and elsewhere)
  const tryStartRecognition = useCallback(() => {
    console.log("🎤 tryStartRecognition called");

    if (!recognitionRef.current) {
      console.log("🎤 No recognition object!");
      return false;
    }
    if (!stateRef.current.isActive) {
      console.log("🎤 Agent not active");
      return false;
    }
    if (stateRef.current.isSpeaking) {
      console.log("🎤 Speaking");
      return false;
    }
    if (stateRef.current.isProcessing) {
      console.log("🎤 Processing");
      return false;
    }
    if (stateRef.current.isListening) {
      console.log("🎤 Already listening");
      return false;
    }

    try {
      console.log("🎤 Starting recognition...");
      recognitionRef.current.start();
      console.log("🎤 Started!");
      return true;
    } catch (err) {
      console.error("🎤 Error:", err.message);
      return false;
    }
  }, []);

  // Safe stop recognition
  const stopRecognition = useCallback(() => {
    clearSilenceTimer();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore
      }
    }

    stateRef.current.isListening = false;
    setIsListening(false);
  }, [clearSilenceTimer]);

  // Schedule a restart with 500ms debounce
  const scheduleRestart = useCallback(() => {
    console.log("🔄 scheduleRestart called, state:", {
      isActive: stateRef.current.isActive,
      isSpeaking: stateRef.current.isSpeaking,
      isProcessing: stateRef.current.isProcessing,
      hasTimer: !!restartTimerRef.current,
    });

    // If timer already scheduled, don't schedule another
    if (restartTimerRef.current) {
      console.log("🔄 Timer already scheduled, skipping");
      return;
    }

    // Only schedule if conditions are right
    if (
      !stateRef.current.isActive ||
      stateRef.current.isSpeaking ||
      stateRef.current.isProcessing
    ) {
      console.log("🔄 Conditions not met, not scheduling restart");
      return;
    }

    console.log("🔄 Scheduling restart in 500ms...");
    const timerId = window.setTimeout(() => {
      console.log("🔄 Timer fired! ID:", timerId);
      restartTimerRef.current = null;

      console.log("🔄 State check:", {
        isActive: stateRef.current.isActive,
        isSpeaking: stateRef.current.isSpeaking,
        isProcessing: stateRef.current.isProcessing,
        isListening: stateRef.current.isListening,
        hasRecognition: !!recognitionRef.current,
      });

      if (!stateRef.current.isActive) {
        console.log("🔄 Not active");
        return;
      }
      if (stateRef.current.isSpeaking) {
        console.log("🔄 Speaking");
        return;
      }
      if (stateRef.current.isProcessing) {
        console.log("🔄 Processing");
        return;
      }
      if (stateRef.current.isListening) {
        console.log("🔄 Already listening");
        return;
      }
      if (!recognitionRef.current) {
        console.log("🔄 No recognition");
        return;
      }

      try {
        console.log("🔄 Starting recognition...");
        recognitionRef.current.start();
        console.log("🔄 Started!");
      } catch (err) {
        console.error("🔄 Error:", err.message);
      }
    }, 500);
    restartTimerRef.current = timerId;
    console.log("🔄 Timer scheduled with ID:", timerId);
  }, []);

  // Keep ref updated
  scheduleRestartRef.current = scheduleRestart;

  // Speak response using TTS
  const speakResponse = useCallback(
    (text) => {
      return new Promise((resolve) => {
        if (!speechSynthesis) {
          console.log("🔊 No speechSynthesis, resolving immediately");
          resolve();
          return;
        }

        console.log("🔊 Speaking:", text.substring(0, 50) + "...");

        // Stop listening while speaking
        stopRecognition();
        speechSynthesis.cancel();

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
        utterance.lang = language;

        // Get voices (may need to wait for them to load)
        let voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
          // Voices not loaded yet, wait a bit
          speechSynthesis.onvoiceschanged = () => {
            voices = speechSynthesis.getVoices();
          };
        }

        console.log("🔊 Available voices:", voices.length);
        const preferredVoice = voices.find(
          (v) =>
            v.name.includes("Google") ||
            v.name.includes("Microsoft") ||
            v.name.includes("Samantha"),
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
          console.log("🔊 Using voice:", preferredVoice.name);
        }

        // Chrome bug workaround: poll speechSynthesis.speaking
        let endHandled = false;
        const handleEnd = () => {
          if (endHandled) return;
          endHandled = true;
          console.log("🔊 TTS ended, scheduling restart...");
          stateRef.current.isSpeaking = false;
          setIsSpeaking(false);

          if (stateRef.current.isActive) {
            scheduleRestart();
          }
          resolve();
        };

        utterance.onstart = () => {
          console.log("🔊 TTS started");
          stateRef.current.isSpeaking = true;
          setIsSpeaking(true);

          // Chrome bug workaround: poll to detect when speaking stops
          const checkSpeaking = setInterval(() => {
            if (!speechSynthesis.speaking && !speechSynthesis.pending) {
              clearInterval(checkSpeaking);
              console.log("🔊 Detected speech ended via polling");
              handleEnd();
            }
          }, 100);

          // Safety timeout - max 30 seconds
          setTimeout(() => {
            clearInterval(checkSpeaking);
            if (!endHandled) {
              console.log("🔊 Safety timeout triggered");
              handleEnd();
            }
          }, 30000);
        };

        utterance.onend = () => {
          console.log("🔊 TTS onend fired");
          handleEnd();
        };

        utterance.onerror = (event) => {
          console.error("🔊 TTS error:", event.error);
          handleEnd();
        };

        speechSynthesis.speak(utterance);
      });
    },
    [language, speechSynthesis, stopRecognition, scheduleRestart],
  );

  // Handle user input - send to backend
  const handleUserInput = useCallback(
    async (text) => {
      if (!text.trim()) return;

      console.log("🤖 Processing:", text);

      stopRecognition();
      stateRef.current.isProcessing = true;
      setIsProcessing(true);
      setCurrentTranscript("");
      accumulatedTextRef.current = "";

      onUserSpeech?.(text);

      try {
        const response = await chatbotService.sendMessage(text);
        const chatResponse = response?.chatbotResponse || response;
        const auraText =
          chatResponse?.summary ||
          chatResponse?.recommendation ||
          chatResponse?.message ||
          "I didn't understand that.";

        console.log("🤖 Aura:", auraText);
        onAuraResponse?.(auraText);

        stateRef.current.isProcessing = false;
        setIsProcessing(false);

        await speakResponse(auraText);
      } catch (err) {
        console.error("🤖 Error:", err);
        stateRef.current.isProcessing = false;
        setIsProcessing(false);

        const errorText = "Sorry, I encountered an error. Please try again.";
        onAuraResponse?.(errorText);
        await speakResponse(errorText);
      }
    },
    [onUserSpeech, onAuraResponse, speakResponse, stopRecognition],
  );

  // Keep ref updated
  handleUserInputRef.current = handleUserInput;

  // Initialize recognition - runs once
  useEffect(() => {
    if (!SpeechRecognition) {
      setError("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      stateRef.current.isListening = true;
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      // Clear silence timer on new speech
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const displayText = finalTranscript || interimTranscript;
      if (displayText) {
        setCurrentTranscript(displayText);
      }

      if (finalTranscript) {
        accumulatedTextRef.current += finalTranscript;

        // Set silence timer to send after user stops speaking
        silenceTimerRef.current = setTimeout(() => {
          silenceTimerRef.current = null;
          const textToSend = accumulatedTextRef.current.trim();
          if (
            textToSend &&
            stateRef.current.isActive &&
            !stateRef.current.isSpeaking
          ) {
            handleUserInputRef.current?.(textToSend);
          }
        }, silenceTimeout);
      }
    };

    recognition.onerror = (event) => {
      stateRef.current.isListening = false;
      setIsListening(false);

      if (event.error === "not-allowed") {
        setError("Microphone access denied");
        onErrorRef.current?.("Microphone access denied");
        return;
      }

      // For other errors (no-speech, aborted), schedule restart if still active
      if (stateRef.current.isActive && !stateRef.current.isSpeaking) {
        scheduleRestartRef.current?.();
      }
    };

    recognition.onend = () => {
      stateRef.current.isListening = false;
      setIsListening(false);

      // Only restart if:
      // - Agent is active
      // - Not speaking or processing
      // - No pending silence timer (meaning user wasn't in middle of speaking)
      if (
        stateRef.current.isActive &&
        !stateRef.current.isSpeaking &&
        !stateRef.current.isProcessing &&
        !silenceTimerRef.current
      ) {
        scheduleRestartRef.current?.();
      }
    };

    recognitionRef.current = recognition;

    return () => {
      clearAllTimers();
      recognition.abort();
    };
  }, [SpeechRecognition, language, silenceTimeout]);

  // Start agent
  const startAgent = useCallback(() => {
    console.log("🎙️ Starting...");

    stateRef.current = {
      isActive: true,
      isSpeaking: false,
      isListening: false,
      isProcessing: false,
    };

    setIsActive(true);
    setError(null);
    setCurrentTranscript("");
    accumulatedTextRef.current = "";

    // Greet user - listening starts after greeting ends
    speakResponse(
      "Hi! I'm Aura, your fitness coach. How can I help you today?",
    );
  }, [speakResponse]);

  // Stop agent
  const stopAgent = useCallback(() => {
    console.log("🎙️ Stopping...");

    stateRef.current.isActive = false;
    setIsActive(false);

    clearAllTimers();

    if (speechSynthesis) {
      speechSynthesis.cancel();
    }

    stateRef.current.isSpeaking = false;
    setIsSpeaking(false);

    stopRecognition();

    setCurrentTranscript("");
    accumulatedTextRef.current = "";
  }, [speechSynthesis, stopRecognition, clearAllTimers]);

  // Interrupt speaking
  const interrupt = useCallback(() => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
    }

    stateRef.current.isSpeaking = false;
    setIsSpeaking(false);

    if (stateRef.current.isActive) {
      scheduleRestart();
    }
  }, [speechSynthesis, scheduleRestart]);

  return {
    isActive,
    isListening,
    isSpeaking,
    isProcessing,
    currentTranscript,
    error,
    isSupported,
    startAgent,
    stopAgent,
    interrupt,
  };
};

export default useVoiceAgent;
