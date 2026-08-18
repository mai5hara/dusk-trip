import type {
  ItineraryPlan,
  ItineraryPlanDay,
  ItineraryPlanItem,
} from '@mood-trip/validators';

export type ItineraryStop = ItineraryPlanItem & {
  id: string;
  dayLabel: string;
  theme: string;
};

export function getItineraryStopId(
  dayLabel: string,
  timeOfDay: ItineraryPlanItem['timeOfDay'],
): string {
  return `${dayLabel}-${timeOfDay}`;
}

export function flattenItinerary(plan: ItineraryPlan): ItineraryStop[] {
  return plan.days.flatMap((day: ItineraryPlanDay) =>
    day.items.map((item: ItineraryPlanItem) => ({
      id: getItineraryStopId(day.dayLabel, item.timeOfDay),
      dayLabel: day.dayLabel,
      theme: day.theme,
      ...item,
    })),
  );
}
