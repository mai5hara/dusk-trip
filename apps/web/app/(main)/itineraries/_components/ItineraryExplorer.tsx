'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Button } from '@mood-trip/ui';
import { ArrowLeftIcon, LoaderCircleIcon } from 'lucide-react';
import type { ItineraryMapStyle, ItineraryPlan } from '@mood-trip/validators';
import ItineraryDayList from './ItineraryDayList';
import { useItineraryStops } from '../_hooks/useItineraryStops';

const ItineraryMap = dynamic(() => import('./ItineraryMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[320px] items-center justify-center rounded-3xl border border-dashed">
      <LoaderCircleIcon className="size-6 animate-spin opacity-60" />
    </div>
  ),
});

type ItineraryExplorerProps = {
  plan: ItineraryPlan;
  mapStyle: ItineraryMapStyle | null;
  onBack: () => void;
  onSave?: () => void;
  isSaving?: boolean;
};

const ItineraryExplorer = ({
  plan,
  mapStyle,
  onBack,
  onSave,
  isSaving = false,
}: ItineraryExplorerProps) => {
  const { stops, center, isLoading, error } = useItineraryStops(plan);
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
        <div className="flex items-center gap-3">
          {isLoading ? (
            <p className="flex items-center gap-2 text-sm opacity-70">
              <LoaderCircleIcon className="size-4 animate-spin" />
              Loading itinerary map...
            </p>
          ) : null}
          {onSave ? (
            <Button
              type="button"
              variant="accent"
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save itinerary'}
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="rounded-2xl border border-dashed px-4 py-3 text-sm opacity-80">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="overflow-hidden rounded-3xl border bg-surface lg:h-full lg:min-h-0">
          <ItineraryDayList
            plan={plan}
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
          <ItineraryMap
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

export default ItineraryExplorer;
