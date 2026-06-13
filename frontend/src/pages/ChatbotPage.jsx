/**
 * ChatbotPage
 * AI chatbot interface with real-time voice agent support
 */

import { useState, useEffect, useRef } from "react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { chatbotService } from "../services/chatbotService";
import { Send, Mic, MicOff, Volume2, Phone } from "lucide-react";
import useTextToSpeech from "../hooks/useTextToSpeech";
import useSpeechToText from "../hooks/useSpeechToText";
import VoiceAgent from "../components/voice/VoiceAgent";

export const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Aura, your AI fitness coach. How can I help you today? You can type, use the microphone, or start a voice conversation!",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVoiceAgent, setShowVoiceAgent] = useState(false);
  const messagesEndRef = useRef(null);

  // Voice hooks for text input mode
  const { speak, isPlaying } = useTextToSpeech();
  const {
    isListening: isRecording,
    startListening: startRecording,
    stopListening: stopRecording,
    error: voiceError,
    isSupported: isVoiceSupported,
  } = useSpeechToText({
    onTranscript: (text) => {
      if (text) {
        setInputValue((prev) => prev + text);
      }
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle mic button click
  const handleMicClick = () => {
    if (!isVoiceSupported) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Handle voice agent conversation updates
  const handleVoiceConversation = (message) => {
    const newMessage = {
      id: Date.now(),
      text: message.text,
      sender: message.type === "user" ? "user" : "bot",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue("");

    setIsLoading(true);
    try {
      const response = await chatbotService.sendMessage(messageText);
      const chatResponse = response?.chatbotResponse || response;
      const botMessage = {
        id: Date.now() + 1,
        text:
          chatResponse?.summary ||
          chatResponse?.recommendation ||
          chatResponse?.message ||
          "I didn't understand that. Please try again.",
        sender: "bot",
        timestamp: new Date(),
        confidence: chatResponse?.confidenceScore,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Mode Toggle */}
        <div className="flex justify-center mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-full p-1 shadow-md flex gap-1">
            <button
              onClick={() => setShowVoiceAgent(false)}
              className={
                "px-4 py-2 rounded-full transition-all " +
                (!showVoiceAgent
                  ? "bg-emerald-500 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700")
              }
            >
              💬 Text Chat
            </button>
            <button
              onClick={() => setShowVoiceAgent(true)}
              className={
                "px-4 py-2 rounded-full transition-all flex items-center gap-2 " +
                (showVoiceAgent
                  ? "bg-emerald-500 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700")
              }
            >
              <Phone size={16} />
              Voice Call
            </button>
          </div>
        </div>

        {/* Voice Agent Mode */}
        {showVoiceAgent ? (
          <Card className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Voice Conversation with Aura
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Have a natural voice conversation - just speak and listen!
              </p>
            </div>

            <VoiceAgent
              onConversation={handleVoiceConversation}
              className="py-8"
            />

            {/* Conversation History */}
            {messages.length > 1 && (
              <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  Conversation History
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {messages.slice(1).map((message) => (
                    <div
                      key={message.id}
                      className={
                        "flex " +
                        (message.sender === "user"
                          ? "justify-end"
                          : "justify-start")
                      }
                    >
                      <div
                        className={
                          "max-w-xs px-3 py-2 rounded-lg text-sm " +
                          (message.sender === "user"
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200")
                        }
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ) : (
          /* Text Chat Mode */
          <Card className="flex flex-col min-h-[500px]">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    "flex " +
                    (message.sender === "user"
                      ? "justify-end"
                      : "justify-start")
                  }
                >
                  <div
                    className={
                      "max-w-xs lg:max-w-md px-4 py-2 rounded-lg " +
                      (message.sender === "user"
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200")
                    }
                  >
                    <p>{message.text}</p>
                    {message.confidence && (
                      <p className="text-xs mt-1 opacity-75">
                        Confidence: {(message.confidence * 100).toFixed(0)}%
                      </p>
                    )}
                    {/* TTS button for bot messages */}
                    {message.sender === "bot" && (
                      <button
                        onClick={() => speak(message.text)}
                        className="mt-2 p-1 rounded-full bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                        title="Listen to this message"
                      >
                        <Volume2
                          size={14}
                          className={
                            isPlaying
                              ? "text-emerald-600"
                              : "text-gray-600 dark:text-gray-300"
                          }
                        />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 px-4 py-2 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                {/* Mic Button */}
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={isLoading}
                  className={
                    "p-2 rounded-lg transition-all duration-200 " +
                    (isRecording
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600")
                  }
                  title={isRecording ? "Stop recording" : "Start voice input"}
                >
                  {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <Input
                  type="text"
                  placeholder={
                    isRecording
                      ? "Listening..."
                      : "Ask me anything about your fitness..."
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading || isRecording}
                  containerClassName="flex-1"
                />
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  disabled={isLoading || !inputValue.trim() || isRecording}
                >
                  <Send size={18} />
                </Button>
              </form>

              {/* Voice status */}
              {(isRecording || isPlaying || voiceError) && (
                <div className="mt-2 text-center text-sm">
                  {isRecording && (
                    <span className="text-red-500 animate-pulse">
                      🎤 Listening...
                    </span>
                  )}
                  {isPlaying && (
                    <span className="text-blue-500">
                      🔊 Aura is speaking...
                    </span>
                  )}
                  {voiceError && (
                    <span className="text-red-600">⚠️ {voiceError}</span>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChatbotPage;
