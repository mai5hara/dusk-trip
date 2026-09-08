import {
  z,
  createTripBodySchema,
  createEntryBodySchema,
  entryTimeOfDaySchema,
} from '@mood-trip/validators';

export const dayEntryFormSchema = z.object({
  id: z.string().optional(),
  dateKey: z.string(),
  dayLabel: z.string(),
  sortOrder: z.number().int(),
  photoUrl: z.string(),
  caption: z.string().optional(),
  location: z.string().optional(),
  timeOfDay: entryTimeOfDaySchema.optional(),
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

/**
 * Calendar dates from the API arrive as UTC midnight ISO strings.
 * Parse the YYYY-MM-DD prefix as a local date so the picker matches
 * formatDateRange (which uses UTC date parts).
 */
export function toDate(value: Date | string | undefined): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateOnly) {
    const date = new Date(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3]),
    );
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
