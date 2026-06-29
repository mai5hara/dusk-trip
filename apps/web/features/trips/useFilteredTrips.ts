'use client';

import { useMemo } from 'react';
import type { TripListItem } from '@mood-trip/validators';
import {
  filterTripByQuery,
  sortTrips,
  filterTripsByDateRange,
} from './trip-list-utils';
import { useTripListContext } from './trip-list-context';

type UseTripListProps = {
  trips: TripListItem[];
};

export function useFilteredTrips({ trips }: UseTripListProps) {
  const { query, sort, dateRange } = useTripListContext();

  const filteredTrips = useMemo(() => {
    const filteredBySearch = filterTripByQuery(trips, query);
    const filteredByDateRange = filterTripsByDateRange(
      filteredBySearch,
      dateRange,
    );
    return sortTrips(filteredByDateRange, sort);
  }, [trips, query, sort, dateRange]);

  return { filteredTrips };
}
