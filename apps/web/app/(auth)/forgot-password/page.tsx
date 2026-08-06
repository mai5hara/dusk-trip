'use client';

import { useState } from 'react';
import { Input, Label, Button } from '@mood-trip/ui';
import { requestPasswordReset } from '@/api/auth/api';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await requestPasswordReset(email);
      setSent(true);
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
                onSubmit={handleSubmit}
                className="flex flex-col gap-10 w-full"
              >
                <div className="flex flex-col gap-4 items-center w-full max-w-[350px]">
                  <div className="flex flex-col gap-2 w-full">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      type="email"
                      variant="inset"
                      showPasswordToggle
                      placeholder="Type your email"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEmail(e.target.value)
                      }
                    />
                  </div>
                </div>
                {error && <p className="text-red-500">{error}</p>}
                <div className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    variant="accent"
                    rounded="full"
                    disabled={isLoading}
                    className="w-full max-w-[350px]"
                  >
                    {isLoading ? 'Loading...' : 'SEND RESET LINK'}
                  </Button>
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
