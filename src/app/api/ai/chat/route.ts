/**
 * POST /api/ai/chat
 *
 * Heritage AI Assistant (RAG Chat) endpoint.
 *
 * ┌──────────────────────────────────────────────────────────┐
 * │  🤖  AI PLACEHOLDER  —  NOT IMPLEMENTED YET             │
 * │                                                          │
 * │  When the Gemini API key is configured, this route will: │
 * │  1. Receive: siteId, userMessage, conversationHistory    │
 * │  2. Fetch the Heritage Record from the database          │
 * │  3. Inject it into a grounded system prompt              │
 * │  4. Call Gemini 1.5 Flash (streaming preferred)          │
 * │  5. Return an answer grounded in the site's data,        │
 * │     with inline citations, in the user's language        │
 * │     (multilingual — Gemini handles Hindi, Tamil, etc.)   │
 * └──────────────────────────────────────────────────────────┘
 */

import { NextRequest, NextResponse } from 'next/server';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  siteId: string;
  message: string;
  history?: ChatMessage[];
  /** Preferred reply language — defaults to auto-detect from message */
  language?: string;
}

export interface ChatResponse {
  reply: string;
  citations: Citation[];
  language: string;
  _isAiGenerated: boolean;
  _isPlaceholder: boolean;
}

export interface Citation {
  label: string;
  type: 'image' | 'document' | 'oral' | 'text';
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  let body: Partial<ChatRequest> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid JSON body.' }, { status: 400 });
  }

  const { siteId, message, language } = body;

  if (!siteId || !message) {
    return NextResponse.json(
      { success: false, message: 'siteId and message are required.' },
      { status: 422 },
    );
  }

  if (!apiKey) {
    // ── Placeholder response ────────────────────────────────────────────────
    const mockReply: ChatResponse = {
      reply:
        `🤖 **AI Assistant Placeholder** — GEMINI_API_KEY not configured yet.\n\n`
        + `Your question: *"${message}"*\n\n`
        + `Once the Gemini API key is set, I will:\n`
        + `• Answer based strictly on the heritage record for site **${siteId}**\n`
        + `• Cite photographs, documents, and oral histories as sources\n`
        + `• Respond in ${language ?? 'the language you write in'} (including Hindi, Tamil, Telugu, etc.)\n\n`
        + `Configure \`GEMINI_API_KEY\` in \`.env.local\` to enable me.`,
      citations: [
        { label: '[Placeholder] Site description', type: 'text' },
        { label: '[Placeholder] Community oral history', type: 'oral' },
      ],
      language: language ?? 'en',
      _isAiGenerated: false,
      _isPlaceholder: true,
    };

    return NextResponse.json({ success: true, data: mockReply }, { status: 200 });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🤖 TODO: Implement RAG chat here
  //
  // 1. Fetch the heritage site record from the DB (or FastAPI)
  // 2. Build a grounded system prompt:
  //    "You are an expert on the following heritage site ONLY. Answer using
  //     only the provided context. Cite your sources. Reply in the same
  //     language as the user's question."
  // 3. Call Gemini 1.5 Flash with the conversation history
  // 4. Parse citations from the response
  // 5. Stream the response back if possible
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  return NextResponse.json(
    { success: false, message: 'AI chat implementation pending.' },
    { status: 501 },
  );
}
