'use client';

import { useEffect } from 'react';
import {
  z,
  createTripBodySchema,
  createEntryBodySchema,
} from '@mood-trip/validators';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm,
  Controller,
  type FieldValues,
  type UseFormRegister,
} from 'react-hook-form';
import {
  Button,
  Input,
  Label,
  Select,
  RadioGroup,
  Radio,
  Field,
  PhotoUpload,
  DateRangePicker,
} from '@mood-trip/ui';
import { useCreateTripMutation } from '../_hooks/useTripMutation';
import { useCreateEntryMutation } from '../_hooks/useEntryMutation';
import { useTripQuery } from '../_hooks/useTripQuery';
import { useTripsQuery } from '@/app/(main)/_hooks/useTripsQuery';
import { buildDayEntries } from '../_lib/travel-period';
import MemoriesByMonth from './MemoriesByMonth';

const albumModeSchema = z.enum(['new', 'existing']);

const dayEntryFormSchema = z.object({
  id: z.string().optional(),
  dateKey: z.string(),
  dayLabel: z.string(),
  sortOrder: z.number().int(),
  photoUrl: z.string(),
  caption: z.string().optional(),
  location: z.string().optional(),
});

const entryFormSchema = z
  .object({
    albumMode: albumModeSchema,
    tripId: z.string(),
    entries: z.array(dayEntryFormSchema),
    newTrip: createTripBodySchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.albumMode === 'existing' && !data.tripId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Select a trip',
        path: ['tripId'],
      });
    }

    if (data.albumMode === 'new') {
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

type EntryFormValues = z.infer<typeof entryFormSchema>;

function toDate(value: Date | string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

const CreateTrip = () => {
  const router = useRouter();
  const { mutateAsync: createTripAsync, isPending: isCreatingTrip } =
    useCreateTripMutation();
  const { mutateAsync: createEntryAsync, isPending: isCreatingEntry } =
    useCreateEntryMutation();
  const { data: trips = [], isLoading: isTripsLoading } = useTripsQuery();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: {
      albumMode: 'new',
      tripId: '',
      entries: [],
      newTrip: {
        title: '',
        thumbnailUrl: '',
        location: '',
        startDate: undefined,
        endDate: undefined,
      },
    },
  });

  const albumMode = watch('albumMode');
  const tripId = watch('tripId');
  const travelStartDate = watch('newTrip.startDate');
  const travelEndDate = watch('newTrip.endDate');
  const entries = watch('entries');
  const isNewTrip = albumMode === 'new';

  const { data: selectedTrip, isLoading: isTripLoading } = useTripQuery(
    isNewTrip ? undefined : tripId || undefined,
  );

  useEffect(() => {
    const start = isNewTrip
      ? toDate(travelStartDate)
      : toDate(selectedTrip?.startDate);
    const end = isNewTrip
      ? toDate(travelEndDate)
      : toDate(selectedTrip?.endDate);

    if (!start || !end) {
      setValue('entries', []);
      return;
    }

    // New album: keep in-progress day inputs across period tweaks.
    // Existing album: rebuild from the selected trip's memories.
    const previous = isNewTrip ? getValues('entries') : [];
    const next = buildDayEntries(
      start,
      end,
      previous,
      selectedTrip?.entries ?? [],
    );
    setValue('entries', next);
  }, [
    isNewTrip,
    travelStartDate,
    travelEndDate,
    selectedTrip?.id,
    selectedTrip?.startDate,
    selectedTrip?.endDate,
    selectedTrip?.entries,
    getValues,
    setValue,
  ]);

  const onSubmit = async (values: EntryFormValues) => {
    try {
      let resolvedTripId = values.tripId;

      if (values.albumMode === 'new') {
        const createdTrip = await createTripAsync(values.newTrip!);
        resolvedTripId = createdTrip.id;
      }

      const entriesToCreate = values.entries.filter(
        (entry) => !entry.id && entry.photoUrl.trim().length > 0,
      );

      await Promise.all(
        entriesToCreate.map((entry) =>
          createEntryAsync({
            tripId: resolvedTripId,
            body: {
              photoUrl: entry.photoUrl,
              caption: entry.caption || undefined,
              location: entry.location || undefined,
              dayLabel: entry.dateKey,
              sortOrder: entry.sortOrder,
            },
          }),
        ),
      );

      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };

  const isSaving = isSubmitting || isCreatingTrip || isCreatingEntry;
  const showMemories =
    entries.length > 0 ||
    (isNewTrip
      ? Boolean(travelStartDate && travelEndDate)
      : Boolean(tripId && (isTripLoading || selectedTrip)));

  return (
    <div className="flex flex-col w-full max-w-225 items-center mx-auto pt-20 pb-40">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-14 w-full items-center"
      >
        <section className="flex flex-col gap-9 w-full">
          <h1 className="text-2xl font-mono font-medium">Add Trip</h1>
          <div className="flex flex-col gap-5">
            <Controller
              name="albumMode"
              control={control}
              render={({ field }) => (
                <div className="max-w-sm">
                  <RadioGroup
                    variant="border"
                    value={field.value}
                    onValueChange={(value: string) => {
                      const mode = albumModeSchema.parse(value);
                      field.onChange(mode);
                      setValue('tripId', '');
                      setValue('entries', []);
                    }}
                  >
                    <Radio value="new">Create new album</Radio>
                    <Radio value="existing">Create from existing album</Radio>
                  </RadioGroup>
                </div>
              )}
            />

            {isNewTrip ? (
              <div className="grid grid-cols-16 gap-4">
                <div className="col-span-7">
                  <Field>
                    <Label htmlFor="newTrip.thumbnailUrl">Thumbnail URL</Label>
                    <PhotoUpload
                      variant="inset"
                      {...register('newTrip.thumbnailUrl')}
                      errorMessage={errors.newTrip?.thumbnailUrl?.message}
                    />
                  </Field>
                </div>

                <div className="col-span-8 flex flex-col gap-3">
                  <Field>
                    <Label htmlFor="newTrip.title">Album Name</Label>
                    <Input
                      type="text"
                      variant="inset"
                      placeholder="Enter album name"
                      {...register('newTrip.title')}
                      errorMessage={errors.newTrip?.title?.message}
                    />
                  </Field>

                  <Field>
                    <Label htmlFor="newTrip.location">Location</Label>
                    <Input
                      type="text"
                      variant="inset"
                      placeholder="Enter location"
                      {...register('newTrip.location')}
                    />
                  </Field>
                  <Field>
                    <Label htmlFor="newTrip.startDate">Travel Period</Label>
                    <Controller
                      name="newTrip.startDate"
                      control={control}
                      render={({ field }) => (
                        <DateRangePicker
                          id="newTrip.startDate"
                          variant="inset"
                          placeholder="Select travel period"
                          value={{
                            from: field.value,
                            to: travelEndDate,
                          }}
                          onValueChange={(range) => {
                            setValue('newTrip.startDate', range?.from, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                            setValue('newTrip.endDate', range?.to, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }}
                          errorMessage={
                            errors.newTrip?.startDate?.message ??
                            errors.newTrip?.endDate?.message
                          }
                        />
                      )}
                    />
                  </Field>
                </div>
              </div>
            ) : (
              <Field>
                <Controller
                  name="tripId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      placeholder="Select album"
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isTripsLoading}
                      options={trips.map((trip) => ({
                        label: trip.title,
                        value: trip.id,
                      }))}
                      errorMessage={errors.tripId?.message}
                    />
                  )}
                />
              </Field>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-9 w-full">
          <h2 className="text-2xl font-mono font-medium">Add Memories</h2>

          {showMemories ? (
            isTripLoading && !isNewTrip ? (
              <p className="text-sm opacity-70">Loading album memories...</p>
            ) : (
              <MemoriesByMonth
                entries={entries}
                register={register as UseFormRegister<FieldValues>}
                errors={errors}
              />
            )
          ) : (
            <p className="text-sm opacity-70">
              {isNewTrip
                ? 'Select a travel period to add memories by day.'
                : 'Select an album to add memories by day.'}
            </p>
          )}
        </section>
        <div className="max-w-62.5 w-full">
          <Button
            type="submit"
            disabled={isSaving}
            variant="accent"
            width="full"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTrip;
