"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import "./AIChatBot.css";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type Role = "user" | "assistant";

interface Source {
  type: string;
  description: string;
}

interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  sources?: Source[];
  verification_status?: string;
}

interface QuickPrompt {
  label: string;
  text: string;
  icon: string;
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

const QUICK_PROMPTS: QuickPrompt[] = [
  { label: "Heritage Sites", text: "Tell me about nearby heritage sites", icon: "🏛️" },
  { label: "Contribute", text: "How can I contribute to Lok-Virasat?", icon: "✍️" },
  { label: "History", text: "What is the history of this monument?", icon: "📜" },
  { label: "Map Guide", text: "How do I use the heritage map?", icon: "🗺️" },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function TypingIndicator() {
  return (
    <div className="chatbot-typing-indicator">
      <div className="chatbot-typing-avatar">
        <span>✦</span>
      </div>
      <div className="chatbot-typing-bubble">
        <span className="chatbot-dot" />
        <span className="chatbot-dot" />
        <span className="chatbot-dot" />
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  return (
    <div className={`chatbot-message-row ${isUser ? "chatbot-message-row--user" : "chatbot-message-row--bot"}`}>
      {!isUser && (
        <div className="chatbot-avatar chatbot-avatar--bot">
          <span>✦</span>
        </div>
      )}
      <div className={`chatbot-bubble ${isUser ? "chatbot-bubble--user" : "chatbot-bubble--bot"}`}>
        <p className="chatbot-bubble-text">{message.text}</p>
        
        {/* Render sources if available */}
        {message.sources && message.sources.length > 0 && (
          <div className="chatbot-sources">
            <p className="chatbot-sources-title">Sources used:</p>
            <ul className="chatbot-sources-list">
              {message.sources.map((src, idx) => (
                <li key={idx} className="chatbot-source-item">
                  <span className="chatbot-source-icon">
                    {src.type.toLowerCase().includes("photo") ? "📷" : src.type.toLowerCase().includes("oral") ? "🎙️" : "📜"}
                  </span>
                  <span className="chatbot-source-desc">{src.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Render verification status if available */}
        {message.verification_status && (
          <div className="chatbot-verification">
            <span className={`chatbot-verification-badge ${message.verification_status.includes("Supported") ? "chatbot-verification-badge--ok" : "chatbot-verification-badge--warn"}`}>
              {message.verification_status.includes("Supported") ? "✓" : "⚠"} {message.verification_status}
            </span>
          </div>
        )}

        <span className="chatbot-bubble-time">{formatTime(message.timestamp)}</span>
      </div>
      {isUser && (
        <div className="chatbot-avatar chatbot-avatar--user">
          <span>👤</span>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: "assistant",
      text: "Namaste! 🙏 I'm Virasat AI, your heritage guide. Ask me anything about India's cultural heritage, monuments, or how to use Lok-Virasat.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* scroll to bottom on new message */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* focus input when chat opens */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setHasUnread(false);
    }
  }, [isOpen]);

  /* auto-resize textarea */
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isTyping) return;

      const userMsg: Message = {
        id: generateId(),
        role: "user",
        text: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      setShowQuickPrompts(false);
      setIsTyping(true);

      /* reset textarea height */
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }

      const history = [...messages, userMsg].map(m => ({
        role: m.role,
        text: m.text
      }));

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const response = await fetch(`${API_URL}/api/ai/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: history }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch response");
        }

        const data = await response.json();
        
        const botMsg: Message = {
          id: generateId(),
          role: "assistant",
          text: data.text || "Sorry, I couldn't process that.",
          timestamp: new Date(),
          sources: data.sources,
          verification_status: data.verification_status,
        };

        setMessages((prev) => [...prev, botMsg]);
      } catch (error) {
        console.error("Chat error:", error);
        const errorMsg: Message = {
          id: generateId(),
          role: "assistant",
          text: "I am having trouble connecting to the backend. Please ensure the server is running and the Gemini API key is configured.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }

      setIsTyping(false);

      if (!isOpen) setHasUnread(true);
    },
    [messages, isTyping, isOpen]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleQuickPrompt = (prompt: QuickPrompt) => {
    sendMessage(prompt.text);
  };

  const clearChat = () => {
    setMessages([
      {
        id: generateId(),
        role: "assistant",
        text: "Namaste! 🙏 I'm Virasat AI, your heritage guide. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
    setShowQuickPrompts(true);
  };

  return (
    <>
      {/* ── Floating Trigger Button ────────────────────────────── */}
      <button
        id="chatbot-trigger-btn"
        className={`chatbot-trigger ${isOpen ? "chatbot-trigger--active" : ""}`}
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
        title="Virasat AI"
      >
        {/* unread badge */}
        {hasUnread && !isOpen && <span className="chatbot-unread-badge" />}

        {/* icon morphs between sparkle and close */}
        <span className={`chatbot-trigger-icon chatbot-trigger-icon--open ${isOpen ? "chatbot-trigger-icon--hidden" : ""}`}>
          ✦
        </span>
        <span className={`chatbot-trigger-icon chatbot-trigger-icon--close ${isOpen ? "" : "chatbot-trigger-icon--hidden"}`}>
          ✕
        </span>

        {/* pulse ring */}
        {!isOpen && <span className="chatbot-pulse-ring" />}
      </button>

      {/* ── Chat Window ───────────────────────────────────────── */}
      <div
        id="chatbot-window"
        className={`chatbot-window ${isOpen ? "chatbot-window--open" : ""}`}
        role="dialog"
        aria-label="Virasat AI Chat"
        aria-modal="true"
      >
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-left">
            <div className="chatbot-header-avatar">
              <span>✦</span>
            </div>
            <div className="chatbot-header-info">
              <h2 className="chatbot-header-title">Virasat AI</h2>
              <span className="chatbot-header-status">
                <span className="chatbot-status-dot" />
                Online · Heritage Guide
              </span>
            </div>
          </div>
          <div className="chatbot-header-actions">
            <button
              className="chatbot-icon-btn"
              onClick={clearChat}
              title="Clear chat"
              aria-label="Clear conversation"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
            </button>
            <button
              className="chatbot-icon-btn chatbot-icon-btn--close"
              onClick={() => setIsOpen(false)}
              title="Close chat"
              aria-label="Close chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chatbot-messages" role="log" aria-live="polite">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isTyping && <TypingIndicator />}

          {/* Quick prompts */}
          {showQuickPrompts && messages.length === 1 && (
            <div className="chatbot-quick-prompts">
              <p className="chatbot-quick-prompts-label">Quick questions</p>
              <div className="chatbot-quick-prompts-grid">
                {QUICK_PROMPTS.map((qp) => (
                  <button
                    key={qp.label}
                    className="chatbot-quick-btn"
                    onClick={() => handleQuickPrompt(qp)}
                    disabled={isTyping}
                  >
                    <span className="chatbot-quick-btn-icon">{qp.icon}</span>
                    <span>{qp.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chatbot-input-area">
          <div className="chatbot-input-wrapper">
            <textarea
              ref={inputRef}
              id="chatbot-input"
              className="chatbot-textarea"
              placeholder="Ask about India's heritage…"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              aria-label="Message input"
              disabled={isTyping}
            />
            <button
              id="chatbot-send-btn"
              className={`chatbot-send-btn ${inputValue.trim() && !isTyping ? "chatbot-send-btn--active" : ""}`}
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="chatbot-input-hint">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </>
  );
}
