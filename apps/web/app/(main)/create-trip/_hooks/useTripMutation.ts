'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateTripBody } from '@mood-trip/validators';
import { queryKeys } from '@/lib/query/query-keys';
import { createTrip, deleteTrip, updateTrip } from '@/api/trips/api';

function _invalidateTripQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  tripId?: string,
): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.trips.all });
  if (tripId) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.trips.detail(tripId),
    });
  }
}

export function useCreateTripMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      _invalidateTripQueries(queryClient);
    },
  });
}

export function useUpdateTripMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CreateTripBody }) =>
      updateTrip(id, body),
    onSuccess: (_data, variables) => {
      _invalidateTripQueries(queryClient, variables.id);
    },
  });
}

export function useDeleteTripMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTrip,
    onSuccess: (_data, tripId) => {
      queryClient.removeQueries({ queryKey: queryKeys.trips.detail(tripId) });
      _invalidateTripQueries(queryClient);
    },
  });
}
