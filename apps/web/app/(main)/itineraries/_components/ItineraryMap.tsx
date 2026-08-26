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
import { findItineraryStop, type ItineraryStop } from '../_lib/itinerary-utils';

type ItineraryMapProps = {
  mapStyle: ItineraryMapStyle | null;
  mapError: string | null;
  isMapLoading: boolean;
  stops: ItineraryStop[];
  activeStopId: string | null;
  center: { lat: number; lng: number } | null;
  flyToEnabled: boolean;
  onMarkerClick: (stopId: string) => void;
};

type MapViewportProps = {
  mapRef: React.RefObject<MapRef | null>;
  stops: ItineraryStop[];
  activeStop: ItineraryStop | null;
  center: { lat: number; lng: number } | null;
  flyToEnabled: boolean;
};

function _moveCamera(
  map: NonNullable<ReturnType<MapRef['getMap']>>,
  center: [number, number],
  zoom: number,
  animate: boolean,
): void {
  if (animate) {
    map.flyTo({ center, zoom, duration: 1100, essential: true });
    return;
  }

  map.stop();
  map.jumpTo({ center, zoom });
}

function MapViewport({
  mapRef,
  stops,
  activeStop,
  center,
  flyToEnabled,
}: MapViewportProps) {
  const lastActiveIdRef = useRef<string | null>(null);

  // Keep the map focused on whichever stop is active. Fly-to animates; jump-to
  // snaps instantly when the toggle is off.
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || stops.length === 0 || !activeStop) {
      return;
    }

    const alreadyThere = activeStop.id === lastActiveIdRef.current;
    if (alreadyThere && flyToEnabled) {
      return;
    }

    lastActiveIdRef.current = activeStop.id;
    _moveCamera(map, [activeStop.lng, activeStop.lat], 16.5, flyToEnabled);
  }, [activeStop, flyToEnabled, mapRef, stops.length]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !center || stops.length > 0) {
      return;
    }

    _moveCamera(map, [center.lng, center.lat], 12, flyToEnabled);
  }, [center, flyToEnabled, mapRef, stops.length]);

  return null;
}

const ItineraryMap = ({
  mapStyle,
  mapError,
  isMapLoading,
  stops,
  activeStopId,
  center,
  flyToEnabled,
  onMarkerClick,
}: ItineraryMapProps) => {
  const mapRef = useRef<MapRef | null>(null);
  const activeStop = findItineraryStop(stops, activeStopId);

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
                role="button"
                tabIndex={0}
                aria-label={stop.placeName}
                className={`itinerary-marker${isActive ? ' itinerary-marker--active' : ''}`}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') {
                    return;
                  }
                  event.preventDefault();
                  event.stopPropagation();
                  onMarkerClick(stop.id);
                }}
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
        flyToEnabled={flyToEnabled}
      />
    </div>
  );
};

export default ItineraryMap;
