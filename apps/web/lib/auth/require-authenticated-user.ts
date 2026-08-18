import { getBaseUrl } from '@/api/_common/http';

/**
 * Validates the request Bearer token against Nest `/auth/me`
 * (same JWT gate as trip/entry APIs).
 */
export async function requireAuthenticatedUser(
  request: Request,
): Promise<{ ok: true } | { ok: false; status: 401; message: string }> {
  const authorization = request.headers.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return { ok: false, status: 401, message: 'Unauthorized' };
  }

  const res = await fetch(`${getBaseUrl()}/auth/me`, {
    headers: { Authorization: authorization },
    cache: 'no-store',
  });

  if (!res.ok) {
    return { ok: false, status: 401, message: 'Unauthorized' };
  }

  return { ok: true };
}
