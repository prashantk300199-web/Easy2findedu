// AI Pet service — frontend client for POST /api/v1/ai-pet/chat.
//
// Mirrors the careerCounselor.service.ts pattern:
//   - conversation history is owned by the frontend (no DB persistence)
//   - if a student JWT is in localStorage, send it as Bearer token so the
//     backend can attach profile preferences
//   - AbortController for cancellable in-flight requests

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

export type PetListingKind = 'hostel' | 'institute' | 'college' | 'course';

/** Common shape for any listing card the pet can render. */
export interface PetListing {
  listingId: string;
  detailUrl: string;
  // Optional fields the card UI inspects based on kind.
  name: string;
  city?: string;
  area?: string;
  state?: string;
  fullAddress?: string;
  about?: string;
  description?: string;
  monthlyRent?: number;
  feeStructure?: {
    tuitionMin?: number;
    tuitionMax?: number;
    hostelFee?: number;
    totalCostPerYear?: number;
  } | null;
  hasFood?: boolean;
  hasAC?: boolean;
  hasWiFi?: boolean;
  foodDetails?: Array<{ frequency: string; type: string; serviceType: string; monthlyCost?: number }>;
  roomTypes?: string[];
  hostelType?: string;
  security?: { cctv?: boolean; guard?: boolean; biometric?: boolean; warden?: boolean };
  rating?: number | null;
  photos?: string[];
  logo?: string;
  coverImage?: string;
  establishedYear?: number;
  courses?: string[];
  courseName?: string;
  fullForm?: string;
  degreeType?: string;
  stream?: string;
  specialization?: string;
  duration?: { value: number; unit: string };
  semesters?: number;
  eligibility?: string;
  entranceExamsAccepted?: string[];
  collegeType?: string;
  ownershipType?: string;
  approvedBy?: string[];
  ranking?: any;
  placements?: any;
}

export interface PetResponse {
  success: boolean;
  message: string;
  listings: PetListing[];
  action?: string;
  rephrase?: string;
}

export interface PetRequest {
  messages: ChatMessage[];
  context?: {
    pathname?: string;
    contextListingIds?: { hostels?: string[]; institutes?: string[]; colleges?: string[] };
  };
}

export async function sendPetChat(
  payload: PetRequest,
  signal?: AbortSignal,
): Promise<PetResponse> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/ai-pet/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    signal,
  });

  let body: PetResponse | null = null;
  try {
    body = (await res.json()) as PetResponse;
  } catch {
    /* non-JSON response */
  }

  if (!res.ok || !body || body.success !== true) {
    const fallback = 'AI Pet is temporarily unavailable.';
    throw new Error(body?.message || fallback);
  }
  return body;
}