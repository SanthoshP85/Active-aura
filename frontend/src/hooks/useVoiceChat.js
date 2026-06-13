/**
 * Voice Chat Hook
 * Combined voice-to-voice interaction with Aura
 * Flow: Record → STT → LLM → TTS → Play
 */

import { useState, useRef, useCallback } from "react";
import api from "../services/api";

const useVoiceChat = (options = {}) => {
  const { onResponse, onError } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [lastResponse, setLastResponse] = useState("");
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });

      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (err) {
      const errorMsg = "Microphone access denied";
      setError(errorMsg);
      onError?.(errorMsg);
    }
  }, [onError]);

  const stopRecording = useCallback(async () => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;

      if (!mediaRecorder || mediaRecorder.state === "inactive") {
        resolve(null);
        return;
      }

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsProcessing(true);

        try {
          const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");

          // Call voice chat endpoint (complete pipeline)
          const response = await api.post("/voice/chat", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          const data = response.data;
          setLastTranscript(data.userText || "");
          setLastResponse(data.auraResponse || "");

          // Play audio response if available
          if (data.audioBase64) {
            await playAudio(data.audioBase64);
          }

          onResponse?.(data);
          resolve(data);
        } catch (err) {
          const errorMsg = err.response?.data?.error || "Voice chat failed";
          setError(errorMsg);
          onError?.(errorMsg);
          resolve(null);
        } finally {
          setIsProcessing(false);
          streamRef.current?.getTracks().forEach((t) => t.stop());
        }
      };

      mediaRecorder.stop();
    });
  }, [onResponse, onError]);

  const playAudio = useCallback(async (base64Audio) => {
    try {
      // Stop any playing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audioData = atob(base64Audio);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }

      const audioBlob = new Blob([audioArray], { type: "audio/flac" });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (err) {
      console.error("Audio playback error:", err);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const cancelRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
    setIsProcessing(false);
  }, []);

  return {
    isRecording,
    isProcessing,
    isPlaying,
    lastTranscript,
    lastResponse,
    error,
    startRecording,
    stopRecording,
    stopAudio,
    cancelRecording,
  };
};

export default useVoiceChat;
