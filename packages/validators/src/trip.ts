import { z } from 'zod';
import { entrySchema } from './entry';

export const tripSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  thumbnailUrl: z.string(),
  description: z.string().nullable(),
  location: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Trip = z.infer<typeof tripSchema>;

export const tripListItemSchema = tripSchema.extend({
  entryCount: z.number(),
});

export type TripListItem = z.infer<typeof tripListItemSchema>;

export const tripWithEntriesSchema = tripSchema.extend({
  entries: z.array(entrySchema),
});

export type TripWithEntries = z.infer<typeof tripWithEntriesSchema>;

export const listTripsQuerySchema = z.object({
  userId: z.string().uuid(),
});

export const createTripBodySchema = z
  .object({
    title: z.string().min(1),
    thumbnailUrl: z.string().url(),
    description: z.string().min(1).max(500).optional(),
    location: z.string().min(1),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'endDate must be or after startDate',
    path: ['endDate'],
  });

export type CreateTripBody = z.infer<typeof createTripBodySchema>;

const moodSchema = z.enum([
  'calm',
  'curious',
  'energized',
  'romantic',
  'restorative',
]);

const paceSchema = z.enum(['slow', 'balanced', 'packed']);

const budgetSchema = z.enum(['budget', 'moderate', 'premium', 'luxury']);

export const planTripBodySchema = z
  .object({
    destination: z.string().min(1).max(120),
    mood: moodSchema,
    pace: paceSchema,
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    budget: budgetSchema,
    travelers: z.coerce.number().int().min(1).max(12),
    interests: z.array(z.string().min(1).max(60)).min(1).max(8),
    constraints: z.string().max(500).optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'endDate must be or after startDate',
    path: ['endDate'],
  });

export type PlanTripBody = z.infer<typeof planTripBodySchema>;

const plannedTripBaseSchema = z.object({
  title: z.string().min(1).max(120),
  location: z.string().min(1).max(120),
  summary: z.string().min(1).max(700),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

const withValidTripDates = <T extends z.ZodTypeAny>(schema: T) =>
  schema.refine(
    (data: z.infer<typeof plannedTripBaseSchema>) =>
      data.endDate >= data.startDate,
    {
      message: 'endDate must be or after startDate',
      path: ['endDate'],
    },
  );

export const plannedTripItemDraftSchema = z.object({
  timeOfDay: z.enum(['morning', 'afternoon', 'evening']),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  location: z.string().min(1).max(120),
  placeName: z.string().min(1).max(120),
  // Approximate coordinates the AI believes the place sits at. Used to
  // disambiguate geocoding candidates and as a fallback — never trusted as the
  // final pin on their own. Optional because the model may omit them.
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export const plannedTripDayDraftSchema = z.object({
  dayLabel: z.string().min(1).max(80),
  theme: z.string().min(1).max(120),
  items: z.array(plannedTripItemDraftSchema).min(1).max(3),
});

export const plannedTripDraftSchema = withValidTripDates(
  plannedTripBaseSchema.extend({
    days: z.array(plannedTripDayDraftSchema).min(1).max(14),
  }),
);

export const itineraryImageSchema = z.object({
  url: z.string().url(),
  // Where the photo came from, for the required attribution link.
  attribution: z.string().min(1),
  attributionUrl: z.string().url(),
});

export type ItineraryImage = z.infer<typeof itineraryImageSchema>;

export const plannedTripItemSchema = plannedTripItemDraftSchema.extend({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  // Optional — not every place has a usable photo.
  image: itineraryImageSchema.optional(),
});

export const plannedTripDaySchema = z.object({
  dayLabel: z.string().min(1).max(80),
  theme: z.string().min(1).max(120),
  items: z.array(plannedTripItemSchema).min(1).max(3),
});

export const plannedTripSchema = withValidTripDates(
  plannedTripBaseSchema.extend({
    center: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
    days: z.array(plannedTripDaySchema).min(1).max(14),
  }),
);

export type PlannedTripItemDraft = z.infer<typeof plannedTripItemDraftSchema>;
export type PlannedTripDayDraft = z.infer<typeof plannedTripDayDraftSchema>;
export type PlannedTripDraft = z.infer<typeof plannedTripDraftSchema>;
export type PlannedTripItem = z.infer<typeof plannedTripItemSchema>;
export type PlannedTripDay = z.infer<typeof plannedTripDaySchema>;
export type PlannedTrip = z.infer<typeof plannedTripSchema>;

export const itineraryMapStyleSchema = z
  .object({
    version: z.number(),
    sources: z.record(z.unknown()),
    layers: z.array(z.record(z.unknown())),
    glyphs: z.string().optional(),
    sprite: z.string().optional(),
  })
  // Preserve any other top-level style keys (e.g. metadata, bearing) untouched.
  .passthrough();

export type ItineraryMapStyle = z.infer<typeof itineraryMapStyleSchema>;

export const planTripResponseSchema = z.object({
  trip: plannedTripSchema,
  mapStyle: itineraryMapStyleSchema,
});

export type PlanTripResponse = z.infer<typeof planTripResponseSchema>;
