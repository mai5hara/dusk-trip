import {
  LoginBody,
  LoginResponse,
  MeResponse,
  RefreshResponse,
  SignupBody,
  SignupResponse,
} from '@mood-trip/validators';
import { apiClient } from '@/lib/api/client';
import { getRefreshToken, setAccessToken } from '@/lib/auth/token';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function login(body: LoginBody): Promise<LoginResponse> {
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }

  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error('Invalid email or password');
  }

  return res.json() as Promise<LoginResponse>;
}

export async function requestPasswordReset(email: string): Promise<void> {
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }

  const res = await fetch(`${baseUrl}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error('Invalid email');
  }
}

export async function resetPassword(
  token: string,
  password: string,
  confirmPassword: string,
): Promise<{ message: string }> {
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }

  const res = await fetch(`${baseUrl}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password, confirmPassword }),
  });

  if (!res.ok) {
    throw new Error('Invalid password or confirm password');
  }

  return res.json() as Promise<{ message: string }>;
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as RefreshResponse;
  setAccessToken(data.accessToken);
  return data.accessToken;
}

export async function getMe(): Promise<MeResponse> {
  return apiClient<MeResponse>('/auth/me');
}

export async function signup(body: SignupBody): Promise<SignupResponse> {
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }

  const res = await fetch(`${baseUrl}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error('Invalid email or password');
  }

  return res.json() as Promise<SignupResponse>;
}
