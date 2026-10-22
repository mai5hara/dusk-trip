'use client';

import Link from 'next/link';
import { useUserDetailQuery } from '../_hooks/useUserDetailQuery';
import { formatDateTime } from '@/lib/format-date';

type UserDetailProps = {
  userId: string;
};

export function UserDetail({ userId }: UserDetailProps): React.JSX.Element {
  const { data: user, isLoading, isError } = useUserDetailQuery(userId);

  if (isLoading) {
    return <p className="text-sm text-text-muted">Loading user…</p>;
  }

  if (isError || !user) {
    return (
      <p className="text-sm text-red-400" role="alert">
        User not found or failed to load.
      </p>
    );
  }

  return (
    <div className="flex max-w-full flex-col gap-6">
      <Link
        href="/users"
        className="inline-flex w-fit text-sm text-text-muted hover:text-text-primary"
      >
        ← Back to users
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          {user.name}
        </h1>
        <p className="mt-1 text-sm text-text-muted">{user.email}</p>
      </div>

      <dl className="grid gap-4 rounded-lg border border-border p-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-text-muted">
            Admin
          </dt>
          <dd className="mt-1 text-sm text-text-primary">
            {user.isAdmin ? 'Yes' : 'No'}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-text-muted">
            User ID
          </dt>
          <dd className="mt-1 break-all font-mono text-xs text-text-primary">
            {user.id}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-text-muted">
            Trips
          </dt>
          <dd className="mt-1 text-sm text-text-primary">{user.tripCount}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-text-muted">
            Itineraries
          </dt>
          <dd className="mt-1 text-sm text-text-primary">
            {user.itineraryCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-text-muted">
            Created
          </dt>
          <dd className="mt-1 text-sm text-text-primary">
            {formatDateTime(user.createdAt)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-text-muted">
            Updated
          </dt>
          <dd className="mt-1 text-sm text-text-primary">
            {formatDateTime(user.updatedAt)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
