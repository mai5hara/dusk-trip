'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateEntryBody } from '@mood-trip/validators';
import { queryKeys } from '../../lib/query/query-keys';
import { createEntry } from './api';

type CreateEntryVariables = {
  tripId: string;
  body: CreateEntryBody;
};

export function useCreateEntryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tripId, body }: CreateEntryVariables) =>
      createEntry(tripId, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.trips.detail(variables.tripId),
      });
    },
  });
}
