// Simple, framework-agnostic client for the AI Counselor endpoint.
// Sends the full conversation (frontend-owned) with each request.
// If a student JWT is in localStorage, it is sent so the backend can
// personalise the AI's answer using the student's profile.

const API_BASE =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined) ??
  'https://easytofindedu.onrender.com/api/v1';

function getToken(): string | null {
  try {
    return localStorage.getItem('etf_token');
  } catch {
    return null;
  }
}

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatResponse {
  success: boolean;
  message: string;
}

export async function sendCounselorChat(
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/career/counselor/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ messages }),
    signal,
  });

  let body: ChatResponse | null = null;
  try {
    body = (await res.json()) as ChatResponse;
  } catch {
    // non-JSON response
  }

  if (!res.ok || !body || body.success !== true || !body.message) {
    const fallback = 'AI Counselor is temporarily unavailable.';
    throw new Error(body?.message || fallback);
  }
  return body.message;
}
