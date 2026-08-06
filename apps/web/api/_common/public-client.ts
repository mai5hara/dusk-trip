import { buildHeaders, getBaseUrl, parseJson } from './http';

/** Unauthenticated requests (login, signup, password reset, refresh). */
export async function publicApi<T>(
  path: string,
  init?: RequestInit,
  errorMessage = 'Request failed',
): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: buildHeaders(init),
  });

  if (!res.ok) {
    throw new Error(errorMessage);
  }

  return parseJson<T>(res);
}
