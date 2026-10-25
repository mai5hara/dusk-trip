'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/query-keys';
import { deleteTrip } from '@/api/trips/api';

export function useDeleteTripMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTrip,
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.trips.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.all });
    },
  });
}
