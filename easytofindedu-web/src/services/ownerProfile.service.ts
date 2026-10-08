/**
 * Owner Profile Service
 *
 * Aggregates role-specific data for the Owner Profile page at /profile.
 * Each method only runs for the matching owner role — backend
 * authentication middleware already enforces role isolation, so a Hostel
 * Owner can never reach an Institute/College endpoint with their token.
 */
import { API_BASE_URL } from '../lib/api';
import * as instituteDraftService from './instituteDraft.service';
import * as collegeDraftService from './collegeDraft.service';

const TOKEN_KEY = 'etf_token';

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function authedGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  const json = await res.json();
  return (json.data ?? json) as T;
}

/* ─── Hostel Owner ─────────────────────────────────────────────── */

export interface HostelListItem {
  _id: string;
  name: string;
  masked_name?: string;
  slug?: string;
  status?: string;
  is_open?: boolean;
  total_hostel_beds?: number;
  hostel_type?: string;
  city?: string;
}

export interface HostelListResponse {
  hostels: HostelListItem[];
  pagination?: { total_results?: number };
}

export async function fetchMyHostels(): Promise<HostelListItem[]> {
  const data = await authedGet<HostelListItem[] | HostelListResponse>('/hostels');
  if (Array.isArray(data)) return data;
  return data.hostels ?? [];
}

export async function fetchHostelDraft(): Promise<unknown | null> {
  try {
    const res = await authedGet<{ draft: unknown | null }>('/hostels/draft');
    return res.draft ?? null;
  } catch (e) {
    // 404 means no draft — normal state
    return null;
  }
}

/* ─── Institute Owner ──────────────────────────────────────────── */

export interface InstituteDraftStatus {
  exists: boolean;
  currentStep?: number;
  totalSteps?: number;
  completionPercentage?: number;
  status?: string;
  [key: string]: unknown;
}

export async function fetchInstituteDraftStatus(): Promise<InstituteDraftStatus | null> {
  try {
    const response: any = await instituteDraftService.getDraftStatus();
    if (response && response.success && response.data) return response.data;
    return null;
  } catch {
    return null;
  }
}

export interface InstituteDashboardStats {
  totalInstitutes?: number;
  totalCourses?: number;
  totalBatches?: number;
  totalApplications?: number;
  pendingApplications?: number;
  approvedApplications?: number;
  [key: string]: unknown;
}

export async function fetchInstituteDashboardStats(): Promise<InstituteDashboardStats | null> {
  try {
    return await authedGet<InstituteDashboardStats>('/owner/institutes/dashboard');
  } catch {
    return null;
  }
}

/* ─── College Owner ────────────────────────────────────────────── */

export async function fetchCollegeDraftStatus(): Promise<InstituteDraftStatus | null> {
  try {
    const response: any = await collegeDraftService.getDraftStatus();
    if (response && response.success && response.data) return response.data;
    return null;
  } catch {
    return null;
  }
}
