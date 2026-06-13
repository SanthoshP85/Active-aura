/**
 * Speech-to-Text Component (Standalone)
 * Mic button with recording indicator
 */

import React from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import useSpeechToText from "../../hooks/useSpeechToText";

const SpeechToText = ({ onTranscript, className = "", size = "md" }) => {
  const { isRecording, isProcessing, error, startRecording, stopRecording } =
    useSpeechToText({ onTranscript });

  const handleClick = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const sizeClasses = {
    sm: "p-2",
    md: "p-3",
    lg: "p-4",
  };

  const iconClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleClick}
        disabled={isProcessing}
        className={`rounded-full transition-all duration-200 text-white shadow-lg
          ${sizeClasses[size]}
          ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : isProcessing
                ? "bg-gray-400 cursor-wait"
                : "bg-emerald-500 hover:bg-emerald-600"
          }`}
        title={isRecording ? "Stop recording" : "Start recording"}
      >
        {isProcessing ? (
          <Loader2 className={`${iconClasses[size]} animate-spin`} />
        ) : isRecording ? (
          <MicOff className={iconClasses[size]} />
        ) : (
          <Mic className={iconClasses[size]} />
        )}
      </button>

      {isRecording && (
        <span className="text-red-500 text-sm font-medium animate-pulse">
          Listening...
        </span>
      )}

      {isProcessing && (
        <span className="text-gray-500 text-sm">Processing...</span>
      )}

      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  );
};

export default SpeechToText;
