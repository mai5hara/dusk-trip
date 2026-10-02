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

export const adminTripsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().trim().min(2).max(120).optional(),
});

export type AdminTripsQuery = z.infer<typeof adminTripsQuerySchema>;

export const adminTripListItemSchema = tripSchema.extend({
  owner: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
  }),
  startDate: z.string(),
  endDate: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  entryCount: z.number(),
});

export type AdminTripListItem = z.infer<typeof adminTripListItemSchema>;

export const adminTripsSchema = z.object({
  trips: z.array(adminTripListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type AdminTrips = z.infer<typeof adminTripsSchema>;

export const adminTripDetailsSchema = adminTripListItemSchema.extend({
  entries: z.array(
    entrySchema.extend({
      createdAt: z.string(),
      updatedAt: z.string(),
    }),
  ),
});

export type AdminTripDetails = z.infer<typeof adminTripDetailsSchema>;
