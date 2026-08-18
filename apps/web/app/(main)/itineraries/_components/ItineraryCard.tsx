'use client';

import type { ItineraryListItem } from '@mood-trip/validators';
import {
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  CardTitle,
} from '@mood-trip/ui';
import Image from 'next/image';
import Link from 'next/link';
import { formatDateRange } from '@/lib/format-date';
import { ArrowRightIcon, CalendarIcon, MapPinIcon } from 'lucide-react';

const ItineraryCard = ({ itinerary }: { itinerary: ItineraryListItem }) => {
  const dayLabel =
    itinerary.dayCount === 1 ? '1 day' : `${itinerary.dayCount} days`;

  return (
    <Link href={`/itineraries/${itinerary.id}`}>
      <Card variant="raised" size="sm">
        <CardMedia>
          {itinerary.thumbnailUrl ? (
            <Image
              src={itinerary.thumbnailUrl}
              alt={itinerary.title}
              width={400}
              height={300}
            />
          ) : (
            <div className="aspect-4/3 w-full bg-black/5" aria-hidden="true" />
          )}
        </CardMedia>
        <CardHeader>
          <CardTitle>{itinerary.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm">
              <MapPinIcon className="size-4" />
              {itinerary.location}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="size-4" />
              {formatDateRange(itinerary.startDate, itinerary.endDate)}
            </div>
            <div className="flex items-center justify-between gap-2 text-sm">
              {dayLabel}
              <ArrowRightIcon className="size-4 text-accent" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ItineraryCard;
