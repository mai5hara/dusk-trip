import { z } from 'zod';

export const loginBodySchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

/** Login form check: only catches empty or malformed input; the API decides the rest. */
export const loginFormSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

export type LoginForm = z.infer<typeof loginFormSchema>;

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  isAdmin: z.boolean(),
});

export type AuthUser = z.infer<typeof authUserSchema>;

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: authUserSchema,
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const forgotPasswordBodySchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

export type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>;

export const resetPasswordBodySchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;

export const forgotPasswordResponseSchema = z.object({
  message: z.string(),
});

export type ResetPasswordResponse = z.infer<
  typeof forgotPasswordResponseSchema
>;

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshBody = z.infer<typeof refreshBodySchema>;

export const refreshResponseSchema = z.object({
  accessToken: z.string(),
});

export type RefreshResponse = z.infer<typeof refreshResponseSchema>;

export const meResponseSchema = authUserSchema;

export type MeResponse = z.infer<typeof meResponseSchema>;

export const signupBodySchema = z
  .object({
    name: z.string().min(1, 'Enter your name'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Use at least 8 characters for your password'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupBody = z.infer<typeof signupBodySchema>;

export const signupResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: authUserSchema,
});

export type SignupResponse = z.infer<typeof signupResponseSchema>;

export const googleLoginBodySchema = z.object({
  idToken: z.string().min(1),
});

export type GoogleLoginBody = z.infer<typeof googleLoginBodySchema>;

export const googleLoginResponseSchema = loginResponseSchema;

export type GoogleLoginResponse = LoginResponse;
