'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import {
  Input,
  Button,
  Label,
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from '@mood-trip/ui';

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
      <div className="flex flex-col gap-8 flex-1 h-full items-center justify-center px-10">
        <div className="flex flex-col gap-8 max-w-[450px] w-full">
          <form onSubmit={handleSubmit} className="flex flex-col gap-10 w-full">
            <Card variant="flat">
              <CardHeader>
                <CardTitle>Login</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full flex items-center flex-col gap-6">
                  <div className="w-full flex flex-col gap-4">
                    <div className="flex flex-col gap-2 w-full">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        type="email"
                        variant="border"
                        placeholder="Type your email"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setEmail(e.target.value)
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password">Password</Label>
                        {/* TODO: Add forgot password link */}
                        {/* <Link
                          className="text-xs text-text-subtle"
                          href="/forgot-password"
                        >
                          Forgot password?
                        </Link> */}
                      </div>
                      <Input
                        type="password"
                        variant="border"
                        showPasswordToggle
                        placeholder="Type your password"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPassword(e.target.value)
                        }
                      />
                      {error && <p className="text-red-500">{error}</p>}
                    </div>
                  </div>
                  <div className="w-full max-w-[200px]">
                    <Button
                      type="submit"
                      variant="accent"
                      rounded="full"
                      width="full"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Loading...' : 'SIGN IN'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
