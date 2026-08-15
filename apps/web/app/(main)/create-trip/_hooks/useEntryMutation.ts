'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CreateEntryBody,
  CreateEntriesBatchBody,
} from '@mood-trip/validators';
import { queryKeys } from '@/lib/query/query-keys';
import { createEntry, createEntries } from '@/api/trips/api';

type CreateEntryVariables = {
  tripId: string;
  body: CreateEntryBody;
};

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

export function useCreateEntryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tripId, body }: CreateEntryVariables) =>
      createEntry(tripId, body),
    onSuccess: (_data, variables) => {
      _invalidateTripQueries(queryClient, variables.tripId);
    },
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
