'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { Input, Button, Label } from '@mood-trip/ui';

export default function SignUpPage() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signup(name, email, password, confirmPassword);
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
            <h1 className="text-2xl font-bold">Sign Up</h1>
            <p className="text-sm text-text-subtle">
              Create an account to start your journey
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-10 w-full">
            <div className="flex flex-col gap-4 items-center w-full max-w-[350px]">
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  variant="inset"
                  placeholder="Type your name"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                />
              </div>
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
                <Label htmlFor="password">Password</Label>
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
              <div className="flex flex-col gap-2 w-full">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  type="password"
                  variant="inset"
                  showPasswordToggle
                  placeholder="Confirm password"
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setConfirmPassword(e.target.value)
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
                {isLoading ? 'Loading...' : 'SIGN UP TO JOURNEY'}
              </Button>
              <p className="text-sm">
                Already have an account?
                <Link href="/login" className="text-accent pl-2 font-bold">
                  Login to your account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
