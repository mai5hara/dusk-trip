'use client';

import { Button } from '@mood-trip/ui';
import { useAuth } from '@/lib/auth/auth-context';

export default function AdminHome() {
  const { logout } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Mood Trip Admin</h1>
      <Button variant="accent" onClick={logout}>
        Logout
      </Button>
    </div>
  );
}
