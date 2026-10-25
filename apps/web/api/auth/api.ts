import {
  LoginBody,
  LoginResponse,
  MeResponse,
  RefreshResponse,
  SignupBody,
  SignupResponse,
} from '@mood-trip/validators';
import { apiClient } from '@/api/_common/client';
import { publicApi } from '@/api/_common/public-client';
import { getRefreshToken, setAccessToken } from '@/lib/auth/token';

export async function login(body: LoginBody): Promise<LoginResponse> {
  return publicApi<LoginResponse>(
    '/auth/login',
    { method: 'POST', body: JSON.stringify(body) },
    'Invalid email or password',
  );
}

export async function requestPasswordReset(email: string): Promise<void> {
  await publicApi<void>(
    '/auth/forgot-password',
    { method: 'POST', body: JSON.stringify({ email }) },
    'Invalid email',
  );
}

export async function resetPassword(
  token: string,
  password: string,
  confirmPassword: string,
): Promise<{ message: string }> {
  return publicApi<{ message: string }>(
    '/auth/reset-password',
    {
      method: 'POST',
      body: JSON.stringify({ token, password, confirmPassword }),
    },
    'Invalid password or confirm password',
  );
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const data = await publicApi<RefreshResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    setAccessToken(data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

export async function getMe(): Promise<MeResponse> {
  return apiClient<MeResponse>('/auth/me');
}

export async function signup(body: SignupBody): Promise<SignupResponse> {
  return publicApi<SignupResponse>(
    '/auth/signup',
    { method: 'POST', body: JSON.stringify(body) },
    {
      default: 'Could not create your account. Please try again.',
      status: {
        400: 'Please check your name, email, and password.',
        409: 'An account with this email already exists.',
      },
    },
  );
}

export async function googleLogin(idToken: string): Promise<LoginResponse> {
  return publicApi<LoginResponse>(
    '/auth/google',
    { method: 'POST', body: JSON.stringify({ idToken }) },
    {
      default: 'Failed to sign in with Google',
      status: {
        409: 'An account with this email already exists. Log in with your password instead.',
      },
    },
  );
}
