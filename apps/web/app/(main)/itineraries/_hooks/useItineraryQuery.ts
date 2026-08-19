'use client';

import { useQuery } from '@tanstack/react-query';
import { getItinerary } from '@/api/itineraries/api';
import { queryKeys } from '@/lib/query/query-keys';
import { useAuth } from '@/lib/auth/auth-context';

export function useItineraryQuery(id: string) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  return useQuery({
    queryKey: queryKeys.itineraries.detail(id),
    queryFn: () => getItinerary(id),
    enabled: Boolean(id) && isAuthenticated && !isAuthLoading,
  });
}
