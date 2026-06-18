import { LoginBody, LoginResponse } from '@mood-trip/validators';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export async function login(body: LoginBody): Promise<LoginResponse> {
  if(!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not set');
  }

  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if(!res.ok) {
    throw new Error('Invalid email or password');
  }

  return res.json() as Promise<LoginResponse>;
}