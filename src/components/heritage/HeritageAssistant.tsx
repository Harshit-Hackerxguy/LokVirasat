'use client';

/**
 * HeritageAssistant.tsx
 *
 * AI-powered chat assistant for a specific heritage site.
 * The UI is fully implemented; it calls /api/ai/chat which currently
 * returns a placeholder response until GEMINI_API_KEY is configured.
 *
 * Features:
 *  - Multilingual input (user types in any language)
 *  - Citation display (image / document / oral / text badges)
 *  - Conversation history maintained in component state
 *  - Animated streaming-style message display
 *  - "AI not configured" banner when running on placeholder
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, BookOpen, Mic, Image, FileText, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import type { ChatMessage, ChatResponse, Citation } from '@/app/api/ai/chat/route';

// ── Types ─────────────────────────────────────────────────────────────────────

interface UiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  isPlaceholder?: boolean;
  isLoading?: boolean;
}

interface HeritageAssistantProps {
  siteId: string;
  siteName: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function CitationIcon({ type }: { type: Citation['type'] }) {
  switch (type) {
    case 'image':    return <Image size={12} />;
    case 'oral':     return <Mic size={12} />;
    case 'document': return <FileText size={12} />;
    default:         return <BookOpen size={12} />;
  }
}

function CitationBadge({ citation }: { citation: Citation }) {
  return (
    <span className="ha-citation">
      <CitationIcon type={citation.type} />
      <span>{citation.label}</span>
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

const WELCOME_MESSAGE: UiMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'नमस्ते 🙏 I am the Heritage Assistant for this site. Ask me anything — '
    + 'history, traditions, oral accounts, or recent condition reports. '
    + 'You can write in **English, Hindi, Tamil, Telugu, or any Indian language**.',
  citations: [],
};

export default function HeritageAssistant({ siteId, siteName }: HeritageAssistantProps) {
  const [messages, setMessages]     = useState<UiMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput]           = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [isPlaceholderMode, setIsPlaceholderMode] = useState(false);
  const bottomRef                   = useRef<HTMLDivElement>(null);
  const inputRef                    = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: UiMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
    };

    const loadingMsg: UiMessage = {
      id: `l-${Date.now()}`,
      role: 'assistant',
      content: '',
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput('');
    setIsLoading(true);

    // Build history for API (exclude welcome + loading)
    const history: ChatMessage[] = messages
      .filter((m) => m.role !== 'system' && !m.isLoading && m.id !== 'welcome')
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, message: text, history }),
      });

      const json = await res.json();
      const data: ChatResponse = json.data;

      const assistantMsg: UiMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        citations: data.citations,
        isPlaceholder: data._isPlaceholder,
      };

      if (data._isPlaceholder) setIsPlaceholderMode(true);

      setMessages((prev) => [
        ...prev.filter((m) => !m.isLoading),
        assistantMsg,
      ]);
    } catch (err) {
      const errorMsg: UiMessage = {
        id: `e-${Date.now()}`,
        role: 'system',
        content: 'Failed to reach the AI assistant. Please try again.',
      };
      setMessages((prev) => [...prev.filter((m) => !m.isLoading), errorMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, messages, siteId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const reset = () => {
    setMessages([WELCOME_MESSAGE]);
    setIsPlaceholderMode(false);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="heritage-assistant">
      {/* Header */}
      <div className="ha-header">
        <div className="ha-header-left">
          <div className="ha-avatar">
            <Bot size={20} />
          </div>
          <div>
            <div className="ha-title">
              <Sparkles size={14} />
              Heritage Assistant
            </div>
            <div className="ha-subtitle">Powered by Gemini AI · {siteName}</div>
          </div>
        </div>
        <button onClick={reset} className="ha-reset-btn" title="Reset conversation">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Placeholder warning banner */}
      {isPlaceholderMode && (
        <div className="ha-placeholder-banner">
          <AlertTriangle size={14} />
          <span>
            AI not configured. Add <code>GEMINI_API_KEY</code> to <code>.env.local</code> to enable real responses.
          </span>
        </div>
      )}

      {/* Message list */}
      <div className="ha-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`ha-msg ha-msg--${msg.role}`}>
            {msg.role !== 'user' && (
              <div className="ha-msg-avatar">
                {msg.role === 'assistant' ? <Bot size={16} /> : <AlertTriangle size={16} />}
              </div>
            )}

            <div className="ha-msg-bubble">
              {msg.isLoading ? (
                <div className="ha-typing">
                  <span /><span /><span />
                </div>
              ) : (
                <>
                  <div
                    className="ha-msg-text"
                    dangerouslySetInnerHTML={{
                      __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>'),
                    }}
                  />
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="ha-citations">
                      <span className="ha-citations-label">Sources:</span>
                      {msg.citations.map((c, i) => (
                        <CitationBadge key={i} citation={c} />
                      ))}
                    </div>
                  )}
                  {msg.isPlaceholder && (
                    <div className="ha-placeholder-tag">
                      <Bot size={10} /> Placeholder response
                    </div>
                  )}
                </>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="ha-msg-avatar ha-msg-avatar--user">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="ha-input-row">
        <textarea
          ref={inputRef}
          className="ha-input"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask in any language… (Enter to send)"
          disabled={isLoading}
        />
        <button
          className="ha-send-btn"
          onClick={sendMessage}
          disabled={!input.trim() || isLoading}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
