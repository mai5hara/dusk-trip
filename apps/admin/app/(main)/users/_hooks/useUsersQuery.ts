'use client';

import {
  keepPreviousData,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query';
import { getUsers } from '@/api/users/api';
import { queryKeys } from '@/lib/query/query-keys';
import type { AdminUsers } from '@mood-trip/validators';

export function useUsersQuery(
  page: number,
  limit: number,
  search: string,
): UseQueryResult<AdminUsers> {
  const normalizedSearch =
    search.trim().length >= 2 ? search.trim() : undefined;

  return useQuery({
    queryKey: queryKeys.users.all(page, limit, search),
    queryFn: () => getUsers({ page, limit, search: normalizedSearch }),
    enabled: page >= 1 && limit >= 1,
    placeholderData: keepPreviousData,
  });
}
