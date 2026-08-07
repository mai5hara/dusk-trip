import { getAccessToken } from '@/lib/auth/token';
import { refreshAccessToken } from '@/api/auth/api';
import { buildHeaders, getBaseUrl, parseJson } from './http';

/** Authenticated requests with Bearer token and one 401 refresh retry. */
export async function apiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const fetchWithAuth = () =>
    fetch(`${getBaseUrl()}${path}`, {
      ...init,
      headers: {
        ...buildHeaders(init),
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
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return parseJson<T>(res);
}
