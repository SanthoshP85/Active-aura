/**
 * VoiceAgent Component
 * Real-time voice conversation interface with Aura
 */

import React from "react";
import { Mic, Volume2, Loader2, Phone, PhoneOff } from "lucide-react";
import useVoiceAgent from "../../hooks/useVoiceAgent";

const VoiceAgent = ({ onConversation, className = "" }) => {
  const {
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
  } = useVoiceAgent({
    onUserSpeech: (text) => {
      onConversation?.({ type: "user", text });
    },
    onAuraResponse: (text) => {
      onConversation?.({ type: "bot", text });
    },
  });

  if (!isSupported) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <p className="text-red-500 text-sm">
          Voice conversation not supported in this browser.
          <br />
          Please use Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }

  // Determine current state for UI
  const getStateInfo = () => {
    if (!isActive) {
      return {
        icon: Phone,
        color: "bg-emerald-500 hover:bg-emerald-600",
        text: "Start Voice Chat",
        pulse: false,
      };
    }
    if (isProcessing) {
      return {
        icon: Loader2,
        color: "bg-yellow-500",
        text: "Thinking...",
        pulse: false,
        spin: true,
      };
    }
    if (isSpeaking) {
      return {
        icon: Volume2,
        color: "bg-blue-500",
        text: "Aura is speaking...",
        pulse: true,
      };
    }
    if (isListening) {
      return {
        icon: Mic,
        color: "bg-red-500",
        text: "Listening...",
        pulse: true,
      };
    }
    return {
      icon: Mic,
      color: "bg-emerald-500",
      text: "Ready",
      pulse: false,
    };
  };

  const state = getStateInfo();
  const Icon = state.icon;

  const handleMainClick = () => {
    if (!isActive) {
      startAgent();
    } else if (isSpeaking) {
      interrupt();
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Main Voice Button */}
      <div className="relative">
        {/* Pulse ring animation */}
        {state.pulse && (
          <div
            className="absolute inset-0 rounded-full opacity-25 animate-ping"
            style={{ backgroundColor: isListening ? "#ef4444" : "#3b82f6" }}
          />
        )}

        <button
          onClick={handleMainClick}
          disabled={isProcessing}
          className={`relative z-10 p-6 rounded-full text-white shadow-xl transition-all duration-300 transform hover:scale-105 ${state.color} ${state.pulse ? "animate-pulse" : ""}`}
        >
          <Icon className={`w-10 h-10 ${state.spin ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Status Text */}
      <div className="text-center">
        <p
          className={`font-medium ${
            isListening
              ? "text-red-500"
              : isSpeaking
                ? "text-blue-500"
                : isProcessing
                  ? "text-yellow-600"
                  : isActive
                    ? "text-emerald-500"
                    : "text-gray-600"
          }`}
        >
          {state.text}
        </p>

        {/* Live transcript */}
        {currentTranscript && (
          <p className="mt-2 text-sm text-gray-500 max-w-xs">
            &quot;{currentTranscript}&quot;
          </p>
        )}

        {/* Error */}
        {error && <p className="mt-2 text-sm text-red-500">⚠️ {error}</p>}
      </div>

      {/* Stop Button (when active) */}
      {isActive && (
        <button
          onClick={stopAgent}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
        >
          <PhoneOff size={18} />
          <span>End Call</span>
        </button>
      )}

      {/* Instructions */}
      {!isActive && (
        <p className="text-xs text-gray-400 text-center max-w-xs">
          Click to start a voice conversation with Aura.
          <br />
          Just speak naturally - Aura will respond automatically!
        </p>
      )}

      {/* Interrupt hint */}
      {isSpeaking && (
        <p className="text-xs text-gray-400">Click the button to interrupt</p>
      )}
    </div>
  );
};

export default VoiceAgent;
