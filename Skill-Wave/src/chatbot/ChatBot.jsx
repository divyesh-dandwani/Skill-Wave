import React, { useState, useEffect } from "react";
import { Moon, Sun, X } from "lucide-react";
import Chatbot_Chat from "../../public/Chatbot_Chat.jpg";

const formatTime = (isoString) => {
  const date = new Date(isoString);
  if (isNaN(date)) return "";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const MessageBubble = ({ message, isUser }) => {
  const baseStyles =
    "max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-md transition-all duration-300";
  const userStyles = "ml-auto bg-purple-600 text-white rounded-br-none";
  const botStyles = "mr-auto bg-gray-200 text-gray-900 rounded-bl-none";

  return (
    <div
      className={`my-2 flex flex-col ${isUser ? "items-end" : "items-start"}`}
    >
      <div className="flex items-end gap-2">
        {!isUser && (
          <img src={Chatbot_Chat} className="w-6 h-6 rounded-full" alt="Bot" />
        )}
        <div className={`${baseStyles} ${isUser ? userStyles : botStyles}`}>
          {message.content}
        </div>
        {isUser && (
          <img
            src={
              JSON.parse(localStorage.getItem("userData"))?.profileImage ||
              "https://i.ibb.co/kH3S7rx/user-avatar.png"
            }
            className="w-6 h-6 rounded-full"
            alt="User"
          />
        )}
      </div>
      <span className="text-xs text-gray-500 mt-1">
        {formatTime(message.time)}
      </span>
    </div>
  );
};

const ChatBot = ({ onClose }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
      time: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer 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",
          "Content-Type": "application/json",
          "HTTP-Referer": "https://skillwave.ai",
          "X-Title": "SkillWave AI Chatbot"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1:free",
          messages: [{ role: "user", content: input }]
        })
      });

      const data = await response.json();
      const botText =
        data?.choices?.[0]?.message?.content || "⚠️ No response from DeepSeek";

      const botMessage = {
        role: "bot",
        content: botText,
        time: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "❌ Error: " + err.message,
          time: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md h-[80vh] ${
          darkMode ? "bg-gray-800 text-white" : "bg-white"
        } rounded-2xl shadow-2xl flex flex-col overflow-hidden relative`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100/20 transition-colors"
        >
          <X size={20} className="text-white" />
        </button>

        <div className="flex justify-between items-center px-6 py-4 shadow-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <h1
            className="font-semibold"
            style={{ textAlign: "center", width: "100%" }}
          >
            SkillWave Chatbot Assistant
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="hover:scale-110 transition-transform absolute left-4"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div
          id="chat-container"
          className="flex-1 p-4 overflow-y-auto custom-scrollbar"
        >
          {messages.map((msg, index) => (
            <MessageBubble
              key={index}
              message={msg}
              isUser={msg.role === "user"}
            />
          ))}
          {loading && (
            <div className="text-sm text-gray-500 dark:text-gray-400 italic mt-2">
              Bot is typing...
            </div>
          )}
        </div>

        <div className="p-4 border-t dark:border-gray-700 flex items-center gap-2">
          <input
            type="text"
            className={`flex-1 px-4 py-2 rounded-full focus:outline-none focus:ring-2 ${
              darkMode
                ? "bg-gray-700 border-gray-600 focus:ring-purple-500 text-white"
                : "bg-gray-100 border-gray-300 focus:ring-purple-400"
            }`}
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            className={`bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-full transition-all ${
              loading ? "opacity-70" : ""
            }`}
            onClick={handleSend}
            disabled={loading}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
