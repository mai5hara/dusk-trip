'use client';

import { useEffect, useMemo, useRef } from 'react';
import Map, {
  AttributionControl,
  Marker,
  NavigationControl,
} from 'react-map-gl/maplibre';
import type { MapRef } from 'react-map-gl/maplibre';
import type { StyleSpecification } from 'maplibre-gl';
import type { ItineraryMapStyle } from '@mood-trip/validators';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { ItineraryStop } from '../_lib/itinerary-utils';

type TripItineraryMapProps = {
  mapStyle: ItineraryMapStyle | null;
  mapError: string | null;
  isMapLoading: boolean;
  stops: ItineraryStop[];
  activeStopId: string | null;
  center: { lat: number; lng: number } | null;
  onMarkerClick: (stopId: string) => void;
};

function MapViewport({
  mapRef,
  stops,
  activeStop,
  center,
}: {
  mapRef: React.RefObject<MapRef | null>;
  stops: ItineraryStop[];
  activeStop: ItineraryStop | null;
  center: { lat: number; lng: number } | null;
}) {
  const lastActiveIdRef = useRef<string | null>(null);

  // Keep the map focused on whichever stop is active — on first load and on
  // every selection/scroll change — so the highlighted card and the map always
  // agree. The initial view already centres on the first stop, so the opening
  // fly is effectively a no-op rather than a jarring zoom-out-then-in.
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || stops.length === 0 || !activeStop) {
      return;
    }

    if (activeStop.id === lastActiveIdRef.current) {
      return;
    }

    lastActiveIdRef.current = activeStop.id;
    map.flyTo({
      center: [activeStop.lng, activeStop.lat],
      zoom: 16.5,
      duration: 1100,
      essential: true,
    });
  }, [activeStop, mapRef, stops.length]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !center || stops.length > 0) {
      return;
    }

    map.flyTo({
      center: [center.lng, center.lat],
      zoom: 12,
      duration: 1200,
      essential: true,
    });
  }, [center, mapRef, stops.length]);

  return null;
}

const TripItineraryMap = ({
  mapStyle,
  mapError,
  isMapLoading,
  stops,
  activeStopId,
  center,
  onMarkerClick,
}: TripItineraryMapProps) => {
  const mapRef = useRef<MapRef | null>(null);
  const activeStop =
    stops.find((stop) => stop.id === activeStopId) ?? stops[0] ?? null;

  // Guarantee the compact attribution starts collapsed (just the ⓘ button);
  // some maplibre builds initialise it expanded. Clicking ⓘ still opens it.
  const collapseAttribution = () => {
    mapRef.current
      ?.getContainer()
      ?.querySelectorAll('.maplibregl-ctrl-attrib')
      .forEach((el) => {
        el.classList.remove('maplibregl-compact-show');
        el.removeAttribute('open');
      });
  };

  const initialViewState = useMemo(() => {
    if (activeStop) {
      return {
        longitude: activeStop.lng,
        latitude: activeStop.lat,
        zoom: 15.5,
      };
    }

    if (center) {
      return {
        longitude: center.lng,
        latitude: center.lat,
        zoom: 12,
      };
    }

    return null;
  }, [activeStop, center]);

  if (isMapLoading) {
    return (
      <div className="flex h-full min-h-80 items-center justify-center rounded-3xl border border-dashed">
        <p className="text-sm opacity-70">Loading map...</p>
      </div>
    );
  }

  if (mapError || !mapStyle || !initialViewState) {
    return (
      <div className="flex h-full min-h-80 items-center justify-center rounded-3xl border border-dashed px-6 text-center text-sm opacity-70">
        {mapError ?? 'Map is unavailable.'}
      </div>
    );
  }

  return (
    <div className="itinerary-map-shell h-full min-h-80 w-full overflow-hidden rounded-3xl">
      <Map
        ref={mapRef}
        mapStyle={mapStyle as StyleSpecification}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        onLoad={collapseAttribution}
      >
        {/* Exactly one credit control, collapsed to the ⓘ button by default.
            `attributionControl={false}` disables the built-in one so we don't
            render two. The style's sources already carry the MapTiler/OSM
            attribution, so no custom string is needed. */}
        <AttributionControl compact position="bottom-right" />
        <NavigationControl position="top-right" showCompass={false} />
        {stops.map((stop) => {
          const isActive = stop.id === activeStopId;

          return (
            <Marker
              key={stop.id}
              longitude={stop.lng}
              latitude={stop.lat}
              anchor="center"
              onClick={(event) => {
                event.originalEvent.stopPropagation();
                onMarkerClick(stop.id);
              }}
            >
              <div
                className={`itinerary-marker${isActive ? ' itinerary-marker--active' : ''}`}
              />
            </Marker>
          );
        })}
      </Map>
      <MapViewport
        mapRef={mapRef}
        stops={stops}
        activeStop={activeStop}
        center={center}
      />
    </div>
  );
};

export default TripItineraryMap;
