import type {
  PlannedTrip,
  PlannedTripDay,
  PlannedTripItem,
} from '@mood-trip/validators';

export type ItineraryStop = PlannedTripItem & {
  id: string;
  dayLabel: string;
  theme: string;
};

export function getItineraryStopId(
  dayLabel: string,
  timeOfDay: PlannedTripItem['timeOfDay'],
): string {
  return `${dayLabel}-${timeOfDay}`;
}

export function flattenItinerary(trip: PlannedTrip): ItineraryStop[] {
  return trip.days.flatMap((day: PlannedTripDay) =>
    day.items.map((item: PlannedTripItem) => ({
      id: getItineraryStopId(day.dayLabel, item.timeOfDay),
      dayLabel: day.dayLabel,
      theme: day.theme,
      ...item,
    })),
  );
}
