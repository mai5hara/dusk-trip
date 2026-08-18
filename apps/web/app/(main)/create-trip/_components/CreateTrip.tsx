'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm,
  Controller,
  type Control,
  type FieldValues,
  type UseFormRegister,
} from 'react-hook-form';
import { toast } from 'sonner';
import { CREATE_ENTRIES_BATCH_MAX } from '@mood-trip/validators';
import { Button, Input, Label, Field, DateRangePicker } from '@mood-trip/ui';
import { useCreateTripMutation } from '../_hooks/useTripMutation';
import { useCreateEntriesMutation } from '../_hooks/useEntryMutation';
import { buildDayEntries } from '../_lib/travel-period';
import {
  entryFormSchema,
  toDate,
  type EntryFormValues,
} from '../_lib/create-trip-form';
import { getErrorMessage } from '@/lib/get-error-message';
import MemoriesByMonth from './MemoriesByMonth';
import PhotoUrlField from './PhotoUrlField';

type Step = 1 | 2;

const CreateTrip = () => {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const { mutateAsync: createTripAsync, isPending: isCreatingTrip } =
    useCreateTripMutation();
  const { mutateAsync: createEntriesAsync, isPending: isCreatingEntries } =
    useCreateEntriesMutation();

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

  const travelStartDate = watch('newTrip.startDate');
  const travelEndDate = watch('newTrip.endDate');
  const entries = watch('entries');

  useEffect(() => {
    const start = toDate(travelStartDate);
    const end = toDate(travelEndDate);

    if (!start || !end) {
      setValue('entries', []);
      return;
    }

    const previous = getValues('entries');
    setValue('entries', buildDayEntries(start, end, previous));
  }, [travelStartDate, travelEndDate, getValues, setValue]);

  const ensureAlbumExists = async (
    values: EntryFormValues,
  ): Promise<string> => {
    if (values.tripId) {
      return values.tripId;
    }

    if (!values.newTrip) {
      throw new Error('Album is required');
    }

    const createdTrip = await createTripAsync(values.newTrip);
    setValue('tripId', createdTrip.id);
    return createdTrip.id;
  };

  const validateAlbumStep = async (): Promise<boolean> => {
    return trigger([
      'newTrip',
      'newTrip.title',
      'newTrip.thumbnailUrl',
      'newTrip.location',
      'newTrip.startDate',
      'newTrip.endDate',
    ]);
  };

  const saveAlbumOnly = async (): Promise<void> => {
    const isValid = await validateAlbumStep();
    if (!isValid) return;

    try {
      await ensureAlbumExists(getValues());
      router.push('/');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create album'));
    }
  };

  /** Validate only — album is created on Create album only / Save memories. */
  const continueToMemories = async (): Promise<void> => {
    const isValid = await validateAlbumStep();
    if (!isValid) return;
    setStep(2);
  };

  const saveMemories = handleSubmit(async (values) => {
    try {
      const resolvedTripId = await ensureAlbumExists(values);
      const entriesToCreate = values.entries
        .filter((entry) => !entry.id && entry.photoUrl.trim().length > 0)
        .map((entry) => ({
          photoUrl: entry.photoUrl,
          caption: entry.caption || undefined,
          location: entry.location || undefined,
          dayLabel: entry.dateKey,
          sortOrder: entry.sortOrder,
        }));

      let savedCount = 0;
      try {
        for (
          let i = 0;
          i < entriesToCreate.length;
          i += CREATE_ENTRIES_BATCH_MAX
        ) {
          const chunk = entriesToCreate.slice(i, i + CREATE_ENTRIES_BATCH_MAX);
          await createEntriesAsync({
            tripId: resolvedTripId,
            body: { entries: chunk },
          });
          savedCount += chunk.length;
        }
      } catch (error) {
        if (savedCount > 0) {
          toast.error(
            `Saved ${savedCount} of ${entriesToCreate.length} memories, then ${getErrorMessage(error, 'an error occurred')}. Try again to save the rest.`,
          );
        } else {
          toast.error(getErrorMessage(error, 'Failed to save memories'));
        }
        return;
      }

      // Fix routing to album details page later
      router.push('/');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save memories'));
    }
  });

  const isSaving = isSubmitting || isCreatingTrip || isCreatingEntries;
  const showMemories =
    entries.length > 0 || Boolean(travelStartDate && travelEndDate);

  return (
    <div className="mx-auto flex w-full max-w-225 flex-col items-center pt-20 pb-40">
      <div className="flex w-full flex-col items-center gap-14">
        <p className="text-sm opacity-70">
          Step {step} of 2 · {step === 1 ? 'Album' : 'Memories'}
        </p>

        {step === 1 ? (
          <section className="flex w-full flex-col gap-9">
            <h1 className="text-2xl font-mono font-medium">Add Trip</h1>
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
                    errorMessage={errors.newTrip?.location?.message}
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

            <div className="flex max-w-125 flex-col gap-3 self-center sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={saveAlbumOnly}
              >
                {isSaving ? 'Saving...' : 'Create album only'}
              </Button>
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
              <MemoriesByMonth
                entries={entries}
                control={control as unknown as Control<FieldValues>}
                register={register as unknown as UseFormRegister<FieldValues>}
                errors={errors}
              />
            ) : (
              <p className="text-sm opacity-70">
                Select a travel period to add memories by day.
              </p>
            )}

            <div className="flex max-w-125 flex-col gap-3 self-center sm:flex-row">
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={saveAlbumOnly}
              >
                {isSaving ? 'Saving...' : 'Create album only'}
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
