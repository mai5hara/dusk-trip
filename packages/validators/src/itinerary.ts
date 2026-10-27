import { z } from 'zod';
import { destinationPlaceSchema } from './geocoding';

export const moodSchema = z.enum([
  'calm',
  'curious',
  'energized',
  'romantic',
  'restorative',
]);

const paceSchema = z.enum(['slow', 'balanced', 'packed']);

const budgetSchema = z.enum(['budget', 'moderate', 'premium', 'luxury']);

export const generateItineraryBodySchema = z
  .object({
    destination: z.string().min(1).max(120),
    // Optional until the destination autocomplete UI (#41) ships; when absent
    // the API falls back to MapTiler area geocoding on the free-text destination.
    destinationPlace: destinationPlaceSchema.optional(),
    mood: moodSchema,
    pace: paceSchema,
    startDate: z.coerce.date<Date>(),
    endDate: z.coerce.date<Date>(),
    budget: budgetSchema,
    travelers: z.coerce.number<number>().int().min(1).max(12),
    interests: z.array(z.string().min(1).max(60)).min(1).max(8),
    constraints: z.string().max(500).optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after the start date',
    path: ['endDate'],
  });

export type GenerateItineraryBody = z.infer<typeof generateItineraryBodySchema>;

const itineraryPlanBaseSchema = z.object({
  title: z.string().min(1).max(120),
  location: z.string().min(1).max(120),
  summary: z.string().min(1).max(700),
  startDate: z.coerce.date<Date>(),
  endDate: z.coerce.date<Date>(),
});

const withValidItineraryDates = <
  T extends z.ZodType<{ startDate: Date; endDate: Date }>,
>(
  schema: T,
) =>
  schema.refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after the start date',
    path: ['endDate'],
  });

export const itineraryPlanItemDraftSchema = z.object({
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

export const itineraryPlanDayDraftSchema = z.object({
  dayLabel: z.string().min(1).max(80),
  theme: z.string().min(1).max(120),
  items: z.array(itineraryPlanItemDraftSchema).min(1).max(3),
});

export const itineraryPlanDraftSchema = withValidItineraryDates(
  itineraryPlanBaseSchema.extend({
    days: z.array(itineraryPlanDayDraftSchema).min(1).max(14),
  }),
);

export const itineraryImageSchema = z.object({
  url: z.string().url(),
  // Where the photo came from, for the required attribution link.
  attribution: z.string().min(1),
  attributionUrl: z.string().url(),
});

export type ItineraryImage = z.infer<typeof itineraryImageSchema>;

export const itineraryPlanItemSchema = itineraryPlanItemDraftSchema.extend({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  // Optional — not every place has a usable photo.
  image: itineraryImageSchema.optional(),
});

export const itineraryPlanDaySchema = z.object({
  dayLabel: z.string().min(1).max(80),
  theme: z.string().min(1).max(120),
  items: z.array(itineraryPlanItemSchema).min(1).max(3),
});

export const itineraryPlanSchema = withValidItineraryDates(
  itineraryPlanBaseSchema.extend({
    center: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
    days: z.array(itineraryPlanDaySchema).min(1).max(14),
  }),
);

export type ItineraryPlanItemDraft = z.infer<
  typeof itineraryPlanItemDraftSchema
>;
export type ItineraryPlanDayDraft = z.infer<typeof itineraryPlanDayDraftSchema>;
export type ItineraryPlanDraft = z.infer<typeof itineraryPlanDraftSchema>;
export type ItineraryPlanItem = z.infer<typeof itineraryPlanItemSchema>;
export type ItineraryPlanDay = z.infer<typeof itineraryPlanDaySchema>;
export type ItineraryPlan = z.infer<typeof itineraryPlanSchema>;

export const itineraryMapStyleSchema = z
  .object({
    version: z.number(),
    sources: z.record(z.string(), z.unknown()),
    layers: z.array(z.record(z.string(), z.unknown())),
    glyphs: z.string().optional(),
    sprite: z.string().optional(),
  })
  // Preserve any other top-level style keys (e.g. metadata, bearing) untouched.
  .passthrough();

export type ItineraryMapStyle = z.infer<typeof itineraryMapStyleSchema>;

export const generateItineraryResponseSchema = z.object({
  plan: itineraryPlanSchema,
  mapStyle: itineraryMapStyleSchema,
});

export type GenerateItineraryResponse = z.infer<
  typeof generateItineraryResponseSchema
>;

export const itineraryListItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  location: z.string(),
  summary: z.string(),
  thumbnailUrl: z.string().url().nullable(),
  startDate: z.coerce.date<Date>(),
  endDate: z.coerce.date<Date>(),
  mood: moodSchema,
  dayCount: z.number().int().min(1),
  createdAt: z.coerce.date<Date>(),
  updatedAt: z.coerce.date<Date>(),
});

export type ItineraryListItem = z.infer<typeof itineraryListItemSchema>;

export const createItineraryBodySchema = z.object({
  plan: itineraryPlanSchema,
  mood: moodSchema,
});

export type CreateItineraryBody = z.infer<typeof createItineraryBodySchema>;

export const itineraryDetailSchema = itineraryListItemSchema.extend({
  plan: itineraryPlanSchema,
  mapStyle: itineraryMapStyleSchema,
});

export type ItineraryDetail = z.infer<typeof itineraryDetailSchema>;
