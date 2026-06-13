import { z } from 'zod';
import { entrySchema } from './entry';

export const tripSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  thumbnailUrl: z.string(),
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

export type ListTripsQuery = z.infer<typeof listTripsQuerySchema>;
