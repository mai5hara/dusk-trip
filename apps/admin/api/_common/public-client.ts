import { buildHeaders, getBaseUrl, parseJson } from './http';

export type PublicApiErrorConfig =
  | string
  | {
      default: string;
      status?: Partial<Record<number, string>>;
    };

function _resolveErrorMessage(
  res: Response,
  errorConfig: PublicApiErrorConfig,
): string {
  if (typeof errorConfig === 'string') {
    return errorConfig;
  }

  return errorConfig.status?.[res.status] ?? errorConfig.default;
}

/** Unauthenticated requests (login, signup, password reset, refresh). */
export async function publicApi<T>(
  path: string,
  init?: RequestInit,
  errorConfig: PublicApiErrorConfig = 'Request failed',
): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: buildHeaders(init),
  });

  if (!res.ok) {
    throw new Error(_resolveErrorMessage(res, errorConfig));
  }

  return parseJson<T>(res);
}
