import { apiClient } from '@/api/_common/client';
import {
  planTripResponseSchema,
  type CreateEntryBody,
  type CreateTripBody,
  type Entry,
  type PlanTripBody,
  type PlanTripResponse,
  type TripListItem,
  type TripWithEntries,
} from '@mood-trip/validators';

export async function getTrips(): Promise<TripListItem[]> {
  return apiClient<TripListItem[]>('/trips');
}

export async function getTrip(id: string): Promise<TripWithEntries> {
  return apiClient<TripWithEntries>(`/trips/${id}`);
}

export async function createTrip(body: CreateTripBody): Promise<TripListItem> {
  return apiClient<TripListItem>('/trips', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function createEntry(
  tripId: string,
  body: CreateEntryBody,
): Promise<Entry> {
  return apiClient<Entry>(`/trips/${tripId}/entries`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function planTrip(body: PlanTripBody): Promise<PlanTripResponse> {
  const response = await apiClient<unknown>('/trips/plan', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return planTripResponseSchema.parse(response);
}
