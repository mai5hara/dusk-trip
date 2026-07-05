import { apiClient } from '@/lib/api/client';
import type {
  CreateTripBody,
  TripListItem,
  CreateEntryBody,
  Entry,
} from '@mood-trip/validators';

export async function createEntry(
  tripId: string,
  body: CreateEntryBody,
): Promise<Entry> {
  return apiClient<Entry>(`/trips/${tripId}/entries`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function createTrip(body: CreateTripBody): Promise<TripListItem> {
  return apiClient<TripListItem>('/trips', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
