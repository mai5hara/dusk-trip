import { Trip } from "@mood-trip/validators"

export function useTripList({ initialTrips }: { initialTrips: Trip[] }): {
  initialTrips: Trip[];
} {
  return {
    initialTrips
  };
}