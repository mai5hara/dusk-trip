import { LoginBody, LoginResponse } from '@mood-trip/validators';

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
