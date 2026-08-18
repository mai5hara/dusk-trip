import { z } from 'zod';
import {
  itineraryMapStyleSchema,
  moodSchema,
  plannedTripSchema,
} from './trip';

export const itineraryListItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  location: z.string(),
  summary: z.string(),
  thumbnailUrl: z.string().url().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  mood: moodSchema,
  dayCount: z.number().int().min(1),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ItineraryListItem = z.infer<typeof itineraryListItemSchema>;

export const createItineraryBodySchema = z.object({
  plan: plannedTripSchema,
  mood: moodSchema,
});

export type CreateItineraryBody = z.infer<typeof createItineraryBodySchema>;

export const itineraryDetailSchema = itineraryListItemSchema.extend({
  plan: plannedTripSchema,
  mapStyle: itineraryMapStyleSchema,
});

export type ItineraryDetail = z.infer<typeof itineraryDetailSchema>;
