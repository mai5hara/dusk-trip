import { apiClient } from '@/api/_common/client';
import {
  type CreateEntriesBatchBody,
  type CreateTripBody,
  type Entry,
  type TripListItem,
  type TripWithEntries,
  type UpdateEntriesBatchBody,
  type UpdateTripBody,
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

export async function createEntries(
  tripId: string,
  body: CreateEntriesBatchBody,
): Promise<Entry[]> {
  return apiClient<Entry[]>(`/trips/${tripId}/entries/batch`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateTrip(
  id: string,
  body: UpdateTripBody,
): Promise<TripListItem> {
  return apiClient<TripListItem>(`/trips/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function updateEntries(
  tripId: string,
  body: UpdateEntriesBatchBody,
): Promise<Entry[]> {
  return apiClient<Entry[]>(`/trips/${tripId}/entries/batch`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
