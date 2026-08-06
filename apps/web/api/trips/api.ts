import { apiClient } from '@/lib/api/client';
import type { TripListItem, TripWithEntries } from '@mood-trip/validators';

export async function getTrips(): Promise<TripListItem[]> {
  return apiClient<TripListItem[]>('/trips');
}

export async function getTrip(id: string): Promise<TripWithEntries> {
  return apiClient<TripWithEntries>(`/trips/${id}`);
}
