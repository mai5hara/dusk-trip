'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useUsersQuery } from '../_hooks/useUsersQuery';
import { formatDateTime } from '@/lib/format-date';
import { ListSearchForm } from '@/components/ListSearchForm';
import { ListPagination } from '@/components/ListPagination';

function _parseListParams(searchParams: URLSearchParams): {
  page: number;
  limit: number;
  search: string;
} {
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get('limit')) || 10),
  );
  const search = searchParams.get('search') ?? '';
  return { page, limit, search };
}

export function UsersList(): React.JSX.Element {
  const searchParams = useSearchParams();
  const { page, limit, search } = _parseListParams(searchParams);

  const {
    data: usersList,
    isLoading,
    isError,
  } = useUsersQuery(page, limit, search);

  if (isLoading) {
    return <p className="text-sm text-text-muted">Loading users…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-red-400" role="alert">
        Failed to load users. Check your session and try again.
      </p>
    );
  }

  if (!usersList) {
    return <p className="text-sm text-text-muted">No users found.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Users</h1>
        <p className="mt-1 text-sm text-text-muted">
          {usersList.total} user{usersList.total === 1 ? '' : 's'} total
        </p>
      </div>

      <ListSearchForm
        basePath="/users"
        inputId="users-search"
        label="Search by name or email"
      />

      {usersList.users.length === 0 ? (
        <p className="text-sm text-text-muted">No users match your filters.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-accent/10">
              <tr>
                <th className="px-4 py-3 font-medium text-text-primary">
                  Name
                </th>
                <th className="px-4 py-3 font-medium text-text-primary">
                  Email
                </th>
                <th className="px-4 py-3 font-medium text-text-primary">
                  Admin
                </th>
                <th className="px-4 py-3 font-medium text-text-primary">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {usersList.users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border last:border-b-0 hover:bg-accent/5"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/users/${user.id}`}
                      className="font-medium text-text-primary underline-offset-2 hover:underline"
                    >
                      {user.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{user.email}</td>
                  <td className="px-4 py-3 text-text-muted">
                    {user.isAdmin ? 'Yes' : 'No'}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {formatDateTime(user.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ListPagination
        basePath="/users"
        page={usersList.page}
        totalPages={usersList.totalPages}
      />
    </div>
  );
}
