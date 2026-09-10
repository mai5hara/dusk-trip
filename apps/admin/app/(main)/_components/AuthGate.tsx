'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

type AuthGateProps = {
  children: React.ReactNode;
};

/** Redirects unauthenticated users to /login for all (main) routes. */
export function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (isAuthLoading) return;
    if (user === null) {
      router.replace('/login');
    }
  }, [isAuthLoading, router, user]);

  if (isAuthLoading || user === null) {
    return null;
  }

  return children;
}
