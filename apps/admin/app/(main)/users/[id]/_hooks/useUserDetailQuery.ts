'use client';

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getUserDetails } from '@/api/users/api';
import { queryKeys } from '@/lib/query/query-keys';
import type { AdminUserDetails } from '@mood-trip/validators';

export function useUserDetailQuery(
  userId: string,
): UseQueryResult<AdminUserDetails> {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => getUserDetails(userId),
    enabled: userId.length > 0,
  });
}
