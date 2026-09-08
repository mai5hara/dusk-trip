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

const tripBodyFieldsSchema = z.object({
  title: z.string().min(1),
  thumbnailUrl: z.string().url(),
  description: z.string().max(500).optional(),
  location: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});

function _endDateOnOrAfterStartDate(data: {
  startDate?: Date;
  endDate?: Date;
}): boolean {
  if (data.startDate && data.endDate) {
    return data.endDate >= data.startDate;
  }
  return true;
}

export const createTripBodySchema = tripBodyFieldsSchema.refine(
  _endDateOnOrAfterStartDate,
  {
    message: 'endDate must be or after startDate',
    path: ['endDate'],
  },
);

export type CreateTripBody = z.infer<typeof createTripBodySchema>;

export const updateTripBodySchema = tripBodyFieldsSchema
  .partial()
  .refine(_endDateOnOrAfterStartDate, {
    message: 'endDate must be or after startDate',
    path: ['endDate'],
  });

export type UpdateTripBody = z.infer<typeof updateTripBodySchema>;
