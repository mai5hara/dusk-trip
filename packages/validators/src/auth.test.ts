import { describe, it, expect } from 'vitest';
import {
  loginBodySchema,
  signupBodySchema,
  resetPasswordBodySchema,
  refreshBodySchema,
  forgotPasswordBodySchema,
} from './auth';

describe('loginBodySchema', () => {
  it('accepts valid input', () => {
    const result = loginBodySchema.safeParse({
      email: 'test@test.com',
      password: 'password',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginBodySchema.safeParse({
      email: 'invalid-email',
      password: 'password',
    });

    expect(result.success).toBe(false);
  });

  it('rejects too short password', () => {
    const result = loginBodySchema.safeParse({
      email: 'test@test.com',
      password: 'short',
    });

    expect(result.success).toBe(false);
  });
});

describe('signupBodySchema', () => {
  it('accepts valid input', () => {
    const result = signupBodySchema.safeParse({
      name: 'Test User',
      email: 'test@test.com',
      password: 'password',
      confirmPassword: 'password',
    });

    expect(result.success).toBe(true);
  });

  it('rejects missing name', () => {
    const result = signupBodySchema.safeParse({
      name: '',
      email: 'test@test.com',
      password: 'password',
      confirmPassword: 'password',
    });

    expect(result.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const result = signupBodySchema.safeParse({
      name: 'Test User',
      email: 'test@test.com',
      password: 'password',
      confirmPassword: 'mismatched',
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.confirmPassword).toContain(
      'Passwords do not match',
    );
  });

  it('rejects too short password', () => {
    const result = signupBodySchema.safeParse({
      name: 'Test User',
      email: 'test@test.com',
      password: 'short',
      confirmPassword: 'short',
    });

    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = signupBodySchema.safeParse({
      name: 'Test User',
      email: 'invalid-email',
      password: 'password',
      confirmPassword: 'password',
    });

    expect(result.success).toBe(false);
  });
});

describe('resetPasswordBodySchema', () => {
  it('accepts valid input', () => {
    const result = resetPasswordBodySchema.safeParse({
      token: 'valid-token',
      password: 'password',
      confirmPassword: 'password',
    });

    expect(result.success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = resetPasswordBodySchema.safeParse({
      token: 'valid-token',
      password: 'password',
      confirmPassword: 'mismatched',
    });

    expect(result.success).toBe(false);
  });

  it('rejects too short password', () => {
    const result = resetPasswordBodySchema.safeParse({
      token: 'valid-token',
      password: 'short',
      confirmPassword: 'short',
    });

    expect(result.success).toBe(false);
  });

  it('rejects missing token', () => {
    const result = resetPasswordBodySchema.safeParse({
      token: '',
      password: 'password',
      confirmPassword: 'password',
    });

    expect(result.success).toBe(false);
  });
});

describe('refreshBodySchema', () => {
  it('accepts valid token', () => {
    const result = refreshBodySchema.safeParse({
      refreshToken: 'valid-refresh-token',
    });

    expect(result.success).toBe(true);
  });

  it('rejects missing token', () => {
    const result = refreshBodySchema.safeParse({
      refreshToken: '',
    });

    expect(result.success).toBe(false);
  });
});

describe('forgotPasswordBodySchema', () => {
  it('accepts valid email', () => {
    const result = forgotPasswordBodySchema.safeParse({
      email: 'test@test.com',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = forgotPasswordBodySchema.safeParse({
      email: 'invalid-email',
    });

    expect(result.success).toBe(false);
  });
});
