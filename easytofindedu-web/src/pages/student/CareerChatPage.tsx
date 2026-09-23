import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  listConversations,
  createConversation,
  getConversation,
  sendMessage,
  archiveConversation,
  getQuickPrompts,
  type Conversation,
  type AIMessage,
  type QuickPrompt,
} from '../../services/careerAI.service';
import { Spinner } from '../primitives';

interface ChatBubbleProps {
  message: AIMessage;
  onRetry?: () => void;
  isRetrying?: boolean;
}

function ChatBubble({ message, onRetry, isRetrying }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  // Parse action links from AI response
  const renderContent = (content: string) => {
    // Look for **Actions:** followed by bracketed links
    const temp = content.replace(/\*\*(.*?)\*\*/g, '§BOLD§$1§BOLD§');
    const boldParts = temp.split('§BOLD§').filter(Boolean);

    return boldParts.map((part, i) => {
      if (part.startsWith('[')) {
        const linkMatch = part.match(/\[([^\]]+)\]\s*\(([^)]+)\)/);
        if (linkMatch) {
          return (
            <Link
              key={i}
              to={linkMatch[2]}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gold-500/10 border border-gold-500/30 text-gold-700 text-sm hover:bg-gold-500/20 transition-colors mx-0.5"
            >
              {linkMatch[1]} →
            </Link>
          );
        }
      }
      return <span key={i} className={part === part.toUpperCase() && part.length < 50 ? 'font-semibold' : ''}>{part}</span>;
    });
  };

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex justify-end"
      >
        <div className="max-w-[80%] px-5 py-3.5 rounded-2xl rounded-tr-sm bg-night-800 text-cream-100 text-sm leading-relaxed">
          {message.content}
          {message.timestamp && (
            <p className="text-cream-100/30 text-xs mt-1 text-right">
              {new Date(message.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </motion.div>
    );
  }

  const showRetry = Boolean(onRetry);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex justify-start"
    >
      <div className="flex gap-3 max-w-[85%]">
        {/* AI avatar */}
        <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center flex-shrink-0 mt-1">
          <svg className="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-night-100 border border-night-200/50 rounded-2xl rounded-tl-sm px-5 py-4 text-night-800 text-sm leading-relaxed">
            <div className="space-y-1">
              {renderContent(message.content)}
            </div>
          </div>
          {message.timestamp && (
            <p className="text-night-600/30 text-xs mt-1 ml-1">
              {new Date(message.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          {showRetry && (
            <button
              onClick={onRetry}
              disabled={isRetrying}
              className="flex items-center gap-1.5 mt-1 text-xs text-night-600/40 hover:text-night-700/60 transition-colors"
            >
              {isRetrying ? <Spinner size="xs" /> : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Retry
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface ChatPageProps {
  conversationId?: string;
  onClose?: () => void;
}

export default function CareerChatPage({ conversationId: initialId, onClose }: ChatPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(initialId || null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState('');
  const [quickPrompts, setQuickPrompts] = useState<QuickPrompt[]>([]);
  const [retrying, setRetrying] = useState(false);
  // Track the last failed user message content for retry
  const [failedContent, setFailedContent] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load conversations + quick prompts
  useEffect(() => {
    const load = async () => {
      try {
        const [convs, prompts] = await Promise.all([listConversations(), getQuickPrompts()]);
        setConversations(convs);
        setQuickPrompts(prompts);
      } catch { /* ignore */ }
    };
    load();
  }, []);

  // Load or create conversation
  useEffect(() => {
    if (!activeId) return;
    const load = async () => {
      setLoading(true);
      try {
        const conv = await getConversation(activeId);
        setMessages(conv.messages || []);
        scrollToBottom();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeId]);

  // Auto-scroll
  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const startNewConversation = async (mode?: string) => {
    setInitializing(true);
    setError('');
    try {
      const conv = await createConversation(mode);
      setConversations((prev) => [{ _id: conv._id, title: conv.title, lastMessageAt: conv.createdAt, messageCount: conv.messageCount, createdAt: conv.createdAt, updatedAt: conv.createdAt }, ...prev]);
      setActiveId(conv._id);
      setMessages(conv.messages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
    } finally {
      setInitializing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !activeId || loading) return;
    const content = input.trim();
    setInput('');
    setFailedContent(null);
    // Optimistic add
    setMessages((prev) => [...prev, { role: 'user', content, timestamp: new Date().toISOString() }]);
    setLoading(true);
    scrollToBottom();
    try {
      const res = await sendMessage(activeId, content);
      setMessages((prev) => [...prev.filter((m) => !(m.role === 'user' && m.content === content && !m.timestamp)), res.message]);
      scrollToBottom();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setFailedContent(content);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => !(m.role === 'user' && m.content === content)));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (!activeId) {
      await startNewConversation();
      // Give a tick for activeId to update
      setTimeout(async () => {
        const convs = await listConversations();
        setConversations(convs);
        const conv = convs[0];
        if (conv) {
          setActiveId(conv._id);
          setMessages(conv.messages || []);
        }
      }, 100);
      return;
    }
    setInput(prompt);
    inputRef.current?.focus();
  };

  const handleRetry = async () => {
    if (!activeId || failedContent === null) return;
    setRetrying(true);
    setError('');
    const content = failedContent;
    // Optimistic add — remove any stale retry marker first
    setMessages((prev) => prev.filter((m) => !(m.role === 'model')));
    setMessages((prev) => [...prev, { role: 'user', content, timestamp: new Date().toISOString() }]);
    scrollToBottom();
    try {
      const res = await sendMessage(activeId, content);
      setMessages((prev) => [...prev.filter((m) => !(m.role === 'user' && m.content === content && !m.timestamp)), res.message]);
      setFailedContent(null);
      scrollToBottom();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setMessages((prev) => prev.filter((m) => !(m.role === 'user' && m.content === content)));
    } finally {
      setRetrying(false);
    }
  };

  const handleArchive = async (id: string) => {
    await archiveConversation(id);
    setConversations((prev) => prev.filter((c) => c._id !== id));
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-76px)] bg-cream">
      {/* Sidebar */}
      <div className="w-72 border-r border-cream-200 flex flex-col bg-cream-100/50">
        {/* Sidebar header */}
        <div className="p-4 border-b border-cream-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base text-night-800">AI Counselor</h2>
            <button
              onClick={() => startNewConversation()}
              disabled={initializing}
              className="w-8 h-8 rounded-lg bg-night-800 text-cream-100 flex items-center justify-center hover:bg-night-900 transition-colors"
              title="New conversation"
            >
              {initializing ? <Spinner size="xs" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
            </button>
          </div>
          <button
            onClick={() => startNewConversation('exploration')}
            className="w-full px-4 py-2.5 rounded-xl bg-gold-500 text-night-900 text-sm font-medium hover:bg-gold-600 transition-colors"
          >
            I'm Confused — Help Me Explore
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-night-600/40 text-sm">
              No conversations yet. Start one!
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => setActiveId(conv._id)}
                className={`w-full text-left px-4 py-3 border-b border-cream-200/50 hover:bg-night-100/30 transition-colors ${activeId === conv._id ? 'bg-night-100/40 border-l-2 border-l-gold-500' : ''}`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-medium text-night-800 truncate flex-1">{conv.title}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleArchive(conv._id); }}
                    className="text-night-600/30 hover:text-red-400/60 transition-colors p-1"
                    title="Delete"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-9V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-night-600/40">
                  {conv.messageCount} message{conv.messageCount !== 1 ? 's' : ''} ·{' '}
                  {new Date(conv.lastMessageAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {!activeId ? (
          /* Welcome state */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gold-500/10 flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="font-display text-d4 text-night-800 mb-3">Your AI Career Counselor</h2>
            <p className="text-night-700/60 text-sm max-w-sm mb-8 leading-relaxed">
              Ask anything about careers, education paths, entrance exams, or let me help you figure out what to do.
            </p>
            <button
              onClick={() => startNewConversation()}
              disabled={initializing}
              className="px-8 py-3 rounded-xl bg-night-800 text-cream-100 text-sm font-medium hover:bg-night-900 transition-colors"
            >
              {initializing ? <Spinner size="sm" /> : 'Start a Conversation →'}
            </button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {loading && messages.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <Spinner size="lg" />
                </div>
              )}

              <AnimatePresence>
                {messages.map((msg, i) => (
                  <ChatBubble
                    key={`${msg.timestamp || i}-${msg.role}`}
                    message={msg}
                    onRetry={msg.role === 'model' && failedContent !== null ? handleRetry : undefined}
                    isRetrying={retrying}
                  />
                ))}
              </AnimatePresence>

              {loading && messages.length > 0 && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gold-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="bg-night-100 border border-night-200/50 rounded-2xl rounded-tl-sm px-5 py-4">
                      <div className="flex gap-1">
                        {[0,1,2].map((j) => (
                          <motion.div
                            key={j}
                            className="w-2 h-2 rounded-full bg-night-400/40"
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: j * 0.2 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200/50 rounded-xl px-4 py-3 text-red-600/70 text-sm">
                  {error}
                  <button onClick={() => setError('')} className="ml-2 text-red-400/60 hover:text-red-500">×</button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 2 && quickPrompts.length > 0 && (
              <div className="px-6 pb-3">
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((qp) => (
                    <button
                      key={qp.id}
                      onClick={() => handleQuickPrompt(qp.prompt)}
                      className="px-4 py-2 rounded-full border border-night-200 text-night-700/70 text-xs hover:border-night-400 hover:text-night-800 transition-all bg-cream-100/80"
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-cream-200 bg-cream">
              <div className="flex items-end gap-3 max-w-3xl mx-auto">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about careers, exams, courses..."
                  rows={1}
                  className="flex-1 px-4 py-3 rounded-xl bg-night-100 border border-night-200 text-night-800 text-sm resize-none focus:outline-none focus:border-gold-500 placeholder:text-night-600/30"
                  style={{ maxHeight: '120px' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl bg-night-800 text-cream-100 flex items-center justify-center hover:bg-night-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
