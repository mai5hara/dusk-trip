'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CreateEntriesBatchBody,
  UpdateEntriesBatchBody,
} from '@mood-trip/validators';
import { queryKeys } from '@/lib/query/query-keys';
import { createEntries, updateEntries } from '@/api/trips/api';

type CreateEntriesVariables = {
  tripId: string;
  body: CreateEntriesBatchBody;
};

function _invalidateTripQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  tripId: string,
): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.trips.all });
  queryClient.invalidateQueries({
    queryKey: queryKeys.trips.detail(tripId),
  });
}

export function useCreateEntriesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tripId, body }: CreateEntriesVariables) =>
      createEntries(tripId, body),
    onSuccess: (_data, variables) => {
      _invalidateTripQueries(queryClient, variables.tripId);
    },
  });
}

type UpdateEntriesVariables = {
  tripId: string;
  body: UpdateEntriesBatchBody;
};

export function useUpdateEntriesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tripId, body }: UpdateEntriesVariables) =>
      updateEntries(tripId, body),
    onSuccess: (_data, variables) => {
      _invalidateTripQueries(queryClient, variables.tripId);
    },
  });
}
