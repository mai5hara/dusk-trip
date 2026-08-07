'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Input, Button, Label } from '@mood-trip/ui';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
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
            <h1 className="text-2xl font-bold">Login</h1>
            <p className="text-sm text-text-subtle">
              Sign in to your journey and continue to the story
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-10 w-full">
            <div className="flex flex-col gap-4 items-center w-full max-w-87.5">
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  type="email"
                  variant="inset"
                  placeholder="Type your email"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    className="text-xs text-text-subtle"
                    href="/forgot-password"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  variant="inset"
                  showPasswordToggle
                  placeholder="Type your password"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPassword(e.target.value)
                  }
                />
              </div>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex flex-col gap-4">
              <div className="w-full max-w-87.5">
                <Button
                  type="submit"
                  variant="accent"
                  rounded="full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Loading...' : 'SIGN IN TO JOURNEY'}
                </Button>
              </div>
              <p className="text-sm">
                New to Mood Trip?
                <Link href="/register" className="text-accent pl-2 font-bold">
                  Create an account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
