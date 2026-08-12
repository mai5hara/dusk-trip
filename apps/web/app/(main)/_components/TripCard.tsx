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

const TripCard = ({ trip }: { trip: TripListItem }) => {
  return (
    <Link href={`/trips/${trip.id}`}>
      <Card variant="raised" size="sm">
        <CardMedia>
          <Image
            src={trip.thumbnailUrl}
            alt={trip.title}
            width={400}
            height={300}
          />
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
            <div className="flex items-center gap-2 text-sm justify-between">
              {trip.entryCount} Memories
              <ArrowRightIcon className="size-4 text-accent" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TripCard;
