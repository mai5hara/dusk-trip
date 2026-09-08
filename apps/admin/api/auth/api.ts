import {
  LoginBody,
  LoginResponse,
  MeResponse,
  RefreshResponse,
} from '@mood-trip/validators';
import { getRefreshToken, setAccessToken } from '@/lib/auth/token';
import { publicApi } from '../_common/public-client';
import { apiClient } from '../_common/client';

export async function login(body: LoginBody): Promise<LoginResponse> {
  return publicApi<LoginResponse>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    'Invalid email or password',
  );
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const data = await publicApi<RefreshResponse>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      },
      'Invalid refresh token',
    );
    setAccessToken(data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

export async function getMe(): Promise<MeResponse> {
  return apiClient<MeResponse>('/auth/me');
}
