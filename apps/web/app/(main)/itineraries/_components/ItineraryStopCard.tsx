'use client';

import type { KeyboardEvent, MouseEvent } from 'react';
import { MapPinIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardMedia,
  CardTitle,
} from '@mood-trip/ui';
import type { ItineraryPlanItem } from '@mood-trip/validators';

type ItineraryStopCardProps = {
  item: ItineraryPlanItem;
  stopId: string;
  isActive: boolean;
  onClick: (stopId: string) => void;
  onLocationClick: (stopId: string) => void;
};

const ItineraryStopCard = ({
  item,
  stopId,
  isActive,
  onClick,
  onLocationClick,
}: ItineraryStopCardProps) => {
  const selectStop = (): void => {
    onClick(stopId);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    selectStop();
  };

  const handleLocationClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    onLocationClick(stopId);
  };

  return (
    <div data-stop-id={stopId} className="w-full">
      <Card
        variant={isActive ? 'raised' : 'flat'}
        size="sm"
        role="button"
        tabIndex={0}
        aria-pressed={isActive}
        aria-label={item.title}
        onClick={selectStop}
        onKeyDown={handleCardKeyDown}
      >
        {item.image ? (
          <CardMedia>
            <figure className="relative m-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image.url}
                alt={item.placeName}
                loading="lazy"
                className="h-36 w-full object-cover"
              />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/55 to-transparent" />
              <figcaption className="absolute bottom-1.5 right-2 text-[10px] font-medium leading-none text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {item.image.attribution} · Wikipedia
              </figcaption>
            </figure>
          </CardMedia>
        ) : null}
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.2em] opacity-60">
            {item.timeOfDay}
          </p>
          <CardTitle as="h4">{item.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed opacity-75">
            {item.description}
          </p>
        </CardContent>
        <CardFooter>
          <button
            type="button"
            className="flex items-center gap-1.5 text-xs opacity-60 hover:opacity-100"
            aria-label={`Show ${item.placeName} on map`}
            onClick={handleLocationClick}
          >
            <MapPinIcon className="size-3.5" />
            {item.placeName}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ItineraryStopCard;
