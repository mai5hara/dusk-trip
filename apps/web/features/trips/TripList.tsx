'use client';

import type { Trip } from "@mood-trip/validators";

const TripList = ({ initialTrips }: { initialTrips: Trip[] }) => {
  return (
    <div>
      <h1>Trip List</h1>
      <ul>
        {initialTrips.map((trip) => (
          <li key={trip.id}>{trip.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default TripList;