'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, createEntryBodySchema } from '@mood-trip/validators';
import { Button, Field, Input, Label } from '@mood-trip/ui';
import { toast } from 'sonner';
import { useTripQuery } from '@/app/(main)/_hooks/useTripQuery';
import { updateEntries } from '@/api/trips/api';
import { queryKeys } from '@/lib/query/query-keys';
import { getErrorMessage } from '@/lib/get-error-message';

const TIME_OF_DAY_OPTIONS = [
  ['MORNING', 'Morning'],
  ['AFTERNOON', 'Afternoon'],
  ['EVENING', 'Evening'],
] as const;

const editMemoriesSchema = z.object({
  entries: z.array(createEntryBodySchema.extend({ id: z.string() })),
});

type EditMemoriesForm = z.infer<typeof editMemoriesSchema>;

const EditMemories = ({ tripId }: { tripId: string }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const { data: trip, isLoading, isError } = useTripQuery(tripId);
  const { control, register, handleSubmit, reset, setValue, watch } =
    useForm<EditMemoriesForm>({
      resolver: zodResolver(editMemoriesSchema),
      defaultValues: { entries: [] },
    });
  const { fields } = useFieldArray({ control, name: 'entries' });
  const entries = watch('entries');

  useEffect(() => {
    if (!trip) return;
    reset({
      entries: trip.entries.map((entry) => ({
        id: entry.id,
        photoUrl: entry.photoUrl,
        caption: entry.caption ?? undefined,
        location: entry.location ?? undefined,
        dayLabel: entry.dayLabel ?? undefined,
        timeOfDay: entry.timeOfDay,
        sortOrder: entry.sortOrder,
      })),
    });
  }, [trip, reset]);

  const save = async (values: EditMemoriesForm): Promise<void> => {
    setIsPending(true);
    try {
      if (values.entries.length > 0) {
        await updateEntries(tripId, { entries: values.entries });
      }
      await queryClient.invalidateQueries({ queryKey: queryKeys.trips.all });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.trips.detail(tripId),
      });
      toast.success('Memories updated');
      router.push(`/trips/${tripId}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update memories'));
    } finally {
      setIsPending(false);
    }
  };

  if (isLoading) return <section>Loading...</section>;
  if (isError || !trip) return <section>Trip not found</section>;

  return (
    <form
      className="mx-auto flex w-full max-w-225 flex-col gap-8 pt-20 pb-40"
      onSubmit={handleSubmit(save)}
    >
      <h1 className="text-2xl font-mono font-medium">Edit Memories</h1>
      {fields.length === 0 ? (
        <p className="text-sm opacity-70">No memories in this album yet.</p>
      ) : (
        fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-col gap-3 rounded-2xl border p-4"
          >
            <p className="text-sm font-medium">
              {entries[index]?.dayLabel ?? 'Memory'}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {TIME_OF_DAY_OPTIONS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue(`entries.${index}.timeOfDay`, value)}
                  className={`rounded-full border px-3 py-2 text-sm ${
                    entries[index]?.timeOfDay === value
                      ? 'bg-accent/15 font-medium'
                      : 'hover:bg-black/5'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <Field>
              <Label htmlFor={`entries.${index}.caption`}>Caption</Label>
              <Input
                type="text"
                variant="inset"
                {...register(`entries.${index}.caption`)}
              />
            </Field>
            <Field>
              <Label htmlFor={`entries.${index}.location`}>Location</Label>
              <Input
                type="text"
                variant="inset"
                {...register(`entries.${index}.location`)}
              />
            </Field>
          </div>
        ))
      )}
      <Button type="submit" variant="accent" disabled={isPending}>
        {isPending ? 'Saving...' : 'Save memories'}
      </Button>
    </form>
  );
};

export default EditMemories;
