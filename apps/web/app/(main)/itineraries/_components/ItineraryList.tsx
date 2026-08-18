'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ButtonLink } from '@mood-trip/ui';
import { SparklesIcon } from 'lucide-react';
import { useItinerariesQuery } from '../_hooks/useItinerariesQuery';
import ItineraryCard from './ItineraryCard';
import ItineraryEmptyState from './ItineraryEmptyState';

const ItineraryList = () => {
  const router = useRouter();
  const { data: itineraries = [], isLoading, isError } = useItinerariesQuery();

  useEffect(() => {
    if (isError) {
      router.replace('/login');
    }
  }, [isError, router]);

  if (isLoading) {
    return <p className="pt-10 text-sm opacity-70">Loading itineraries...</p>;
  }

  if (itineraries.length === 0) {
    return <ItineraryEmptyState />;
  }

  return (
    <div className="flex flex-col gap-6 pt-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-mono font-medium">Itineraries</h1>
        <ButtonLink href="/itineraries/new" variant="accent" size="sm">
          <SparklesIcon className="size-4" />
          Create itinerary
        </ButtonLink>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {itineraries.map((itinerary) => (
          <ItineraryCard key={itinerary.id} itinerary={itinerary} />
        ))}
      </div>
    </div>
  );
};

export default ItineraryList;
