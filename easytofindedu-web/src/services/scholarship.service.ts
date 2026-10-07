const API = import.meta.env.VITE_API_BASE_URL ?? 'https://easytofindedu.onrender.com/api/v1';

function getToken(): string | null {
  return localStorage.getItem('etf_token');
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
  const token = getToken();
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

// ─── Types ────────────────────────────────────────────────────────────

export type ScholarshipComputedStatus =
  | 'active'
  | 'upcoming'
  | 'closing_soon'
  | 'closed'
  | 'expired'
  | 'unknown';

export type ScholarshipAdminStatus =
  | 'active'
  | 'inactive'
  | 'closed'
  | 'expired'
  | 'draft';

export interface ScholarshipAmount {
  min: number;
  max: number;
  currency: string;
  frequency: string;
  note?: string;
}

export interface ScholarshipDeadline {
  applicationStartDate: string | null;
  applicationEndDate: string | null;
  typicalWindow: string;
  isRecurring: boolean;
  isExactDateConfirmed: boolean;
}

export interface ScholarshipSource {
  sourceName: string;
  sourceUrl: string;
  officialApplicationUrl: string;
  sourceType: 'government' | 'university' | 'foundation' | 'organization' | 'other';
  lastVerifiedAt: string;
  contactPhone?: string;
  contactEmail?: string;
  contactWebsite?: string;
}

export interface ScholarshipEligibility {
  educationLevels: string[];
  streams: string[];
  courses: string[];
  categories: string[];
  gender: 'any' | 'female_only' | 'male_only';
  states: string[];
  nationality: string;
  minPercentage: number | null;
  maxFamilyIncome: number | null;
  minAge: number | null;
  maxAge: number | null;
  disability: boolean;
  otherRequirements: string;
}

export interface Scholarship {
  _id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  scholarshipType: string;
  category: string;
  tags: string[];
  amount: ScholarshipAmount;
  amountLabel: string;
  eligibility: ScholarshipEligibility;
  deadline: ScholarshipDeadline;
  deadlineLabel: string;
  requiredDocuments: string[];
  applicationProcess: string;
  source: ScholarshipSource;
  status: ScholarshipAdminStatus;
  computedStatus: ScholarshipComputedStatus;
  isFeatured: boolean;
  displayOrder: number;
  priority: number;
  keywords: string[];
  viewCount?: number;
  clickCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScholarshipFacets {
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byEducationLevel: Record<string, number>;
  byGender: Record<string, number>;
  byComputedStatus: Record<string, number>;
}

export interface ScholarshipPage {
  items: Scholarship[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RecommendedPage {
  items: Scholarship[];
  profileComplete: boolean;
}

// ─── Public APIs ──────────────────────────────────────────────────────

export interface ScholarshipSearchParams {
  query?: string;
  category?: string;
  scholarshipType?: string;
  educationLevel?: string;
  stream?: string;
  eligibleCategory?: string;
  state?: string;
  gender?: string;
  status?: string;
  deadlineFrom?: string;
  deadlineTo?: string;
  sortBy?: string;
  page?: number;
  limit?: number;
}

export async function searchScholarships(params?: ScholarshipSearchParams): Promise<ScholarshipPage> {
  const qs = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    });
  }
  return request<ScholarshipPage>(`/career-guidance/scholarships?${qs.toString()}`);
}

export async function getFeaturedScholarships(limit = 6): Promise<{ items: Scholarship[] }> {
  return request<{ items: Scholarship[] }>(`/career-guidance/scholarships/featured?limit=${limit}`);
}

export async function getClosingSoonScholarships(limit = 12): Promise<{ items: Scholarship[] }> {
  return request<{ items: Scholarship[] }>(`/career-guidance/scholarships/closing-soon?limit=${limit}`);
}

export async function getScholarshipFacets(): Promise<ScholarshipFacets> {
  return request<ScholarshipFacets>('/career-guidance/scholarships/facets');
}

export async function getRecommendedScholarships(limit = 8): Promise<RecommendedPage> {
  return request<RecommendedPage>(`/career-guidance/scholarships/recommended?limit=${limit}`);
}

export async function getScholarship(idOrSlug: string): Promise<Scholarship> {
  return request<Scholarship>(`/career-guidance/scholarships/${idOrSlug}`);
}

export async function trackScholarshipClick(id: string): Promise<void> {
  await request(`/career-guidance/scholarships/${id}/click`, { method: 'POST' });
}
