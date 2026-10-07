import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  sendPetChat,
  type ChatMessage,
  type PetListing,
} from '../../services/aiPet.service';
import { AIPetCard } from './AIPetCard';

interface UiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  listings?: PetListing[];
  pending?: boolean;
  failed?: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  pathname?: string;
  contextListingIds?: { hostels?: string[]; institutes?: string[]; colleges?: string[] };
  onListingsShown?: (listings: { hostels: string[]; institutes: string[]; colleges: string[] }) => void;
}

const QUICK_PROMPTS: { id: string; label: string; prompt: string; emoji?: string }[] = [
  { id: 'hostel', label: 'Find a hostel', emoji: '🏠', prompt: 'Find an affordable hostel near Gandhi Maidan in Patna.' },
  { id: 'college', label: 'Find a college', emoji: '🎓', prompt: 'Find B.Tech colleges in Patna with CSE.' },
  { id: 'institute', label: 'Find an institute', emoji: '📚', prompt: 'Find coaching institutes near Boring Road in Patna.' },
  { id: 'compare', label: 'Compare', emoji: '⚖️', prompt: 'Compare these for me and tell me which is better.' },
  { id: 'course', label: 'Find a course', emoji: '🧭', prompt: 'Which colleges offer B.Tech CSE?' },
  { id: 'help', label: 'Help me choose', emoji: '🐾', prompt: 'Help me choose between the options you just showed.' },
];

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function renderAssistantText(text: string) {
  // Tiny markdown-ish renderer: **bold**, bullets, paragraphs.
  const lines = text.split(/\n/);
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={i} />;
    if (/^[-•*]\s+/.test(trimmed)) {
      const body = trimmed.replace(/^[-•*]\s+/, '');
      return (
        <div key={i} className="flex gap-2 pl-1">
          <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-gold-500" />
          <span>{renderInline(body)}</span>
        </div>
      );
    }
    return <p key={i} className="leading-relaxed">{renderInline(trimmed)}</p>;
  });
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const m = part.match(/^\*\*([^*]+)\*\*$/);
    if (m) return <strong key={i} className="font-semibold text-night-900">{m[1]}</strong>;
    return <span key={i}>{part}</span>;
  });
}

export function AIPetChat({ open, onClose, pathname, contextListingIds, onListingsShown }: Props) {
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
    if (open) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open, scrollToBottom, messages]);

  // Reset conversation when the pet window is closed.
  useEffect(() => {
    if (!open) {
      setMessages([]);
      setInput('');
      setError(null);
      setLoading(false);
    }
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setError(null);
      const userMsg: UiMessage = { id: uid(), role: 'user', content: trimmed };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput('');
      setLoading(true);
      scrollToBottom();

      const pendingId = uid();
      setMessages((prev) => [...prev, { id: pendingId, role: 'assistant', content: '', pending: true }]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const history: ChatMessage[] = nextMessages.map((m) => ({ role: m.role, content: m.content }));
        const res = await sendPetChat(
          {
            messages: history,
            context: { pathname, contextListingIds },
          },
          controller.signal,
        );

        const listings = Array.isArray(res.listings) ? res.listings : [];
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingId
              ? { ...m, content: res.message, listings, pending: false }
              : m,
          ),
        );

        if (onListingsShown && listings.length) {
          const buckets = { hostels: [] as string[], institutes: [] as string[], colleges: [] as string[] };
          for (const l of listings) {
            if (l.detailUrl.startsWith('/hostels')) buckets.hostels.push(l.listingId);
            else if (l.detailUrl.startsWith('/institutes')) buckets.institutes.push(l.listingId);
            else if (l.detailUrl.startsWith('/colleges')) buckets.colleges.push(l.listingId);
          }
          onListingsShown(buckets);
        }
        scrollToBottom();
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'AI Pet is temporarily unavailable.';
        setError(msg);
        setMessages((prev) => prev.filter((m) => m.id !== pendingId));
        setMessages((prev) =>
          prev.map((m) => (m.id === userMsg.id ? { ...m, failed: true } : m)),
        );
      } finally {
        setLoading(false);
        abortRef.current = null;
        inputRef.current?.focus();
      }
    },
    [loading, messages, pathname, contextListingIds, onListingsShown, scrollToBottom],
  );

  const retryLast = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user' && m.failed);
    if (!lastUser) return;
    setMessages((prev) => prev.filter((m) => m.id !== lastUser.id));
    void send(lastUser.content);
  }, [messages, send]);

  const newConversation = useCallback(() => {
    if (loading && abortRef.current) abortRef.current.abort();
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

  const showQuickPrompts = messages.length === 0;
  const canSend = input.trim().length > 0 && !loading;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="ai-pet-chat"
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          // Sits on top of the floating pet button (bottom-24) and avoids the
          // mobile bottom nav (which occupies the bottom 60px on phones).
          className="fixed bottom-24 right-4 z-[60] flex h-[min(640px,calc(100vh-160px))] w-[min(380px,calc(100vw-24px))] flex-col overflow-hidden border border-cream-300 bg-cream shadow-liftLg sm:right-6 sm:w-[400px]"
        >
          {/* Header */}
          <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-cream-300 bg-night-800 px-4 py-3 text-cream-100">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 text-night-900 shadow-goldGlow">
                <span className="text-lg" aria-hidden>🐾</span>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide2 text-gold-400">
                  EasyToFindEdu Pet
                </p>
                <p className="text-[12px] text-cream-100/80">Your guide to our database</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={newConversation}
                aria-label="New conversation"
                title="New conversation"
                className="flex h-8 w-8 items-center justify-center text-cream-100/70 transition-colors hover:text-gold-400"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={onClose}
                aria-label="Close"
                title="Close"
                className="flex h-8 w-8 items-center justify-center text-cream-100/70 transition-colors hover:text-gold-400"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="relative flex-1 overflow-y-auto bg-cream-100 px-4 py-4">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-gold-500/40 bg-cream-50">
                  <span className="text-3xl" aria-hidden>🐾</span>
                </div>
                <h3 className="font-display text-[18px] text-night-900">
                  Hi! Need help?
                </h3>
                <p className="mt-1 max-w-xs text-[12px] text-ink-500">
                  I can search hostels, institutes, colleges and courses in the EasyToFindEdu
                  database. Pick a quick prompt below to start.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <Bubble key={m.id} message={m} onRetry={m.failed ? retryLast : undefined} />
                ))}

                {loading && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-end gap-2"
                  >
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-gold-500/40 bg-cream-100">
                      <span className="text-sm" aria-hidden>🐾</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-cream-300 bg-cream-50 px-4 py-3">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-night-400/60 [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-night-400/60 [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-night-400/60" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="flex items-start justify-between gap-2 border-l-2 border-wine bg-cream-200 px-3 py-2">
                  <p className="text-[12px] text-ink-700">{error}</p>
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
            <div className="flex-shrink-0 border-t border-cream-300 bg-cream-50 px-4 py-3">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((qp) => (
                  <button
                    key={qp.id}
                    onClick={() => void send(qp.prompt)}
                    disabled={loading}
                    className="inline-flex items-center gap-1 border border-night-800/30 bg-cream-100 px-3 py-1.5 text-[11px] text-night-800 transition-all duration-300 hover:border-gold-500 hover:text-gold-700 disabled:opacity-50"
                  >
                    {qp.emoji && <span aria-hidden>{qp.emoji}</span>}
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="flex-shrink-0 border-t border-cream-300 bg-cream-50 px-3 py-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Ask about hostels, colleges, institutes…"
                rows={1}
                disabled={loading}
                className="flex-1 resize-none border border-cream-300 bg-cream-100 px-3 py-2 text-[13px] text-night-900 placeholder:text-ink-400 focus:border-gold-500 focus:outline-none disabled:opacity-60"
                style={{ maxHeight: 120 }}
              />
              <button
                onClick={() => void send(input)}
                disabled={!canSend}
                aria-label="Send"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center bg-night-800 text-cream-100 transition-all duration-300 hover:bg-gold-500 hover:text-night-900 disabled:cursor-not-allowed disabled:opacity-40"
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
            <p className="mt-1 text-center text-[10px] uppercase tracking-wide2 text-ink-400">
              Enter to send · Shift+Enter for newline
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Bubble({ message, onRetry }: { message: UiMessage; onRetry?: () => void }) {
  const isUser = message.role === 'user';
  const listings = message.listings || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
          isUser ? 'bg-night-800 text-cream-100' : 'border border-gold-500/40 bg-cream-100'
        }`}
      >
        {isUser ? (
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <span className="text-sm" aria-hidden>🐾</span>
        )}
      </div>

      <div className={`max-w-[85%] sm:max-w-[80%]`}>
        <div
          className={`px-3.5 py-2.5 text-[13px] leading-relaxed ${
            isUser
              ? 'rounded-2xl rounded-tr-sm bg-night-800 text-cream-100'
              : message.failed
                ? 'rounded-2xl rounded-tl-sm border border-wine/50 bg-cream-200 text-ink-700'
                : 'rounded-2xl rounded-tl-sm border border-cream-300 bg-cream-50 text-night-900'
          }`}
        >
          {message.pending ? (
            <div className="flex items-center gap-1.5 py-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-night-400/60 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-night-400/60 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-night-400/60" />
            </div>
          ) : (
            <div className="space-y-1.5">{renderAssistantText(message.content)}</div>
          )}

          {message.failed && onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 block text-[10px] uppercase tracking-wide2 text-wine transition-colors hover:text-night-900"
            >
              ↻ Retry
            </button>
          )}
        </div>

        {/* Listing cards */}
        {!message.pending && listings.length > 0 && (
          <div className="mt-2 space-y-1">
            {listings.slice(0, 4).map((l) => {
              const kind = l.detailUrl.startsWith('/hostels')
                ? 'hostel'
                : l.detailUrl.startsWith('/institutes')
                  ? 'institute'
                  : l.detailUrl.startsWith('/colleges')
                    ? 'college'
                    : 'course';
              return <AIPetCard key={l.listingId} listing={l} kind={kind} />;
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default AIPetChat;