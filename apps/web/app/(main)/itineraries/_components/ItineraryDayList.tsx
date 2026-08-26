'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@mood-trip/ui';
import type { ItineraryPlan, ItineraryPlanDay } from '@mood-trip/validators';
import {
  getItineraryStopId,
  type ItineraryStop,
} from '../_lib/itinerary-utils';
import { useScrollSpy } from '../_hooks/useScrollSpy';
import ItineraryStopCard from './ItineraryStopCard';

const SCROLL_CONTAINER_SELECTOR = '.itinerary-scroll';
const SCROLL_END_EPSILON_PX = 4;

function _shouldShowOverflowFade(element: HTMLElement): boolean {
  const overflowPx = element.scrollHeight - element.clientHeight;
  if (overflowPx <= SCROLL_END_EPSILON_PX) {
    return false;
  }

  return (
    element.scrollTop + element.clientHeight <
    element.scrollHeight - SCROLL_END_EPSILON_PX
  );
}

function _resetScrollToTop(element: HTMLElement): void {
  element.scrollTo({ top: 0 });

  let ancestor: HTMLElement | null = element.parentElement;
  while (ancestor) {
    ancestor.scrollTo({ top: 0 });
    ancestor = ancestor.parentElement;
  }

  window.scrollTo(0, 0);
}

type ItineraryDayListProps = {
  plan: ItineraryPlan;
  stops: ItineraryStop[];
  activeStopId: string | null;
  focusStopId: string | null;
  onActiveStopChange: (stopId: string) => void;
  onStopClick: (stopId: string) => void;
  onLocationClick: (stopId: string) => void;
};

const ItineraryDayList = ({
  plan,
  stops,
  activeStopId,
  focusStopId,
  onActiveStopChange,
  onStopClick,
  onLocationClick,
}: ItineraryDayListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [showOverflowFade, setShowOverflowFade] = useState(false);
  const stopIds = useMemo(() => stops.map((stop) => stop.id), [stops]);
  const { pauseScrollSpy } = useScrollSpy(
    SCROLL_CONTAINER_SELECTOR,
    stopIds,
    onActiveStopChange,
    stops.length > 0,
  );

  const syncOverflowFade = (): void => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    setShowOverflowFade(_shouldShowOverflowFade(container));
  };

  useEffect(() => {
    const container = scrollRef.current;
    const content = contentRef.current;
    if (!container || !content) {
      return;
    }

    syncOverflowFade();
    container.addEventListener('scroll', syncOverflowFade, { passive: true });

    const observer = new ResizeObserver(syncOverflowFade);
    observer.observe(container);
    observer.observe(content);

    return () => {
      container.removeEventListener('scroll', syncOverflowFade);
      observer.disconnect();
    };
  }, [plan]);

  // A freshly generated plan must start at the very top — reset this list's
  // scroll, every scrollable ancestor (the page shell), and the window.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    _resetScrollToTop(container);
    syncOverflowFade();
  }, []);

  useEffect(() => {
    if (!focusStopId) {
      return;
    }

    pauseScrollSpy();
    scrollRef.current
      ?.querySelector(`[data-stop-id="${CSS.escape(focusStopId)}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusStopId, pauseScrollSpy]);

  const handleStopClick = (stopId: string): void => {
    pauseScrollSpy();
    onStopClick(stopId);
    scrollRef.current
      ?.querySelector(`[data-stop-id="${CSS.escape(stopId)}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleLocationClick = (stopId: string): void => {
    pauseScrollSpy();
    onLocationClick(stopId);
  };

  return (
    <div className="itinerary-day-list">
      <Card variant="inset">
        <CardHeader>
          <CardTitle as="h2">{plan.title}</CardTitle>
          <CardDescription>{plan.summary}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="itinerary-day-body">
            <div
              ref={scrollRef}
              className="itinerary-scroll itinerary-day-scroll"
            >
              <div ref={contentRef} className="pb-6">
                {plan.days.map((day: ItineraryPlanDay) => (
                  <section key={day.dayLabel} className="mb-6 last:mb-0">
                    <div className="sticky top-0 z-20 flex items-baseline gap-2 border-b border-border/60 bg-surface pb-3 pt-2.5">
                      <h3 className="shrink-0 text-sm font-semibold tracking-wide">
                        {day.dayLabel}
                      </h3>
                      <span aria-hidden className="opacity-30">
                        ·
                      </span>
                      <p className="truncate text-sm opacity-60">{day.theme}</p>
                    </div>

                    <div className="mt-3 space-y-3">
                      {day.items.map((item) => {
                        const stopId = getItineraryStopId(
                          day.dayLabel,
                          item.timeOfDay,
                        );

                        return (
                          <ItineraryStopCard
                            key={stopId}
                            item={item}
                            stopId={stopId}
                            isActive={activeStopId === stopId}
                            onClick={handleStopClick}
                            onLocationClick={handleLocationClick}
                          />
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
            <div
              aria-hidden
              className="itinerary-overflow-fade"
              style={{ opacity: showOverflowFade ? 1 : 0 }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ItineraryDayList;
