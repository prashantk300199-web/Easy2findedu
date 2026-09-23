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

// ─── Career Nodes ────────────────────────────────────────────────────────────

export interface CareerNode {
  _id: string;
  title: string;
  slug: string;
  nodeType: string;
  description?: string;
  overview?: string;
  thumbnail?: { url?: string };
  coverImage?: { url?: string };
  duration?: { value?: number; unit?: string };
  difficultyLevel?: string;
  level?: number;
  popularityScore?: number;
  tags?: string[];
  keywords?: string[];
  eligibility?: {
    qualifications?: string[];
    streams?: string[];
    minPercentage?: number;
    otherRequirements?: string;
  };
  topInstitutions?: { name?: string; location?: string; ranking?: number; cutoff?: string }[];
  prerequisiteNodeIds?: { _id: string; title: string; slug: string; nodeType: string; difficultyLevel?: string; level?: number; duration?: { value?: number; unit?: string } }[];
  nextNodeIds?: { _id: string; title: string; slug: string; nodeType: string; difficultyLevel?: string; level?: number; duration?: { value?: number; unit?: string } }[];
  viewCount?: number;
  saveCount?: number;
}

export interface CareerNodePage {
  nodes: CareerNode[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getNodes(params?: {
  query?: string;
  qualification?: string;
  stream?: string;
  nodeType?: string;
  difficulty?: string;
  minCost?: number;
  maxCost?: number;
  sortBy?: string;
  page?: number;
  limit?: number;
}): Promise<CareerNodePage> {
  const qs = new URLSearchParams();
  if (params?.query) qs.set('query', params.query);
  if (params?.qualification) qs.set('qualification', params.qualification);
  if (params?.stream) qs.set('stream', params.stream);
  if (params?.nodeType) qs.set('nodeType', params.nodeType);
  if (params?.difficulty) qs.set('difficulty', params.difficulty);
  if (params?.minCost) qs.set('minCost', String(params.minCost));
  if (params?.maxCost) qs.set('maxCost', String(params.maxCost));
  if (params?.sortBy) qs.set('sortBy', params.sortBy);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit ?? 20));
  return request<CareerNodePage>(`/career-guidance/nodes?${qs}`);
}

export async function getNodeDetail(nodeId: string): Promise<CareerNode> {
  return request<CareerNode>(`/career-guidance/nodes/${nodeId}`);
}

// ─── Career Areas ────────────────────────────────────────────────────────────

export interface CareerArea {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  tags: string[];
}

export async function getCareerAreas(): Promise<{ areas: CareerArea[]; total: number }> {
  return request<{ areas: CareerArea[]; total: number }>('/career-guidance/career-areas');
}

// ─── Questionnaire ────────────────────────────────────────────────────────────

export async function submitAnswers(answers: Record<string, unknown>): Promise<unknown> {
  return request('/career-guidance/submit-answers', {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

// ─── Recommendations ─────────────────────────────────────────────────────────

export interface Recommendation extends CareerNode {
  matchScore: number;
  scoringDetails?: {
    qualificationMatch?: string;
    streamMatch?: string;
    financialFit?: string;
    regionMatch?: string;
    timeframeMatch?: string;
  };
}

export async function getRecommendations(limit = 10): Promise<Recommendation[]> {
  return request<Recommendation[]>(`/career-guidance/recommendations?limit=${limit}`);
}

// ─── Save / My Paths ─────────────────────────────────────────────────────────

export interface SavedPath {
  _id: string;
  nodeId: { _id: string };
  status: string;
  savedAt: string;
  notes?: string;
  node?: CareerNode;
}

export async function savePath(nodeId: string, status?: string, notes?: string): Promise<unknown> {
  return request('/career-guidance/save-path', {
    method: 'POST',
    body: JSON.stringify({ nodeId, status: status || 'interested', notes }),
  });
}

export async function getSavedPaths(page = 1, limit = 20): Promise<{ paths: SavedPath[]; pagination: { total: number; totalPages: number } }> {
  return request(`/career-guidance/my-paths?page=${page}&limit=${limit}`);
}

// ─── Roadmap ─────────────────────────────────────────────────────────────────

export interface RoadmapPhase {
  phase: string;
  nodes: (CareerNode & { pathStatus?: string | null })[];
}

export interface Roadmap {
  targetNodeId: string;
  targetTitle: string;
  phases: RoadmapPhase[];
  totalNodes: number;
}

export async function getRoadmap(nodeId: string): Promise<Roadmap> {
  return request<Roadmap>(`/career-guidance/roadmap/${nodeId}`);
}

// ─── Comparison ───────────────────────────────────────────────────────────────

export async function compareNodes(nodeIds: string[]): Promise<CareerNode[]> {
  return request<CareerNode[]>(`/career-guidance/comparison/${nodeIds.join(',')}`);
}

// ─── I Don't Know ────────────────────────────────────────────────────────────

export interface IDontKnowAnswer {
  mbtiType?: string;
  stressResponse?: string;
  decisionStyle?: string;
  socialPreference?: string;
  creativityLevel?: string;
  favoriteSubjects?: string[];
  favoriteActivities?: string[];
}

export interface CareerSuggestion {
  areaId: string;
  label: string;
  score: number;
  reason: string;
  experiments: { title: string; detail: string }[];
}

export async function iDontKnow(answers: IDontKnowAnswer): Promise<{ suggestions: CareerSuggestion[]; totalAnswered: number }> {
  return request('/career-guidance/i-dont-know', {
    method: 'POST',
    body: JSON.stringify(answers),
  });
}

// ─── My Profile ──────────────────────────────────────────────────────────────

export async function getMyProfile(): Promise<unknown> {
  return request('/career-guidance/my-profile');
}
