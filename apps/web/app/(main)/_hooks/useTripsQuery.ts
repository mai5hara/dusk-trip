'use client';

import { useQuery } from '@tanstack/react-query';
import { getTrips } from '@/api/trips/api';
import { queryKeys } from '@/lib/query/query-keys';
import { useAuth } from '@/lib/auth/auth-context';

export function useTripsQuery() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useQuery({
    queryKey: queryKeys.trips.all,
    queryFn: getTrips,
    enabled: isAuthenticated && !isAuthLoading,
  });
}
