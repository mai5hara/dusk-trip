'use client';

import { useRouter } from 'next/navigation';
import ItineraryExplorer from './ItineraryExplorer';
import { useItineraryQuery } from '../_hooks/useItineraryQuery';

const SavedItineraryView = ({ id }: { id: string }) => {
  const router = useRouter();
  const { data, isLoading, isError } = useItineraryQuery(id);

  if (isLoading) {
    return <p className="pt-10 text-sm opacity-70">Loading itinerary...</p>;
  }

  if (isError || !data) {
    return (
      <p className="pt-10 text-sm opacity-70">Could not load this itinerary.</p>
    );
  }

  return (
    <section className="flex flex-col py-2 lg:min-h-0 lg:flex-1 lg:py-0">
      <ItineraryExplorer
        plan={data.plan}
        mapStyle={data.mapStyle}
        onBack={() => router.push('/itineraries')}
      />
    </section>
  );
};

export default SavedItineraryView;
