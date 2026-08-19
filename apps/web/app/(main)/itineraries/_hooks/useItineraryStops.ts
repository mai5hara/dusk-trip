'use client';

import { useMemo } from 'react';
import type { ItineraryPlan } from '@mood-trip/validators';
import { flattenItinerary } from '../_lib/itinerary-utils';

export function useItineraryStops(plan: ItineraryPlan | null) {
  const stops = useMemo(() => (plan ? flattenItinerary(plan) : []), [plan]);

  return {
    stops,
    center: plan?.center ?? null,
    isLoading: false,
    error: null,
  };
}
