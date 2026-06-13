/**
 * Voice Chat Component
 * Combined voice interaction button for Aura
 * Flow: Record → STT → Aura → TTS → Play
 */

import { Mic, MicOff, Loader2, Volume2 } from "lucide-react";
import useVoiceChat from "../../hooks/useVoiceChat";

const VoiceChat = ({ onMessage, className = "" }) => {
  const {
    isRecording,
    isProcessing,
    isPlaying,
    lastTranscript,
    error,
    startRecording,
    stopRecording,
    stopAudio,
  } = useVoiceChat({
    onResponse: (data) => {
      if (onMessage && data.userText && data.auraResponse) {
        onMessage({ type: "user", text: data.userText });
        onMessage({ type: "assistant", text: data.auraResponse });
      }
    },
  });

  const handleClick = async () => {
    if (isPlaying) {
      stopAudio();
    } else if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const getButtonState = () => {
    if (isProcessing) return { bg: "bg-yellow-500", icon: Loader2, spin: true };
    if (isPlaying) return { bg: "bg-blue-500", icon: Volume2, spin: false };
    if (isRecording)
      return { bg: "bg-red-500 animate-pulse", icon: MicOff, spin: false };
    return {
      bg: "bg-emerald-500 hover:bg-emerald-600",
      icon: Mic,
      spin: false,
    };
  };

  const state = getButtonState();
  const Icon = state.icon;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <button
        onClick={handleClick}
        disabled={isProcessing}
        className={`p-4 rounded-full text-white shadow-lg transition-all duration-200 ${state.bg}`}
        title={
          isPlaying
            ? "Stop audio"
            : isRecording
              ? "Stop recording"
              : "Start voice chat"
        }
      >
        <Icon className={`w-6 h-6 ${state.spin ? "animate-spin" : ""}`} />
      </button>

      {/* Status text */}
      <div className="text-center text-sm">
        {isRecording && (
          <span className="text-red-500 font-medium animate-pulse">
            🎤 Listening...
          </span>
        )}
        {isProcessing && (
          <span className="text-yellow-600">⏳ Processing...</span>
        )}
        {isPlaying && (
          <span className="text-blue-500">🔊 Aura is speaking...</span>
        )}
        {error && <span className="text-red-500">{error}</span>}
      </div>

      {/* Last transcript preview */}
      {lastTranscript && !isRecording && !isProcessing && (
        <div className="text-xs text-gray-500 max-w-xs truncate">
          You said: &quot;{lastTranscript}&quot;
        </div>
      )}
    </div>
  );
};

export default VoiceChat;
