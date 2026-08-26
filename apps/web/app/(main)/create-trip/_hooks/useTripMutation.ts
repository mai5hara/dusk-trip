'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateTripBody } from '@mood-trip/validators';
import { queryKeys } from '@/lib/query/query-keys';
import { createTrip, updateTrip } from '@/api/trips/api';

export function useCreateTripMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.all });
    },
  });
}

type UpdateTripVariables = {
  id: string;
  body: CreateTripBody;
};

export function useUpdateTripMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: UpdateTripVariables) => updateTrip(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.trips.detail(variables.id),
      });
    },
  });
}
