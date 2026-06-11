"use client";

import { useMemo } from "react";
import type { TripListItem } from "@mood-trip/validators";
import { filterTripByQuery } from "./trip-list-utils";
import { useTripListContext } from "./trip-list-context";

type UseTripListProps = {
  initialTrips: TripListItem[];
}

export function useTripList({initialTrips}: UseTripListProps){
  const { query } = useTripListContext();

  const trips = useMemo(() => 
    filterTripByQuery(initialTrips, query),
  [initialTrips, query]);

  return { trips };
}