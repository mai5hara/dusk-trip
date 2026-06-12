"use client";

import { useMemo } from "react";
import type { TripListItem } from "@mood-trip/validators";
import { filterTripByQuery, sortTrips } from "./trip-list-utils";
import { useTripListContext } from "./trip-list-context";

type UseTripListProps = {
  initialTrips: TripListItem[];
}

export function useTripList({initialTrips}: UseTripListProps){
  const { query, sort } = useTripListContext();

  const trips = useMemo(() => {
    const filtered = filterTripByQuery(initialTrips, query);
    return sortTrips(filtered, sort);
  }, [initialTrips, query, sort]);

  return { trips };
}