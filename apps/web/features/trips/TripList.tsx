'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TripListItem } from '@mood-trip/validators';
import TripCard from './TripCard';
import TripFilter from './TripFilter';
import { useTripList } from './useTripList';
import { useAuth } from '@/features/auth/auth-context';
import { getTrips } from './api';

const TripList = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [initialTrips, setInitialTrips] = useState<TripListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    getTrips()
      .then(setInitialTrips)
      .catch(() => router.replace('/login'))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, router]);

  const { trips } = useTripList({ initialTrips });

  return (
    <div className="flex flex-col gap-6 pt-10">
      <TripFilter />
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          trips.map((trip) => <TripCard key={trip.id} trip={trip} />)
        )}
      </div>
    </div>
  );
};

export default TripList;
