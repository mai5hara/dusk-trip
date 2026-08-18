'use client';

import { useQuery } from '@tanstack/react-query';
import { getItineraries } from '@/api/itineraries/api';
import { queryKeys } from '@/lib/query/query-keys';
import { useAuth } from '@/lib/auth/auth-context';

export function useItinerariesQuery() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useQuery({
    queryKey: queryKeys.itineraries.all,
    queryFn: getItineraries,
    enabled: isAuthenticated && !isAuthLoading,
  });
}
