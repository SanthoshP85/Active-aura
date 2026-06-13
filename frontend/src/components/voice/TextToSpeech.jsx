/**
 * Text-to-Speech Component (Standalone)
 * Speaker button to read text aloud
 */

import { Volume2, VolumeX, Loader2 } from "lucide-react";
import useTextToSpeech from "../../hooks/useTextToSpeech";

const TextToSpeech = ({ text, className = "", size = "sm" }) => {
  const { isLoading, isPlaying, speak, stop } = useTextToSpeech();

  const handleClick = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(text);
    }
  };

  const sizeClasses = {
    xs: "p-1",
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  };

  const iconClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  if (!text) return null;

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`rounded-full transition-all duration-200 
        ${sizeClasses[size]}
        ${
          isPlaying
            ? "bg-emerald-100 text-emerald-600"
            : "bg-gray-100 hover:bg-gray-200 text-gray-600"
        }
        ${className}`}
      title={isPlaying ? "Stop" : "Listen"}
    >
      {isLoading ? (
        <Loader2 className={`${iconClasses[size]} animate-spin`} />
      ) : isPlaying ? (
        <VolumeX className={iconClasses[size]} />
      ) : (
        <Volume2 className={iconClasses[size]} />
      )}
    </button>
  );
};

export default TextToSpeech;
