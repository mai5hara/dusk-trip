import { getAccessToken } from '@/lib/auth/token';
import { refreshAccessToken } from '@/api/auth/api';
import { parseJson } from './http';

/**
 * Authenticated requests to Next.js Route Handlers (e.g. `/api/uploads`).
 * Does not set Content-Type so FormData / multipart uploads work.
 * Bearer token + one 401 refresh retry (same pattern as `apiClient`).
 */
export async function nextApiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const fetchWithAuth = () => {
    const headers = new Headers(init?.headers);
    const token = getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(path, {
      ...init,
      headers,
    });
  };

  let res = await fetchWithAuth();

  if (res.status === 401) {
    const newToken = await refreshAccessToken();

    if (!newToken) {
      throw new Error('Unauthorized');
    }

    res = await fetchWithAuth();
  }

  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(payload?.message ?? `HTTP error! status: ${res.status}`);
  }

  return parseJson<T>(res);
}
