/**
 * Shared file-upload helper for both the institute and college registration flows.
 *
 * Why this exists:
 * Every step that accepts a file (logo, cover, faculty photos, gallery,
 * documents, brochure) used to re-implement the same fetch + error-handling
 * boilerplate, and most of them forgot the two important things:
 *   1. parse the response body so the real backend error reaches the UI
 *   2. throw when Cloudinary returned no URL (instead of saving '')
 *
 * Centralising it here means the rest of the form can stay short and we
 * only have one place to keep the upload contract in sync.
 *
 * The endpoint is passed in by callers so the same helper works for
 * institute, college, and any future flow.
 */

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://easytofindedu.onrender.com/api/v1';

export async function uploadDraftFile({
  file: input,
  stepNumber,
  fieldName,
  endpoint = '/institute/draft/upload',
  append = false,
  arrayField,
  signal,
}: {
  file: File;
  stepNumber: number;
  fieldName: string;
  /** Path under the API base. Defaults to the legacy institute endpoint. */
  endpoint?: string;
  /** When true, the controller pushes onto an array instead of overwriting. */
  append?: boolean;
  /** When append is true, the array key (defaults to fieldName). */
  arrayField?: string;
  signal?: AbortSignal;
}): Promise<string> {
  const token = localStorage.getItem('etf_token');
  const form = new FormData();
  form.append('file', input);
  form.append('stepNumber', String(stepNumber));
  form.append('fieldName', fieldName);
  if (append) {
    form.append('append', 'true');
    if (arrayField) form.append('arrayField', arrayField);
  }

  const response = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
    credentials: 'include',
    signal,
  });

  let body: any = null;
  try { body = await response.json(); } catch { /* non-JSON */ }

  if (!response.ok) {
    const msg = body?.message || `Upload failed (HTTP ${response.status})`;
    throw new Error(msg);
  }

  const url: string | undefined = body?.data?.url || body?.url;
  if (!url) {
    throw new Error(body?.message || 'Upload succeeded but no URL returned');
  }
  return url;
}

/**
 * True when the given string is a browser-local blob: URL (only
 * resolves in the browser session that created it — useless for the
 * admin viewing from a different session).
 */
export function isBlobUrl(value?: string | null): boolean {
  return typeof value === 'string' && value.startsWith('blob:');
}