'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  DateRangePicker,
  Field,
  Input,
  Label,
  Textarea,
} from '@mood-trip/ui';
import { toast } from 'sonner';
import {
  createTripBodySchema,
  type CreateTripBody,
} from '@mood-trip/validators';
import { useTripQuery } from '@/app/(main)/_hooks/useTripQuery';
import { useUpdateTripMutation } from '@/app/(main)/create-trip/_hooks/useTripMutation';
import PhotoUrlField from '@/app/(main)/create-trip/_components/PhotoUrlField';
import { toDate } from '@/app/(main)/create-trip/_lib/create-trip-form';
import { getErrorMessage } from '@/lib/get-error-message';

const EditAlbum = ({ tripId }: { tripId: string }) => {
  const router = useRouter();
  const { data: trip, isLoading, isError } = useTripQuery(tripId);
  const { mutateAsync: updateTripAsync, isPending } = useUpdateTripMutation();
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTripBody>({
    resolver: zodResolver(createTripBodySchema),
    defaultValues: {
      title: '',
      thumbnailUrl: '',
      location: '',
    },
  });
  const endDate = watch('endDate');

  useEffect(() => {
    if (!trip) return;
    reset({
      title: trip.title,
      thumbnailUrl: trip.thumbnailUrl,
      description: trip.description ?? undefined,
      location: trip.location,
      startDate: toDate(trip.startDate),
      endDate: toDate(trip.endDate),
    });
  }, [trip, reset]);

  const save = async (
    values: CreateTripBody,
    nextPath: string,
  ): Promise<void> => {
    try {
      await updateTripAsync({ id: tripId, body: values });
      toast.success('Album updated');
      router.push(nextPath);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to update album'));
    }
  };

  if (isLoading) return <section>Loading...</section>;
  if (isError || !trip) return <section>Trip not found</section>;

  return (
    <form className="mx-auto flex w-full max-w-225 flex-col items-center pt-20 pb-40">
      <div className="flex w-full flex-col items-center gap-14">
        <p className="text-sm opacity-70">Step 1 of 2 · Album</p>
        <section className="flex w-full flex-col gap-9">
          <h1 className="text-2xl font-mono font-medium">Edit Album</h1>
          <div className="grid grid-cols-16 gap-4">
            <div className="col-span-7">
              <Field>
                <Label htmlFor="thumbnailUrl">Thumbnail</Label>
                <Controller
                  name="thumbnailUrl"
                  control={control}
                  render={({ field }) => (
                    <PhotoUrlField
                      id="thumbnailUrl"
                      variant="inset"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      errorMessage={errors.thumbnailUrl?.message}
                    />
                  )}
                />
              </Field>
            </div>
            <div className="col-span-8 flex flex-col gap-3">
              <Field>
                <Label htmlFor="title">Album Name</Label>
                <Input
                  type="text"
                  variant="inset"
                  placeholder="Enter album name"
                  {...register('title')}
                  errorMessage={errors.title?.message}
                />
              </Field>
              <Field>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  variant="inset"
                  placeholder="Enter description"
                  {...register('description')}
                  errorMessage={errors.description?.message}
                />
              </Field>
              <Field>
                <Label htmlFor="location">Location</Label>
                <Input
                  type="text"
                  variant="inset"
                  placeholder="Enter location"
                  {...register('location')}
                  errorMessage={errors.location?.message}
                />
              </Field>
              <Field>
                <Label htmlFor="startDate">Travel Period</Label>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <DateRangePicker
                      id="startDate"
                      variant="inset"
                      placeholder="Select travel period"
                      value={{ from: field.value, to: endDate }}
                      onValueChange={(range) => {
                        setValue('startDate', range?.from, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                        setValue('endDate', range?.to, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }}
                      errorMessage={
                        errors.startDate?.message ?? errors.endDate?.message
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
              disabled={isPending}
              onClick={() => router.push(`/trips/${tripId}`)}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="accent"
              disabled={isPending}
              onClick={handleSubmit((values) =>
                save(values, `/trips/${tripId}/edit/memories`),
              )}
            >
              {isPending ? 'Saving...' : 'Continue to memories'}
            </Button>
          </div>
        </section>
      </div>
    </form>
  );
};

export default EditAlbum;
