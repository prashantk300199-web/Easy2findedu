import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendCounselorChat, type ChatMessage } from '../../services/careerCounselor.service';

const QUICK_PROMPTS: { id: string; label: string; prompt: string }[] = [
  { id: 'explore', label: 'Explore Careers', prompt: 'Help me explore careers I should consider based on my interests.' },
  { id: 'exams', label: 'Entrance Exams', prompt: 'What entrance exams should I be aware of for my target career?' },
  { id: 'courses', label: 'Courses & Degrees', prompt: 'Which courses or degrees fit the career I want?' },
  { id: 'plan', label: '3-Month Plan', prompt: 'Create a practical 3-month learning plan for me.' },
  { id: 'compare', label: 'Compare Careers', prompt: 'Help me compare two careers so I can decide.' },
  { id: 'confused', label: "I'm Confused", prompt: "I'm confused about my career direction. Can you help me figure it out?" },
];

interface UiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  pending?: boolean;
  failed?: boolean;
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function renderAssistantContent(content: string) {
  // Render simple markdown-ish: **bold**, line breaks, bullet lines.
  const lines = content.split(/\n/);
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={i} />;

    // bullet line
    if (/^[-•*]\s+/.test(trimmed)) {
      const text = trimmed.replace(/^[-•*]\s+/, '');
      return (
        <div key={i} className="flex gap-2 pl-2">
          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gold-500" />
          <span>{renderInline(text)}</span>
        </div>
      );
    }

    return <p key={i} className="leading-relaxed">{renderInline(trimmed)}</p>;
  });
}

function renderInline(text: string) {
  // Split on **bold** segments while keeping the order.
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    if (m) {
      return <strong key={i} className="font-semibold text-night-900">{m[1]}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function CareerChatPage() {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 30);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    const userMsg: UiMessage = { id: uid(), role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    scrollToBottom();

    // Build the history to send (strip pending flags and ids).
    const history: ChatMessage[] = [...messages, userMsg]
      .filter((m) => !m.pending)
      .map((m) => ({ role: m.role, content: m.content }));

    const pendingId = uid();
    setMessages((prev) => [
      ...prev,
      { id: pendingId, role: 'assistant', content: '', pending: true },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const reply = await sendCounselorChat(history, controller.signal);
      setMessages((prev) =>
        prev.map((m) => (m.id === pendingId ? { ...m, content: reply, pending: false } : m)),
      );
      scrollToBottom();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI Counselor is temporarily unavailable.';
      setError(msg);
      setMessages((prev) => prev.filter((m) => m.id !== pendingId));
      // mark the user message so the user can retry it
      setMessages((prev) =>
        prev.map((m) => (m.id === userMsg.id ? { ...m, failed: true } : m)),
      );
    } finally {
      setLoading(false);
      abortRef.current = null;
      inputRef.current?.focus();
    }
  }, [loading, messages, scrollToBottom]);

  const retryLast = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user' && m.failed);
    if (!lastUser) return;
    // drop the failed marker and re-send
    setMessages((prev) => prev.filter((m) => m.id !== lastUser.id));
    void send(lastUser.content);
  }, [messages, send]);

  const newConversation = useCallback(() => {
    if (loading && abortRef.current) {
      abortRef.current.abort();
    }
    setMessages([]);
    setError(null);
    setInput('');
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [loading]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  const canSend = input.trim().length > 0 && !loading;
  const showQuickPrompts = messages.length === 0;

  return (
    <div className="bg-cream min-h-[calc(100vh-76px)]">
      <div className="mx-auto flex h-[calc(100vh-76px)] max-w-page flex-col px-4 py-6 md:px-12 md:py-10">
        {/* Header */}
        <div className="mb-4 flex flex-shrink-0 items-end justify-between gap-4">
          <div>
            <p className="overline">AI Career Counselor</p>
            <h1 className="font-display text-d3 text-night-900 md:text-d2">
              Your <em className="italic text-gold-600">guidance</em>, on demand.
            </h1>
            <p className="mt-1 max-w-xl text-sm text-ink-500">
              Ask anything about careers, courses, colleges, or exams. The conversation is private
              and stays in this browser tab.
            </p>
          </div>
          <button
            onClick={newConversation}
            className="hidden flex-shrink-0 items-center gap-2 border border-night-800 px-5 py-3 text-[11px] uppercase tracking-wide2 text-night-800 transition-colors duration-500 hover:bg-night-800 hover:text-cream-100 sm:inline-flex"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            New Conversation
          </button>
        </div>

        {/* Chat card */}
        <div className="flex min-h-0 flex-1 flex-col border border-cream-300 bg-cream-100/60">
          {/* Messages */}
          <div className="relative flex-1 overflow-y-auto px-4 py-6 md:px-8">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center border border-gold-500/40">
                  <svg className="h-7 w-7 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="font-display text-d4 text-ink-800">How can I help you today?</h2>
                <p className="mt-3 max-w-md text-sm text-ink-500">
                  Pick a quick prompt below, or just type your question. You can ask follow-ups and
                  I'll keep the context.
                </p>
              </div>
            )}

            <div className="mx-auto flex max-w-3xl flex-col gap-5">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} onRetry={m.failed ? retryLast : undefined} />
                ))}

                {loading && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-end gap-3"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center border border-gold-500/40 bg-cream-100">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-500" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-cream-300 bg-cream-50 px-4 py-3">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-night-400/60 [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-night-400/60 [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-night-400/60" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="flex items-start justify-between gap-3 border-l-2 border-wine bg-cream-200 px-5 py-4">
                  <p className="text-sm text-ink-700">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    aria-label="Dismiss error"
                    className="text-ink-400 transition-colors hover:text-night-900"
                  >
                    ×
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick prompts */}
          {showQuickPrompts && (
            <div className="flex-shrink-0 border-t border-cream-300 bg-cream-100/40 px-4 py-4 md:px-8">
              <div className="mx-auto flex max-w-3xl flex-wrap gap-2">
                {QUICK_PROMPTS.map((qp) => (
                  <button
                    key={qp.id}
                    onClick={() => void send(qp.prompt)}
                    disabled={loading}
                    className="border border-night-800/30 bg-cream-50 px-4 py-2 text-xs text-night-800 transition-all duration-300 hover:border-gold-500 hover:text-gold-700 disabled:opacity-50"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex-shrink-0 border-t border-cream-300 bg-cream-100/40 px-4 py-4 md:px-8">
            <div className="mx-auto flex max-w-3xl items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about careers, exams, courses…"
                rows={1}
                disabled={loading}
                className="flex-1 resize-none border border-cream-300 bg-cream-50 px-4 py-3 text-sm text-night-900 placeholder:text-ink-400 focus:border-gold-500 focus:outline-none disabled:opacity-60"
                style={{ maxHeight: 160 }}
              />
              <button
                onClick={() => void send(input)}
                disabled={!canSend}
                aria-label="Send"
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center bg-night-800 text-cream-100 transition-all duration-300 hover:bg-gold-500 hover:text-night-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mx-auto mt-2 flex max-w-3xl items-center justify-between">
              <p className="text-[10px] uppercase tracking-wide2 text-ink-400">
                Enter to send · Shift+Enter for newline
              </p>
              <button
                onClick={newConversation}
                className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wide2 text-ink-400 transition-colors hover:text-night-900 sm:hidden"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                New
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, onRetry }: { message: UiMessage; onRetry?: () => void }) {
  const isUser = message.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center ${
          isUser ? 'bg-night-800 text-cream-100' : 'border border-gold-500/40 bg-cream-100 text-gold-600'
        }`}
      >
        {isUser ? (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )}
      </div>

      <div
        className={`max-w-[85%] px-5 py-3.5 text-sm leading-relaxed sm:max-w-[75%] ${
          isUser
            ? 'bg-night-800 text-cream-100'
            : message.failed
              ? 'border border-wine/50 bg-cream-200 text-ink-700'
              : 'border border-cream-300 bg-cream-50 text-night-900'
        } ${isUser ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tl-sm'}`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : message.pending ? (
          <div className="flex items-center gap-1.5 py-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-night-400/60 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-night-400/60 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-night-400/60" />
          </div>
        ) : (
          <div className="space-y-1.5">{renderAssistantContent(message.content)}</div>
        )}

        {message.failed && onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-[10px] uppercase tracking-wide2 text-wine transition-colors hover:text-night-900"
          >
            ↻ Retry
          </button>
        )}
      </div>
    </motion.div>
  );
}
