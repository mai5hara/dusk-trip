import { Suspense } from 'react';
import { UsersList } from './_components/UsersList';

export default function UsersPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={<p className="text-sm text-text-muted">Loading users…</p>}
    >
      <UsersList />
    </Suspense>
  );
}
