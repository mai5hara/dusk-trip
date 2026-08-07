const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export function getBaseUrl(): string {
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }
  return baseUrl;
}

export function buildHeaders(init?: RequestInit): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  };
}

export async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}
