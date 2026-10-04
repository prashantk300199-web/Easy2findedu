/**
 * Shared file-upload helper for the institute registration form.
 *
 * Why this exists:
 * Every step that accepts a file (logo, cover, faculty photos, result
 * docs, gallery, step-14 documents) used to re-implement the same
 * fetch + error-handling boilerplate, and most of them forgot the
 * two important things that the step-14 fix introduced:
 *   1. parse the response body so the real backend error reaches the UI
 *   2. throw when Cloudinary returned no URL (instead of saving '')
 *
 * Centralising it here means the rest of the form can stay short and
 * we only have one place to keep the upload contract in sync.
 */

export async function uploadDraftFile({
  file,
  stepNumber,
  fieldName,
  signal,
}: {
  file: File;
  stepNumber: number;
  fieldName: string;
  signal?: AbortSignal;
}): Promise<string> {
  const token = localStorage.getItem('etf_token');
  const form = new FormData();
  form.append('file', file);
  form.append('stepNumber', String(stepNumber));
  form.append('fieldName', fieldName);

  const response = await fetch(
    'https://easytofindedu.onrender.com/api/v1/institute/draft/upload',
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
      credentials: 'include',
      signal,
    },
  );

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
