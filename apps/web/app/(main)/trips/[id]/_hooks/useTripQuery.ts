'use client';

import { useQuery } from '@tanstack/react-query';
import { getTrip } from '@/api/trips/api';
import { queryKeys } from '@/lib/query/query-keys';
import { useAuth } from '@/lib/auth/auth-context';

export function useTripQuery(tripId: string | undefined) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useQuery({
    queryKey: tripId
      ? queryKeys.trips.detail(tripId)
      : ['trips', 'detail', 'empty'],
    queryFn: () => getTrip(tripId!),
    enabled: Boolean(tripId) && isAuthenticated && !isAuthLoading,
  });
}
