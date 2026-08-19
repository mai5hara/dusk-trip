import type {
  GenerateItineraryBody,
  ItineraryPlanDraft,
} from '@mood-trip/validators';

export const ITINERARY_PLANNER = Symbol('ITINERARY_PLANNER');

export interface ItineraryPlanner {
  generateItinerary(body: GenerateItineraryBody): Promise<ItineraryPlanDraft>;
}
