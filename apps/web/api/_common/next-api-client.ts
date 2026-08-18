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
  const fetchWithAuth = () =>
    fetch(path, {
      ...init,
      headers: {
        ...(init?.headers as Record<string, string> | undefined),
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
      },
    });

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
