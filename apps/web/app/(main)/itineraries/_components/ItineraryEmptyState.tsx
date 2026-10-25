'use client';

import { ButtonLink } from '@mood-trip/ui';
import { SparklesIcon } from 'lucide-react';

const ItineraryEmptyState = () => {
  return (
    <div className="mx-auto flex w-full max-w-225 flex-col items-center pb-40">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <h1 className="text-2xl font-mono font-medium">No itineraries yet</h1>
        <p className="text-sm opacity-70">
          Generate a mood-led plan, then save it here to reopen later.
        </p>
        <ButtonLink href="/itineraries/new" variant="accent">
          <SparklesIcon className="size-4" />
          Create itinerary
        </ButtonLink>
      </div>
    </div>
  );
};

export default ItineraryEmptyState;
