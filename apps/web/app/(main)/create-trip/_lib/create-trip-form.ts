import {
  z,
  createTripBodySchema,
  createEntryBodySchema,
} from '@mood-trip/validators';

export const dayEntryFormSchema = z.object({
  clientId: z.string(),
  id: z.string().optional(),
  dateKey: z.string(),
  dayLabel: z.string(),
  timeOfDay: z.enum(['MORNING', 'AFTERNOON', 'EVENING']),
  sortOrder: z.number().int(),
  photoUrl: z.string(),
  caption: z.string().optional(),
  location: z.string().optional(),
});

export const entryFormSchema = z
  .object({
    tripId: z.string(),
    entries: z.array(dayEntryFormSchema),
    newTrip: createTripBodySchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.tripId) {
      const result = createTripBodySchema.safeParse(data.newTrip);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({
            ...issue,
            path: ['newTrip', ...issue.path],
          });
        });
      }
    }

    data.entries.forEach((entry, index) => {
      if (!entry.photoUrl) return;
      const result = createEntryBodySchema.safeParse({
        photoUrl: entry.photoUrl,
        caption: entry.caption || undefined,
        location: entry.location || undefined,
        dayLabel: entry.dateKey,
        timeOfDay: entry.timeOfDay,
        sortOrder: entry.sortOrder,
      });
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          ctx.addIssue({
            ...issue,
            path: ['entries', index, ...issue.path],
          });
        });
      }
    });
  });

export type DayEntryFormValue = z.infer<typeof dayEntryFormSchema>;
export type EntryFormValues = z.infer<typeof entryFormSchema>;

export function toDate(value: Date | string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
