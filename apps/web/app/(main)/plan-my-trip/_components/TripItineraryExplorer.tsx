'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Button } from '@mood-trip/ui';
import { ArrowLeftIcon, LoaderCircleIcon } from 'lucide-react';
import type { ItineraryMapStyle, PlannedTrip } from '@mood-trip/validators';
import TripItineraryList from './TripItineraryList';
import { useItineraryStops } from '../_hooks/useItineraryStops';

const TripItineraryMap = dynamic(() => import('./TripItineraryMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[320px] items-center justify-center rounded-3xl border border-dashed">
      <LoaderCircleIcon className="size-6 animate-spin opacity-60" />
    </div>
  ),
});

type TripItineraryExplorerProps = {
  trip: PlannedTrip;
  mapStyle: ItineraryMapStyle | null;
  onBack: () => void;
};

const TripItineraryExplorer = ({
  trip,
  mapStyle,
  onBack,
}: TripItineraryExplorerProps) => {
  const { stops, center, isLoading, error } = useItineraryStops(trip);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [focusStopId, setFocusStopId] = useState<string | null>(null);
  const activeStopId = selectedStopId ?? stops[0]?.id ?? null;

  return (
    <div className="explorer-enter flex flex-col gap-4 lg:h-full lg:min-h-0">
      <div className="flex items-center justify-between gap-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeftIcon className="size-4" />
          Back
        </Button>
        {isLoading ? (
          <p className="flex items-center gap-2 text-sm opacity-70">
            <LoaderCircleIcon className="size-4 animate-spin" />
            Loading itinerary map...
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-2xl border border-dashed px-4 py-3 text-sm opacity-80">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="overflow-hidden rounded-3xl border bg-surface lg:h-full lg:min-h-0">
          <TripItineraryList
            trip={trip}
            stops={stops}
            activeStopId={activeStopId}
            focusStopId={focusStopId}
            onActiveStopChange={setSelectedStopId}
            onStopClick={(stopId) => {
              setSelectedStopId(stopId);
              setFocusStopId(stopId);
            }}
          />
        </div>

        <div className="h-[55vh] min-h-[280px] lg:h-full lg:min-h-0">
          <TripItineraryMap
            mapStyle={mapStyle}
            mapError={mapStyle ? null : 'Map is unavailable.'}
            isMapLoading={false}
            stops={stops}
            activeStopId={activeStopId}
            center={center}
            onMarkerClick={(stopId) => {
              setSelectedStopId(stopId);
              setFocusStopId(stopId);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TripItineraryExplorer;
