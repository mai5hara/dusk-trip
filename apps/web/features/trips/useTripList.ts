"use client";

import { useMemo } from "react";
import type { TripListItem } from "@mood-trip/validators";
import { filterTripByQuery, sortTrips, filterTripsByDateRange } from "./trip-list-utils";
import { useTripListContext } from "./trip-list-context";

type UseTripListProps = {
  initialTrips: TripListItem[];
}

export function useTripList({initialTrips}: UseTripListProps){
  const { query, sort, dateRange } = useTripListContext();

  const trips = useMemo(() => {
    const filteredBySearch = filterTripByQuery(initialTrips, query);
    const filteredByDateRange = filterTripsByDateRange(filteredBySearch, dateRange);
    return sortTrips(filteredByDateRange, sort);
  }, [initialTrips, query, sort, dateRange]);

  return { trips };
}