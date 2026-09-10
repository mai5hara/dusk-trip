import { apiClient } from '@/api/_common/client';
import {
  destinationSuggestionsResponseSchema,
  type DestinationSuggestion,
} from '@mood-trip/validators';

export async function searchDestinationSuggestions(
  query: string,
): Promise<DestinationSuggestion[]> {
  const params = new URLSearchParams({ q: query });
  const response = await apiClient<unknown>(
    `/geocoding/suggestions?${params.toString()}`,
  );

  return destinationSuggestionsResponseSchema.parse(response).suggestions;
}
