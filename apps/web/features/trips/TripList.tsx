'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TripCard from './TripCard';
import TripFilter from './TripFilter';
import { useFilteredTrips } from './useFilteredTrips';
import { useAuth } from '@/features/auth/auth-context';
import { useTripsQuery } from './useTripsQuery';

const TripList = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { data: trips = [], isLoading, isError } = useTripsQuery();
  const { filteredTrips } = useFilteredTrips({ trips });

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (isError) {
      router.replace('/login');
    }
  }, [isError, router]);

  const isPageLoading = isAuthLoading || isLoading;

  return (
    <div className="flex flex-col gap-6 pt-10">
      <TripFilter />
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {isPageLoading ? (
          <p>Loading...</p>
        ) : (
          filteredTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)
        )}
      </div>
    </div>
  );
};

export default TripList;
