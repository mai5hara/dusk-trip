'use client';

import type { TripListItem } from '@mood-trip/validators';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardMedia,
} from '@mood-trip/ui';
import Image from 'next/image';
import { formatDateRange } from '@/lib/format-date';
import { MapPinIcon, CalendarIcon, ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';
import TripCardMenu from './TripCardMenu';

const TripCard = ({ trip }: { trip: TripListItem }): React.JSX.Element => {
  return (
    <div className="relative">
      <TripCardMenu />
      <Link href={`/trips/${trip.id}`}>
        <Card variant="raised" size="sm">
          <CardMedia>
            {trip.thumbnailUrl ? (
              <Image
                src={trip.thumbnailUrl}
                alt={trip.title}
                width={400}
                height={300}
              />
            ) : (
              <div
                className="aspect-4/3 w-full bg-black/5"
                aria-hidden="true"
              />
            )}
          </CardMedia>
          <CardHeader>
            <CardTitle>{trip.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm">
                <MapPinIcon className="size-4" />
                {trip.location}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="size-4" />
                {formatDateRange(trip.startDate, trip.endDate)}
              </div>
              <div className="flex items-center justify-between gap-2 text-sm">
                {trip.entryCount} Memories
                <ArrowRightIcon className="size-4 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default TripCard;
