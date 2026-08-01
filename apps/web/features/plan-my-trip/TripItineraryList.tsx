'use client';

import { useEffect, useMemo, useRef } from 'react';
import { MapPinIcon } from 'lucide-react';
import type {
  PlannedTrip,
  PlannedTripDay,
  PlannedTripItem,
} from '@mood-trip/validators';
import { getItineraryStopId, type ItineraryStop } from './itinerary-utils';
import { useScrollSpy } from './useScrollSpy';

type TripItineraryListProps = {
  trip: PlannedTrip;
  stops: ItineraryStop[];
  activeStopId: string | null;
  focusStopId: string | null;
  onActiveStopChange: (stopId: string) => void;
  onStopClick: (stopId: string) => void;
};

const TripItineraryList = ({
  trip,
  stops,
  activeStopId,
  focusStopId,
  onActiveStopChange,
  onStopClick,
}: TripItineraryListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const stopIds = useMemo(() => stops.map((stop) => stop.id), [stops]);
  const { pauseScrollSpy } = useScrollSpy(
    scrollRef,
    stopIds,
    onActiveStopChange,
    stops.length > 0,
  );

  // A freshly generated plan must start at the very top — reset this list's
  // scroll, every scrollable ancestor (the page shell), and the window.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    let node: HTMLElement | null | undefined = scrollRef.current?.parentElement;
    while (node) {
      node.scrollTop = 0;
      node = node.parentElement;
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!focusStopId) {
      return;
    }

    pauseScrollSpy();
    scrollRef.current
      ?.querySelector(`[data-stop-id="${focusStopId}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusStopId, pauseScrollSpy]);

  const handleStopClick = (stopId: string) => {
    pauseScrollSpy();
    onStopClick(stopId);
    scrollRef.current
      ?.querySelector(`[data-stop-id="${stopId}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="flex flex-col lg:h-full lg:min-h-0">
      <div className="shrink-0 border-b px-5 py-5">
        <p className="text-xs uppercase tracking-[0.2em] opacity-70 sm:text-sm">
          Draft itinerary
        </p>
        <h2 className="mt-2 text-xl sm:text-2xl">{trip.title}</h2>
        <p className="mt-2 text-sm opacity-80">{trip.summary}</p>
      </div>

      {/* No top padding: a sticky `top-0` header cannot rise above its scroll
          container's content box, so any padding-top here would pin the header
          that far down and leave a gap above it. */}
      <div
        ref={scrollRef}
        className="itinerary-scroll px-5 pb-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
      >
        {trip.days.map((day: PlannedTripDay) => (
          <section key={day.dayLabel} className="mb-6 last:mb-0">
            {/* Full-bleed (-mx-5 + px-5) so the divider stretches edge to edge,
                matching the header above. The container has no top padding, so
                the sticky header still pins flush with no gap. */}
            <div className="sticky top-0 z-20 -mx-5 flex items-baseline gap-2 border-b border-border/60 bg-surface px-5 pb-3 pt-2.5">
              <h3 className="shrink-0 text-sm font-semibold tracking-wide">
                {day.dayLabel}
              </h3>
              <span aria-hidden className="opacity-30">
                ·
              </span>
              <p className="truncate text-sm opacity-60">{day.theme}</p>
            </div>

            {/* mt-3 lives on the (non-sticky) cards, so it scrolls under the
                header rather than leaving a transparent strip beneath it. */}
            <div className="mt-3 space-y-3">
              {day.items.map((item: PlannedTripItem) => {
                const stopId = getItineraryStopId(day.dayLabel, item.timeOfDay);
                const isActive = activeStopId === stopId;

                return (
                  <button
                    key={stopId}
                    type="button"
                    data-stop-id={stopId}
                    onClick={() => handleStopClick(stopId)}
                    className={`itinerary-stop w-full overflow-hidden rounded-2xl border text-left transition-all duration-300 ${
                      isActive
                        ? 'border-accent bg-accent/10 shadow-[0_12px_40px_-24px_var(--color-accent)]'
                        : 'border-border hover:border-accent/40 hover:bg-accent/5'
                    }`}
                  >
                    {item.image ? (
                      <figure className="relative m-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image.url}
                          alt={item.placeName}
                          loading="lazy"
                          className="h-36 w-full object-cover"
                        />
                        {/* Gradient scrim keeps the credit legible over any photo. */}
                        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/55 to-transparent" />
                        <figcaption className="absolute bottom-1.5 right-2 text-[10px] font-medium leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                          {item.image.attribution} · Wikipedia
                        </figcaption>
                      </figure>
                    ) : null}
                    <div className="p-4">
                      <p className="text-xs uppercase tracking-[0.2em] opacity-60">
                        {item.timeOfDay}
                      </p>
                      <h4 className="mt-2 text-base font-medium">
                        {item.title}
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed opacity-75">
                        {item.description}
                      </p>
                      <p className="mt-3 flex items-center gap-1.5 text-xs opacity-60">
                        <MapPinIcon className="size-3.5" />
                        {item.placeName}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default TripItineraryList;
