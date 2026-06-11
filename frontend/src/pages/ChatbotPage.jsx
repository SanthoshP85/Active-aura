/**
 * ChatbotPage
 * AI chatbot interface
 */

import { useState, useEffect, useRef } from "react";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { chatbotService } from "../services/chatbotService";
import { Send } from "lucide-react";

export const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI fitness coach. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Send to API
    setIsLoading(true);
    try {
      const response = await chatbotService.sendMessage(inputValue);
      // API returns: { userMessage, chatbotResponse: { summary, recommendation, confidenceScore, dataAvailable } }
      const chatResponse = response?.chatbotResponse || response;
      const botMessage = {
        id: messages.length + 2,
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
        id: messages.length + 2,
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
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto w-full h-full flex flex-col">
        <Card className="flex flex-col min-h-96">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === "user"
                      ? "bg-primary-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <p>{message.text}</p>
                  {message.confidence && (
                    <p className="text-xs mt-1 opacity-75">
                      Confidence: {(message.confidence * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
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
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                type="text"
                placeholder="Ask me anything about your fitness..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                containerClassName="flex-1"
              />
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                disabled={isLoading || !inputValue.trim()}
              >
                <Send size={18} />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChatbotPage;
