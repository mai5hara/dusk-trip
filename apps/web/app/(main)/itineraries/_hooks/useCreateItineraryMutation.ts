'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createItinerary } from '@/api/itineraries/api';
import { queryKeys } from '@/lib/query/query-keys';

export function useCreateItineraryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createItinerary,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.itineraries.all });
    },
  });
}
