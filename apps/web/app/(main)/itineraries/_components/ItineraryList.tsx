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
  const {
    data: itineraries = [],
    isLoading,
    isError,
    error,
  } = useItinerariesQuery();

  useEffect(() => {
    const status = getErrorStatus(error);
    if (isError && (status === 401 || status === 403)) {
      router.replace('/login');
    }
  }, [isError, error, router]);

  if (isLoading) {
    return <p className="pt-10 text-sm opacity-70">Loading itineraries...</p>;
  }

  if (isError) {
    return (
      <p className="pt-10 text-sm opacity-70">
        Could not load itineraries. Please try again.
      </p>
    );
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

function getErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }

  if (
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number'
  ) {
    return (error as { status: number }).status;
  }

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return 401;
    }
    const match = /status:\s*(\d+)/i.exec(error.message);
    if (match) {
      return Number(match[1]);
    }
  }

  return undefined;
}
