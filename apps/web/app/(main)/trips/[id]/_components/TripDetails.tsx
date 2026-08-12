'use client';

import Image from 'next/image';
import { useTripQuery } from '../_hooks/useTripQuery';
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
import { groupEntriesByDay } from '../_lib/group-entries-by-day';

const TripDetails = ({ tripId }: { tripId: string }) => {
  const { data: trip, isLoading, isError } = useTripQuery(tripId);

  if (!trip) {
    return <div>Trip not found</div>;
  }

  const dayGroups = groupEntriesByDay(trip.entries, trip.startDate);
  console.log(dayGroups);

  return (
    <section className="flex flex-col gap-5 max-2-[1248px]">
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error loading trip</div>}
      <Link className="font-mono flex gap-3 items-center" href="/">
        <ArrowLeftIcon className="size-4" />
        Back to album list
      </Link>
      <div className="tokonoma-raised-panel flex flex-col gap-12 rounded-2xl p-6">
        <div className="flex flex-row gap-14 w-full">
          <Image
            className="max-w-116.25 max-h-78.75 object-cover rounded-xl"
            src={trip.thumbnailUrl}
            alt={trip.title}
            width={400}
            height={300}
          />
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-2">
              <h1 className="font-mono text-3xl font-medium">{trip.title}</h1>
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
            <div className="flex flex-col gap-4">
              <ButtonLink variant="flat" href="" rounded="full">
                Edit
                <PenIcon className="size-4" />
              </ButtonLink>
              <Button variant="accent" rounded="full">
                View Slideshow
                <TriangleIcon className="size-4 rotate-90" />
              </Button>
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
                    <div key={entry.id} className="flex flex-col gap-2">
                      <Image
                        className="aspect-square rounded-xl object-cover"
                        src={entry.photoUrl}
                        alt={entry.caption ?? 'Trip entry photo'}
                        width={400}
                        height={400}
                      />
                      {entry.caption ? (
                        <p className="text-sm">{entry.caption}</p>
                      ) : null}
                      {entry.location ? (
                        <p className="text-xs opacity-70">{entry.location}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default TripDetails;
