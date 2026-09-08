'use client';

import { loginBodySchema } from '@mood-trip/validators';
import { Button } from '@mood-trip/ui';
import { useAuth } from '@/lib/auth/auth-context';

export default function AdminHome() {
  const fields = Object.keys(loginBodySchema.shape);
  const { logout } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Mood Trip Admin</h1>
      <p className="text-sm text-gray-600">
        Validators wired: {fields.join(', ')}
      </p>
      <Button variant="accent" onClick={logout}>
        Logout
      </Button>
    </div>
  );
}
