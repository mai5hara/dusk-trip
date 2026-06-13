import type { TripListItem } from '@mood-trip/validators';
import type { TripSort } from './trip-sort';
import { type DateRangePickerValue } from '@mood-trip/ui';

export function filterTripByQuery(
  trips: TripListItem[],
  query: string,
): TripListItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return trips;

  return trips.filter(
    (trip) =>
      trip.title.toLowerCase().includes(normalized) ||
      trip.location.toLowerCase().includes(normalized),
  );
}

export function sortTrips(
  trips: TripListItem[],
  sort: TripSort,
): TripListItem[] {
  return [...trips].sort((a, b) => {
    switch (sort) {
      case 'newest':
        return (
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
      case 'oldest':
        return (
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
      case 'a-z':
        return a.title.localeCompare(b.title);
      case 'z-a':
        return b.title.localeCompare(a.title);
      default: {
        const _exhaustive: never = sort;
        return _exhaustive;
      }
    }
  });
}

export function filterTripsByDateRange(
  trips: TripListItem[],
  dateRange: DateRangePickerValue | undefined,
): TripListItem[] {
  const from = dateRange?.from;
  const to = dateRange?.to;

  if (!from && !to) return trips;

  return trips.filter((trip) => {
    const tripStart = new Date(trip.startDate).getTime();
    const tripEnd = new Date(trip.endDate).getTime();

    if (from && tripEnd < from.getTime()) return false;
    if (to && tripStart > to.getTime()) return false;

    return true;
  });
}
