'use client';

import dynamic from 'next/dynamic';
import { useState, useSyncExternalStore } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from '@mood-trip/ui';
import { ArrowLeftIcon, LoaderCircleIcon } from 'lucide-react';
import type { ItineraryMapStyle, ItineraryPlan } from '@mood-trip/validators';
import ItineraryDayList from './ItineraryDayList';
import { findItineraryStop } from '../_lib/itinerary-utils';
import { useItineraryStops } from '../_hooks/useItineraryStops';

const DESKTOP_QUERY = '(min-width: 1024px)';

const ItineraryMap = dynamic(() => import('./ItineraryMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[320px] items-center justify-center rounded-lg border border-dashed">
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

function _subscribeIsDesktop(onStoreChange: () => void): () => void {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener('change', onStoreChange);
  return () => {
    media.removeEventListener('change', onStoreChange);
  };
}

function _getIsDesktop(): boolean {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function useIsDesktop(): boolean {
  return useSyncExternalStore(_subscribeIsDesktop, _getIsDesktop, () => false);
}

const ItineraryExplorer = ({
  plan,
  mapStyle,
  onBack,
  onSave,
  isSaving = false,
}: ItineraryExplorerProps) => {
  const { stops, center, isLoading, error } = useItineraryStops(plan);
  const isDesktop = useIsDesktop();
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [focusStopId, setFocusStopId] = useState<string | null>(null);
  const [flyToEnabled, setFlyToEnabled] = useState(true);
  const [mapOpen, setMapOpen] = useState(false);
  const activeStopId = selectedStopId ?? stops[0]?.id ?? null;
  const activeStop = findItineraryStop(stops, activeStopId);

  if (isDesktop && mapOpen) {
    setMapOpen(false);
  }

  const selectStop = (stopId: string): void => {
    setSelectedStopId(stopId);
    setFocusStopId(stopId);
  };

  const handleLocationClick = (stopId: string): void => {
    selectStop(stopId);
    if (!isDesktop) {
      setMapOpen(true);
    }
  };

  const map = (
    <ItineraryMap
      mapStyle={mapStyle}
      mapError={mapStyle ? null : 'Map is unavailable.'}
      isMapLoading={false}
      stops={stops}
      activeStopId={activeStopId}
      center={center}
      flyToEnabled={isDesktop ? flyToEnabled : true}
      onMarkerClick={selectStop}
    />
  );

  return (
    // Desktop: fill the viewport minus the layout padding and footer (shared
    // vars in globals.css) so only the day list scrolls beside the map.
    <div className="explorer-enter flex flex-col gap-4 lg:h-[calc(100dvh-var(--main-pt)-var(--main-pb)-var(--footer-h))] lg:min-h-0">
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
          <div className="hidden lg:block">
            <Button
              type="button"
              variant={flyToEnabled ? 'accent' : 'outline'}
              aria-pressed={flyToEnabled}
              onClick={() => setFlyToEnabled((enabled) => !enabled)}
            >
              Fly to stop
            </Button>
          </div>
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

      <div className="flex flex-col gap-4 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:grid-rows-[minmax(0,1fr)]">
        <div className="lg:flex lg:max-h-full lg:min-h-0 lg:flex-col lg:self-start">
          <ItineraryDayList
            plan={plan}
            stops={stops}
            activeStopId={activeStopId}
            focusStopId={focusStopId}
            onActiveStopChange={setSelectedStopId}
            onStopClick={selectStop}
            onLocationClick={handleLocationClick}
          />
        </div>

        <div className="hidden h-full min-h-0 overflow-hidden lg:block">
          {isDesktop ? map : null}
        </div>
        {isDesktop ? null : (
          <Modal open={mapOpen} onOpenChange={setMapOpen}>
            <ModalContent size="lg">
              <ModalHeader
                title={activeStop?.placeName ?? 'Map'}
                description={activeStop?.title}
                showClose
              />
              <ModalBody>
                <div className="h-[60vh] min-h-[280px] overflow-hidden rounded-lg">
                  {mapOpen ? map : null}
                </div>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default ItineraryExplorer;
