import { getAccessToken } from '@/lib/auth/token';
import { refreshAccessToken } from '@/api/auth/api';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function apiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }

  const fetchWithAuth = () =>
    fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
        ...(init?.headers as Record<string, string> | undefined),
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

  return res.json() as Promise<T>;
}
