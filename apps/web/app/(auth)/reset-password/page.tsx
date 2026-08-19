'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, Label, Button } from '@mood-trip/ui';
import { resetPassword } from '@/api/auth/api';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <_ResetPasswordForm />
    </Suspense>
  );
}

function _ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const rawToken = searchParams.get('token') ?? '';

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await resetPassword(rawToken, newPassword, confirmPassword);
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex flex-1 bg-accent h-full items-center justify-center">
        nanika
      </div>
      <div className="flex flex-col gap-8 flex-1 h-full items-center justify-center px-10">
        <div className="flex flex-col gap-8 max-w-[350px] w-full">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Forgot Password</h1>
            <p className="text-sm text-text-subtle">
              Enter your email to reset your password
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-10 w-full">
            <div className="flex flex-col gap-4 items-center w-full max-w-87.5">
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  type="password"
                  variant="inset"
                  showPasswordToggle
                  placeholder="Type your new password"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewPassword(e.target.value)
                  }
                />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  type="password"
                  variant="inset"
                  showPasswordToggle
                  placeholder="Type your confirm password"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setConfirmPassword(e.target.value)
                  }
                />
              </div>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="w-full max-w-87.5">
              <Button
                type="submit"
                variant="accent"
                rounded="full"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'RESET PASSWORD'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
