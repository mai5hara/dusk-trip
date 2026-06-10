'use client';

import type { TripListItem } from "@mood-trip/validators";
import TripCard from "./TripCard";
import TripFilter from "./TripFilter";

const TripList = ({ initialTrips }: { initialTrips: TripListItem[] }) => {
  return (
    <div className="flex flex-col gap-6 pt-10">
      <TripFilter />
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {initialTrips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  );
};

export default TripList;