'use client';

import { useEffect, useState } from 'react';
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
  type Control,
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
  DateRangePicker,
} from '@mood-trip/ui';
import { useCreateTripMutation } from '../_hooks/useTripMutation';
import { useCreateEntryMutation } from '../_hooks/useEntryMutation';
import { useTripQuery } from '../_hooks/useTripQuery';
import { useTripsQuery } from '@/app/(main)/_hooks/useTripsQuery';
import { buildDayEntries } from '../_lib/travel-period';
import MemoriesByMonth from './MemoriesByMonth';
import PhotoUrlField from './PhotoUrlField';

const albumModeSchema = z.enum(['new', 'existing']);
type Step = 1 | 2;

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

    if (data.albumMode === 'new' && !data.tripId) {
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
  const [step, setStep] = useState<Step>(1);
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
    trigger,
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
  const hasCreatedOrSelectedAlbum = Boolean(tripId);

  const { data: selectedTrip, isLoading: isTripLoading } = useTripQuery(
    tripId || undefined,
  );

  useEffect(() => {
    const start = toDate(selectedTrip?.startDate) ?? toDate(travelStartDate);
    const end = toDate(selectedTrip?.endDate) ?? toDate(travelEndDate);

    if (!start || !end) {
      setValue('entries', []);
      return;
    }

    const previous = getValues('entries');
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

  const ensureAlbumExists = async (values: EntryFormValues) => {
    if (values.tripId) {
      return values.tripId;
    }

    if (values.albumMode !== 'new' || !values.newTrip) {
      throw new Error('Album is required');
    }

    const createdTrip = await createTripAsync(values.newTrip);
    setValue('tripId', createdTrip.id);
    return createdTrip.id;
  };

  const validateAlbumStep = async () => {
    if (isNewTrip) {
      return trigger([
        'newTrip',
        'newTrip.title',
        'newTrip.thumbnailUrl',
        'newTrip.location',
        'newTrip.startDate',
        'newTrip.endDate',
      ]);
    }
    return trigger('tripId');
  };

  const saveAlbumOnly = async () => {
    const isValid = await validateAlbumStep();
    if (!isValid) return;

    try {
      const values = getValues();
      if (values.albumMode === 'existing') {
        router.push('/');
        return;
      }
      await ensureAlbumExists(values);
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };

  const continueToMemories = async () => {
    const isValid = await validateAlbumStep();
    if (!isValid) return;

    try {
      await ensureAlbumExists(getValues());
      setStep(2);
    } catch (error) {
      console.error(error);
    }
  };

  const saveMemories = handleSubmit(async (values) => {
    try {
      const resolvedTripId = await ensureAlbumExists(values);
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
  });

  const isSaving = isSubmitting || isCreatingTrip || isCreatingEntry;
  const showMemories =
    entries.length > 0 ||
    Boolean(tripId && (isTripLoading || selectedTrip)) ||
    Boolean(travelStartDate && travelEndDate);

  return (
    <div className="mx-auto flex w-full max-w-225 flex-col items-center pt-20 pb-40">
      <div className="flex w-full flex-col items-center gap-14">
        <p className="text-sm opacity-70">
          Step {step} of 2 · {step === 1 ? 'Album' : 'Memories'}
        </p>

        {step === 1 ? (
          <section className="flex w-full flex-col gap-9">
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
                        if (hasCreatedOrSelectedAlbum && isNewTrip) return;
                        const mode = albumModeSchema.parse(value);
                        field.onChange(mode);
                        setValue('tripId', '');
                        setValue('entries', []);
                      }}
                    >
                      <Radio value="new" disabled={hasCreatedOrSelectedAlbum}>
                        Create new album
                      </Radio>
                      <Radio
                        value="existing"
                        disabled={hasCreatedOrSelectedAlbum && isNewTrip}
                      >
                        Create from existing album
                      </Radio>
                    </RadioGroup>
                  </div>
                )}
              />

              {isNewTrip ? (
                <div className="grid grid-cols-16 gap-4">
                  <div className="col-span-7">
                    <Field>
                      <Label htmlFor="newTrip.thumbnailUrl">Thumbnail</Label>
                      <Controller
                        name="newTrip.thumbnailUrl"
                        control={control}
                        render={({ field }) => (
                          <PhotoUrlField
                            id="newTrip.thumbnailUrl"
                            variant="inset"
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            errorMessage={errors.newTrip?.thumbnailUrl?.message}
                          />
                        )}
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
                        onValueChange={(value: string) => {
                          field.onChange(value);
                          setValue('entries', []);
                        }}
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

            <div className="flex max-w-125 flex-col gap-3 self-center sm:flex-row">
              {isNewTrip ? (
                <Button
                  type="button"
                  variant="border"
                  disabled={isSaving}
                  onClick={saveAlbumOnly}
                >
                  {isSaving ? 'Saving...' : 'Create album only'}
                </Button>
              ) : null}
              <Button
                type="button"
                variant="accent"
                disabled={isSaving}
                onClick={continueToMemories}
              >
                {isSaving ? 'Saving...' : 'Continue to memories'}
              </Button>
            </div>
          </section>
        ) : (
          <section className="flex w-full flex-col gap-9">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-mono font-medium">Add Memories</h2>
              <p className="text-sm opacity-70">
                Memories are optional. Add photos by day, or finish without
                saving any.
              </p>
            </div>

            {showMemories ? (
              isTripLoading ? (
                <p className="text-sm opacity-70">Loading album memories...</p>
              ) : (
                <MemoriesByMonth
                  entries={entries}
                  control={control as unknown as Control<FieldValues>}
                  register={register as UseFormRegister<FieldValues>}
                  errors={errors}
                />
              )
            ) : (
              <p className="text-sm opacity-70">
                Select a travel period to add memories by day.
              </p>
            )}

            <div className="flex max-w-125 flex-col gap-3 self-center sm:flex-row">
              <Button
                type="button"
                variant="border"
                disabled={isSaving}
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="border"
                disabled={isSaving}
                onClick={() => router.push('/')}
              >
                Skip for now
              </Button>
              <Button
                type="button"
                variant="accent"
                disabled={isSaving}
                onClick={saveMemories}
              >
                {isSaving ? 'Saving...' : 'Save memories'}
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CreateTrip;
