import { getAccessToken } from '@/lib/auth/token';
import { refreshAccessToken } from '@/features/auth/api';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function apiClient<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }

  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...headers,
      ...(init?.headers as Record<string, string> | undefined),
    },
  });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();

    if(!newToken) {
      throw new Error('Unauthorized');
    }
  }

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
