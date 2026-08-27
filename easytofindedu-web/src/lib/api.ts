import type { Blog, College, Hostel, Institute, NamedRef, Pagination } from './types';

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.easytofindedu.com/api/v1';

// Export the base URL for use in other components
export const API_BASE_URL = BASE;

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const body = await res.json();
  return body.data as T;
}

export interface Page<T> {
  items: T[];
  pagination?: Pagination;
}

// The upstream institutes endpoint has no text search, so the catalogue is
// fetched whole (18 records today) and searched/sorted in the browser.
export function fetchInstitutes(limit = 100, signal?: AbortSignal): Promise<Page<Institute>> {
  return get<{ data: Institute[]; pagination?: Pagination }>(`/institutes?limit=${limit}`, signal).then((d) => ({
    items: d.data ?? [],
    pagination: d.pagination,
  }));
}

export function fetchInstitute(id: string, signal?: AbortSignal): Promise<Institute> {
  return get<Institute>(`/institutes/${id}`, signal);
}

export function fetchCities(signal?: AbortSignal): Promise<NamedRef[]> {
  return get<NamedRef[]>('/institutes/cities', signal);
}

// The colleges route is spelled with a capital S upstream and returns a bare array.
export function fetchColleges(signal?: AbortSignal): Promise<College[]> {
  return get<College[]>('/collegeS', signal);
}

export function fetchCollege(id: string, signal?: AbortSignal): Promise<College> {
  return get<College>(`/collegeS/${id}`, signal);
}

export function fetchBlogs(limit = 3, signal?: AbortSignal): Promise<Blog[]> {
  return get<{ blogs: Blog[] }>(`/blogs?limit=${limit}`, signal).then((d) => d.blogs ?? []);
}

export function fetchHostelCount(signal?: AbortSignal): Promise<number> {
  return get<{ pagination?: { total_results?: number } }>('/public/hostels?limit=1', signal)
    .then((d) => d.pagination?.total_results ?? 0);
}

export interface HostelPage {
  items: Hostel[];
  total: number;
}

export function fetchHostels(limit = 100, signal?: AbortSignal): Promise<HostelPage> {
  return get<{ hostels: Hostel[]; pagination?: { total_results?: number } }>(
    `/public/hostels?limit=${limit}`,
    signal,
  ).then((d) => ({ items: d.hostels ?? [], total: d.pagination?.total_results ?? d.hostels?.length ?? 0 }));
}

export function fetchHostel(slug: string, signal?: AbortSignal): Promise<Hostel> {
  return get<Hostel | { hostel: Hostel }>(`/public/hostels/${slug}`, signal).then((d) =>
    'hostel' in (d as Record<string, unknown>) ? (d as { hostel: Hostel }).hostel : (d as Hostel),
  );
}
