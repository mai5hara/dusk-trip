'use client';

import {
  z,
  createTripBodySchema,
  createEntryBodySchema,
} from '@mood-trip/validators';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, Label, Select } from '@mood-trip/ui';
import { useCreateTripMutation } from './useTripMutation';
import { useCreateEntryMutation } from './useEntryMutation';
import { useTripsQuery } from '../trips/useTripsQuery';

const NEW_TRIP_VALUE = '__new__' as const;

const entryFormSchema = z
  .object({
    tripId: z.string().min(1, 'Select a trip'),
    entry: createEntryBodySchema,
    newTrip: createTripBodySchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tripId === NEW_TRIP_VALUE) {
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
  });

type EntryFormValues = z.infer<typeof entryFormSchema>;

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
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: {
      tripId: '',
      entry: {
        photoUrl: '',
        caption: '',
        location: '',
        dayLabel: '',
      },
      newTrip: {
        title: '',
        thumbnailUrl: '',
        location: '',
        startDate: undefined,
        endDate: undefined,
      },
    },
  });

  const selectedTripId = watch('tripId');
  const isNewTrip = selectedTripId === NEW_TRIP_VALUE;

  const onSubmit = async (values: EntryFormValues) => {
    console.log(values);
    try {
      let tripId = values.tripId;

      if (tripId === NEW_TRIP_VALUE) {
        const createdTrip = await createTripAsync(values.newTrip!);
        tripId = createdTrip.id;
      }

      await createEntryAsync({ tripId, body: values.entry });
      router.push('/');
    } catch (error) {
      console.error(error);
    }
  };

  const isSaving = isSubmitting || isCreatingTrip || isCreatingEntry;

  return (
    <div>
      <h1>Create Trip</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="tripId"
          control={control}
          render={({ field }) => (
            <Select
              placeholder="Select album"
              value={field.value}
              onValueChange={field.onChange}
              disabled={isTripsLoading}
              options={[
                { label: '＋ Create new trip', value: NEW_TRIP_VALUE },
                ...trips.map((trip) => ({
                  label: trip.title,
                  value: trip.id,
                })),
              ]}
            />
          )}
        />
        {isNewTrip && (
          <section className="flex flex-col gap-4 rounded-lg border p-4">
            <h2 className="text-lg font-semibold">New Trip</h2>

            <div className="flex flex-col gap-2">
              <Label>Title</Label>
              <Input type="text" {...register('newTrip.title')} />
              {errors.newTrip?.title && (
                <p className="text-sm text-red-500">
                  {errors.newTrip.title.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Thumbnail URL</Label>
              <Input type="url" {...register('newTrip.thumbnailUrl')} />
              {errors.newTrip?.thumbnailUrl && (
                <p className="text-sm text-red-500">
                  {errors.newTrip.thumbnailUrl.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Location</Label>
              <Input type="text" {...register('newTrip.location')} />
            </div>

            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-2">
                <Label>Start Date</Label>
                <Input type="date" {...register('newTrip.startDate')} />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <Label>End Date</Label>
                <Input type="date" {...register('newTrip.endDate')} />
              </div>
            </div>
          </section>
        )}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Memories</h2>

          <div className="flex flex-col gap-2">
            <Label>Photo URL</Label>
            <Input type="url" {...register('entry.photoUrl')} />
            {errors.entry?.photoUrl && (
              <p className="text-sm text-red-500">
                {errors.entry.photoUrl.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Caption</Label>
            <Input type="text" {...register('entry.caption')} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Location</Label>
            <Input type="text" {...register('entry.location')} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Day Label</Label>
            <Input type="text" {...register('entry.dayLabel')} />
          </div>
        </section>
        {errors.tripId && (
          <p className="text-sm text-red-500">{errors.tripId.message}</p>
        )}
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </div>
  );
};

export default CreateTrip;
