import type { TripListItem } from "@mood-trip/validators";

export function filterTripByQuery(
  trips: TripListItem[],
  query: string
): TripListItem[] {
  const normalized = query.trim().toLowerCase();
  if(!normalized) return trips;

  return trips.filter((trip) => 
    trip.title.toLowerCase().includes(normalized) ||
    trip.location.toLowerCase().includes(normalized)
  );
}