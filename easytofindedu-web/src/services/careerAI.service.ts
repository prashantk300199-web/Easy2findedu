const API = import.meta.env.VITE_API_BASE_URL ?? 'https://api.easytofindedu.com/api/v1';

function getToken(): string | null {
  return localStorage.getItem('etf_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options?.headers as Record<string, string> || {}) },
    credentials: 'include',
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `Request failed (${res.status})`);
  }
  const body = await res.json();
  return body.data as T;
}

// ─── Types ──────────────────────────────────────────────────────────────

export interface AIMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface Conversation {
  _id: string;
  title: string;
  lastMessageAt: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuickPrompt {
  id: string;
  label: string;
  prompt: string;
}

// ─── Conversations ─────────────────────────────────────────────────────

export async function listConversations(): Promise<Conversation[]> {
  return request<Conversation[]>('/career-ai/conversations');
}

export async function createConversation(mode?: string): Promise<{
  _id: string;
  title: string;
  messages: AIMessage[];
  messageCount: number;
  createdAt: string;
}> {
  return request('/career-ai/conversations', {
    method: 'POST',
    body: JSON.stringify({ mode }),
  });
}

export async function getConversation(conversationId: string): Promise<{
  _id: string;
  title: string;
  messages: AIMessage[];
  context: Record<string, unknown>;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}> {
  return request(`/career-ai/conversations/${conversationId}`);
}

export async function sendMessage(
  conversationId: string,
  content: string,
  action?: { type: string }
): Promise<{ message: AIMessage; messageCount: number }> {
  return request(`/career-ai/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content, action }),
  });
}

export async function archiveConversation(conversationId: string): Promise<void> {
  await request(`/career-ai/conversations/${conversationId}`, {
    method: 'DELETE',
  });
}

// ─── Quick Prompts ─────────────────────────────────────────────────────

export async function getQuickPrompts(): Promise<QuickPrompt[]> {
  return request<QuickPrompt[]>('/career-ai/quick-prompts');
}
