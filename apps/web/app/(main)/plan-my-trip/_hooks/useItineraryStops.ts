'use client';

import { useMemo } from 'react';
import type { PlannedTrip } from '@mood-trip/validators';
import { flattenItinerary } from '../_lib/itinerary-utils';

export function useItineraryStops(trip: PlannedTrip | null) {
  const stops = useMemo(
    () => (trip ? flattenItinerary(trip) : []),
    [trip],
  );

  return {
    stops,
    center: trip?.center ?? null,
    isLoading: false,
    error: null,
  };
}
