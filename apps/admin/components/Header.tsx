'use client';

import { Button } from '@mood-trip/ui';
import { useAuth } from '@/lib/auth/auth-context';

export function Header(): React.JSX.Element {
  const { user, logout } = useAuth();
  const displayName = user?.name || user?.email || 'Admin';

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
      <p className="text-sm text-muted-foreground">Mood Trip Admin</p>
      <div className="flex items-center gap-3">
        <span className="text-sm">{displayName}</span>
        <Button type="button" variant="accent" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
