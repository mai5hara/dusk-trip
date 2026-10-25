'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useForm,
  type Control,
  type FieldValues,
  type UseFormRegister,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  CREATE_ENTRIES_BATCH_MAX,
  type CreateEntryBody,
} from '@mood-trip/validators';
import { Button } from '@mood-trip/ui';
import { useTripQuery } from '@/app/(main)/_hooks/useTripQuery';
import {
  useCreateEntriesMutation,
  useUpdateEntriesMutation,
} from '@/app/(main)/create-trip/_hooks/useEntryMutation';
import MemoriesByMonth from '@/app/(main)/create-trip/_components/MemoriesByMonth';
import {
  entryFormSchema,
  toDate,
  type DayEntryFormValue,
  type EntryFormValues,
} from '@/app/(main)/create-trip/_lib/create-trip-form';
import { buildDayEntries } from '@/app/(main)/create-trip/_lib/travel-period';
import { getErrorMessage } from '@/lib/get-error-message';

function _hasEntryId(
  entry: DayEntryFormValue,
): entry is DayEntryFormValue & { id: string } {
  return Boolean(entry.id);
}

function _toEntryBody(entry: DayEntryFormValue): CreateEntryBody {
  return {
    photoUrl: entry.photoUrl,
    caption: entry.caption || undefined,
    location: entry.location || undefined,
    dayLabel: entry.dateKey,
    timeOfDay: entry.timeOfDay,
    sortOrder: entry.sortOrder,
  };
}

async function _saveChunks<T>(
  items: T[],
  saveChunk: (chunk: T[]) => Promise<unknown>,
): Promise<void> {
  for (let i = 0; i < items.length; i += CREATE_ENTRIES_BATCH_MAX) {
    await saveChunk(items.slice(i, i + CREATE_ENTRIES_BATCH_MAX));
  }
}

const EditMemories = ({ tripId }: { tripId: string }) => {
  const router = useRouter();
  const { data: trip, isLoading, isError } = useTripQuery(tripId);
  const { mutateAsync: createEntriesAsync, isPending: isCreating } =
    useCreateEntriesMutation();
  const { mutateAsync: updateEntriesAsync, isPending: isUpdating } =
    useUpdateEntriesMutation();
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: { tripId, entries: [] },
  });
  const entries = watch('entries');

  useEffect(() => {
    if (!trip) return;
    const start = toDate(trip.startDate);
    const end = toDate(trip.endDate);
    reset({
      tripId,
      entries:
        start && end ? buildDayEntries(start, end, [], trip.entries) : [],
    });
  }, [trip, tripId, reset]);

  const saveMemories = handleSubmit(async (values) => {
    const withPhoto = values.entries.filter(
      (entry) => entry.photoUrl.trim().length > 0,
    );
    const toUpdate = withPhoto.filter(_hasEntryId);
    const toCreate = withPhoto.filter((entry) => !entry.id);

    try {
      await _saveChunks(toUpdate, (chunk) =>
        updateEntriesAsync({
          tripId,
          body: {
            entries: chunk.map((entry) => ({
              id: entry.id,
              ..._toEntryBody(entry),
            })),
          },
        }),
      );
      await _saveChunks(toCreate, (chunk) =>
        createEntriesAsync({
          tripId,
          body: { entries: chunk.map(_toEntryBody) },
        }),
      );
      toast.success('Memories updated');
      router.push(`/trips/${tripId}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update memories'));
    }
  });

  if (isLoading) return <section>Loading...</section>;
  if (isError || !trip) return <section>Trip not found</section>;

  const isSaving = isSubmitting || isCreating || isUpdating;

  return (
    <div className="mx-auto flex w-full max-w-225 flex-col items-center pt-8 pb-20 md:pt-20 md:pb-40">
      <div className="flex w-full flex-col items-center gap-14">
        <p className="text-sm opacity-70">Step 2 of 2 · Memories</p>
        <section className="flex w-full flex-col gap-9">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-mono font-medium">Edit Memories</h1>
            <p className="text-sm opacity-70">
              Update photos, captions, and locations by day.
            </p>
          </div>
          {entries.length > 0 ? (
            <MemoriesByMonth
              entries={entries}
              control={control as unknown as Control<FieldValues>}
              register={register as unknown as UseFormRegister<FieldValues>}
              errors={errors}
            />
          ) : (
            <p className="text-sm opacity-70">
              No travel period is set for this album.
            </p>
          )}
          <div className="flex w-full justify-center flex-col gap-3 self-center sm:flex-row">
            <div className="w-full md:max-w-50">
              <Button
                type="button"
                variant="outline"
                width="full"
                disabled={isSaving}
                onClick={() => router.push(`/trips/${tripId}/edit`)}
              >
                Back
              </Button>
            </div>
            <div className="w-full md:max-w-50">
              <Button
                type="button"
                variant="accent"
                width="full"
                disabled={isSaving}
                onClick={saveMemories}
              >
                {isSaving ? 'Saving...' : 'Save memories'}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EditMemories;
