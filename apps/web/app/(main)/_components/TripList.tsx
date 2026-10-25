'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TripCard from './TripCard';
import TripFilter from './TripFilter';
import { useFilteredTrips } from '../_hooks/useFilteredTrips';
import { useTripsQuery } from '../_hooks/useTripsQuery';

const TripList = () => {
  const router = useRouter();
  const { data: trips = [], isLoading, isError } = useTripsQuery();
  const { filteredTrips } = useFilteredTrips({ trips });

  useEffect(() => {
    if (isError) {
      router.replace('/login');
    }
  }, [isError, router]);

  return (
    <div className="flex flex-col gap-6 pt-10">
      <TripFilter />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          filteredTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)
        )}
      </div>
    </div>
  );
};

export default TripList;
