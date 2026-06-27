import { z } from 'zod';

export const entrySchema = z.object({
  id: z.string(),
  tripId: z.string(),
  photoUrl: z.string(),
  caption: z.string().nullable(),
  location: z.string().nullable(),
  dayLabel: z.string().nullable(),
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
  sortOrder: z.number().int().optional(),
});

export type CreateEntryBody = z.infer<typeof createEntryBodySchema>;
