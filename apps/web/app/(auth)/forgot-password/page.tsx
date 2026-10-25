'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Label, Button } from '@mood-trip/ui';
import {
  forgotPasswordBodySchema,
  type ForgotPasswordBody,
} from '@mood-trip/validators';
import { requestPasswordReset } from '@/api/auth/api';
import Link from 'next/link';
import { AuthSidePanel } from '@/app/(auth)/_components/AuthSidePanel';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordBody>({
    resolver: zodResolver(forgotPasswordBodySchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError('root', {
        message: err instanceof Error ? err.message : 'An error occurred',
      });
    }
  });

  return (
    <div className="flex min-h-screen">
      <AuthSidePanel />
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-10 sm:px-10">
        <div className="flex flex-col gap-8 max-w-87.5 w-full">
          {sent ? (
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold">Check your email</h1>
              <p className="text-sm text-text-subtle">
                A reset link has been sent to your email address.
              </p>
              <Link href="/login" className="text-accent pl-2 font-bold">
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">Forgot Password</h1>
                <p className="text-sm text-text-subtle">
                  Enter your email to reset your password
                </p>
              </div>
              <form
                onSubmit={onSubmit}
                noValidate
                className="flex flex-col gap-10 w-full"
              >
                <div className="flex flex-col gap-4 items-center w-full max-w-87.5">
                  <div className="flex flex-col gap-2 w-full">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      variant="inset"
                      placeholder="Type your email"
                      {...register('email')}
                      errorMessage={errors.email?.message}
                    />
                  </div>
                </div>
                {errors.root?.message && (
                  <p className="text-red-500">{errors.root.message}</p>
                )}
                <div className="flex flex-col gap-4">
                  <div className="w-full max-w-87.5">
                    <Button
                      type="submit"
                      variant="accent"
                      rounded="full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Loading...' : 'SEND RESET LINK'}
                    </Button>
                  </div>
                  <Link
                    href="/login"
                    className="text-accent pl-2 font-bold text-sm"
                  >
                    Back to login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
