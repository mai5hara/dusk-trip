const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export function getBaseUrl(): string {
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }
  return baseUrl;
}

export function buildHeaders(init?: RequestInit): Headers {
  const headers = new Headers(init?.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return headers;
}

export async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}
