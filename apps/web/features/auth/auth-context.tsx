'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser } from '@mood-trip/validators';
import { login as loginApi } from './api';
import { clearTokens, setAccessToken, setRefreshToken } from '@/lib/auth/token';

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await loginApi({ email, password });
      setAccessToken(res.accessToken);
      setRefreshToken(res.refreshToken);
      setUser(res.user);
      router.push('/');
    },
    [router],
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    router.push('/login');
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      logout,
    }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
}
