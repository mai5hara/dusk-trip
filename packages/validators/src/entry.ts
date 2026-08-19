import { z } from 'zod';

export const memoryTimeOfDaySchema = z.enum([
  'MORNING',
  'AFTERNOON',
  'EVENING',
]);

export type MemoryTimeOfDay = z.infer<typeof memoryTimeOfDaySchema>;

export const entrySchema = z.object({
  id: z.string(),
  tripId: z.string(),
  photoUrl: z.string(),
  caption: z.string().nullable(),
  location: z.string().nullable(),
  dayLabel: z.string().nullable(),
  timeOfDay: memoryTimeOfDaySchema,
  sortOrder: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Entry = z.infer<typeof entrySchema>;

export const createEntryBodySchema = z.object({
  photoUrl: z.string().url(),
  caption: z.string().max(300).optional(),
  location: z.string().optional(),
  dayLabel: z.string().max(300).optional(),
  timeOfDay: memoryTimeOfDaySchema.optional(),
  sortOrder: z.number().int().optional(),
});

export type CreateEntryBody = z.infer<typeof createEntryBodySchema>;

/** Max memories accepted in a single batch request. */
export const CREATE_ENTRIES_BATCH_MAX = 62;

export const createEntriesBatchBodySchema = z.object({
  entries: z.array(createEntryBodySchema).min(1).max(CREATE_ENTRIES_BATCH_MAX),
});

export type CreateEntriesBatchBody = z.infer<
  typeof createEntriesBatchBodySchema
>;
