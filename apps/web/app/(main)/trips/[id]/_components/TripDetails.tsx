'use client';

import Image from 'next/image';
import { useTripQuery } from '@/app/(main)/_hooks/useTripQuery';
import { formatDateRange } from '@/lib/format-date';
import {
  MapPinIcon,
  CalendarIcon,
  PenIcon,
  TriangleIcon,
  ArrowLeftIcon,
} from 'lucide-react';
import { Button, ButtonLink } from '@mood-trip/ui';
import Link from 'next/link';
import {
  formatTimeOfDay,
  groupEntriesByDay,
} from '../_lib/group-entries-by-day';

const TripDetails = ({ tripId }: { tripId: string }) => {
  const { data: trip, isLoading, isError } = useTripQuery(tripId);

  if (isLoading) {
    return <section>Loading...</section>;
  }

  if (isError || !trip) {
    return <section>Trip not found</section>;
  }

  const dayGroups = groupEntriesByDay(trip.entries, trip.startDate);

  return (
    <section className="mx-auto flex w-full max-w-312 flex-col gap-5">
      <Link
        className="font-mono flex gap-3 items-center hover:opacity-70 w-fit transition-opacity"
        href="/"
      >
        <ArrowLeftIcon className="size-4" />
        Back to album
      </Link>
      <div className="tokonoma-raised-panel flex flex-col gap-12 rounded-2xl p-10 items-center">
        <div className="flex w-full flex-row items-start gap-10">
          <Image
            className="w-1/2 max-w-140 shrink-0 aspect-4/3 rounded-xl object-cover"
            src={trip.thumbnailUrl}
            alt={trip.title}
            width={560}
            height={420}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-12 pt-1">
            <div className="flex flex-col gap-4">
              <h1 className="font-mono text-4xl font-medium">{trip.title}</h1>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="size-4" />
                    {trip.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="size-4" />
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    {trip.entries.length} Memories
                  </div>
                </div>
                {trip.description && (
                  <p className="line-clamp-2">{trip.description}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="w-full md:max-w-50">
                <ButtonLink variant="flat" href="" rounded="full" width="full">
                  Edit
                  <PenIcon className="size-4" />
                </ButtonLink>
              </div>
              <div className="w-full md:max-w-50">
                <Button variant="accent" rounded="full" width="full">
                  View Slideshow
                  <TriangleIcon className="size-4 rotate-90" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-10">
          {dayGroups.length === 0 ? (
            <p className="text-sm opacity-70">No memories saved yet.</p>
          ) : (
            dayGroups.map((day) => (
              <div key={day.key} className="flex flex-col gap-4">
                <h2 className="font-mono text-lg font-medium">{day.heading}</h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {day.entries.map((entry) => (
                    <div key={entry.id} className="flex flex-col gap-3">
                      <Image
                        className="aspect-square rounded-xl object-cover"
                        src={entry.photoUrl}
                        alt={entry.caption ?? 'Trip entry photo'}
                        width={400}
                        height={400}
                      />
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-medium uppercase tracking-wide opacity-60">
                          {formatTimeOfDay(entry.timeOfDay)}
                        </p>
                        {entry.caption && (
                          <p className="line-clamp-2 text-sm">
                            {entry.caption}
                          </p>
                        )}
                        {entry.location && (
                          <div className="flex items-center gap-2 text-xs">
                            <MapPinIcon className="size-4" />
                            {entry.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="max-w-62.5 w-full">
          <ButtonLink variant="flat" href="/" rounded="full" width="full">
            Back to album
          </ButtonLink>
        </div>
      </div>
    </section>
  );
};

export default TripDetails;
