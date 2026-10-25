import { z } from 'zod';

export const ENTRY_TIME_OF_DAY_VALUES = [
  'morning',
  'afternoon',
  'evening',
  'night',
] as const;

export const entryTimeOfDaySchema = z.enum(ENTRY_TIME_OF_DAY_VALUES);

export type EntryTimeOfDay = z.infer<typeof entryTimeOfDaySchema>;

/** Untagged memories sort after night. */
export function entryTimeOfDayRank(
  timeOfDay: EntryTimeOfDay | null | undefined,
): number {
  if (timeOfDay == null) {
    return ENTRY_TIME_OF_DAY_VALUES.length;
  }

  return ENTRY_TIME_OF_DAY_VALUES.indexOf(timeOfDay);
}

export const entrySchema = z.object({
  id: z.string(),
  tripId: z.string(),
  photoUrl: z.string(),
  caption: z.string().nullable(),
  location: z.string().nullable(),
  dayLabel: z.string().nullable(),
  timeOfDay: entryTimeOfDaySchema.nullable(),
  sortOrder: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Entry = z.infer<typeof entrySchema>;

export const createEntryBodySchema = z.object({
  photoUrl: z.string({ required_error: 'Add a photo' }).url('Add a photo'),
  caption: z
    .string()
    .max(300, 'Keep the caption to 300 characters or fewer')
    .optional(),
  location: z.string().optional(),
  dayLabel: z.string().max(300).optional(),
  timeOfDay: entryTimeOfDaySchema.optional(),
  sortOrder: z.number().int().optional(),
});

export type CreateEntryBody = z.infer<typeof createEntryBodySchema>;

/** Max days for a single batch create (about two months). */
export const CREATE_ENTRIES_BATCH_MAX = 62;

export const createEntriesBatchBodySchema = z.object({
  entries: z.array(createEntryBodySchema).min(1).max(CREATE_ENTRIES_BATCH_MAX),
});

export type CreateEntriesBatchBody = z.infer<
  typeof createEntriesBatchBodySchema
>;

export const updateEntryBodySchema = createEntryBodySchema.extend({
  id: z.string().min(1),
});

export type UpdateEntryBody = z.infer<typeof updateEntryBodySchema>;

export const updateEntriesBatchBodySchema = z.object({
  entries: z.array(updateEntryBodySchema).min(1).max(CREATE_ENTRIES_BATCH_MAX),
});

export type UpdateEntriesBatchBody = z.infer<
  typeof updateEntriesBatchBodySchema
>;
