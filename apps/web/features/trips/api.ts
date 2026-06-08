import { apiClient } from "@/lib/api/client";
import type { Trip, TripWithEntries } from "@mood-trip/validators";

export async function getTrips(userId: string): Promise<Trip[]> {
  const params = new URLSearchParams({ userId });
  return apiClient<Trip[]>(`/trips?${params.toString()}`);
}

export async function getTrip(id: string): Promise<TripWithEntries> {
  return apiClient<TripWithEntries>(`/trips/${id}`);
}