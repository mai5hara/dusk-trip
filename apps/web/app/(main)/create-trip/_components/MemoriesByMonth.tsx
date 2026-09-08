'use client';

import { useState } from 'react';
import type {
  Control,
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from 'react-hook-form';
import { Controller } from 'react-hook-form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Field,
  Input,
  Label,
} from '@mood-trip/ui';
import {
  formatDayHeading,
  groupEntriesByMonth,
  type DayEntryFormValue,
} from '../_lib/travel-period';
import PhotoUrlField from './PhotoUrlField';
import TimeOfDayButtons from './TimeOfDayButtons';
import MemoryCarousel from './MemoryCarousel';

type MemoriesByMonthProps = {
  entries: DayEntryFormValue[];
  control: Control<FieldValues>;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors<FieldValues>;
};

const MemoriesByMonth = ({
  entries,
  control,
  errors,
}: MemoriesByMonthProps) => {
  const months = groupEntriesByMonth(entries);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [slotByDay, setSlotByDay] = useState<Record<string, number>>({});

  const effectiveSelectedDateKey =
    entries.length === 0
      ? null
      : entries.some((entry) => entry.dateKey === selectedDateKey)
        ? selectedDateKey
        : entries[0].dateKey;

  const selectedIndices = entries.flatMap((entry, index) =>
    entry.dateKey === effectiveSelectedDateKey ? [index] : [],
  );
  const selectedDay =
    selectedIndices.length > 0 ? entries[selectedIndices[0]] : undefined;
  const dayKey = effectiveSelectedDateKey ?? '';
  const activeSlot = Math.min(
    slotByDay[dayKey] ?? 0,
    Math.max(0, selectedIndices.length - 1),
  );
  const selectedIndex = selectedIndices[activeSlot];

  if (months.length === 0) {
    return (
      <p className="text-sm opacity-70">
        Select a travel period to add memories by day.
      </p>
    );
  }

  return (
    <div className="isolate grid grid-cols-1 gap-6 pr-8 md:grid-cols-16 md:pr-12">
      <div className="relative z-20 min-w-0 bg-surface md:col-span-5">
        <Accordion
          type="multiple"
          variant="accent"
          defaultValue={[months[0].monthKey]}
        >
          {months.map((month) => (
            <AccordionItem key={month.monthKey} value={month.monthKey}>
              <AccordionTrigger>{month.label}</AccordionTrigger>
              <AccordionContent>
                <ul className="flex flex-col gap-1">
                  {month.days.map((day) => {
                    const isSelected = day.dateKey === effectiveSelectedDateKey;

                    return (
                      <li key={day.dateKey}>
                        <button
                          type="button"
                          onClick={() => setSelectedDateKey(day.dateKey)}
                          className={[
                            'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                            isSelected
                              ? 'bg-accent/15 font-medium'
                              : 'hover:bg-black/5',
                          ].join(' ')}
                        >
                          <span>{formatDayHeading(day)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="relative z-0 min-w-0 md:col-span-11">
        {selectedDay && selectedIndex !== undefined ? (
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-semibold">
              {formatDayHeading(selectedDay)}
            </h3>
            <MemoryCarousel
              items={selectedIndices.map((index) => ({
                id: entries[index]?.id,
                photoUrl: entries[index]?.photoUrl ?? '',
              }))}
              activeSlot={activeSlot}
              onActiveSlotChange={(slot) =>
                setSlotByDay((current) => ({ ...current, [dayKey]: slot }))
              }
              activePhotoField={
                <_PhotoField
                  key={selectedIndex}
                  selectedIndex={selectedIndex}
                  control={control}
                  errors={errors}
                />
              }
            />
            <_CaptionFields
              key={selectedIndex}
              selectedIndex={selectedIndex}
              control={control}
              errors={errors}
            />
          </div>
        ) : (
          <p className="text-sm opacity-70">Select a day to edit memories.</p>
        )}
      </div>
    </div>
  );
};

type FieldProps = {
  selectedIndex: number;
  errors: FieldErrors<FieldValues>;
};

function _PhotoField({
  selectedIndex,
  control,
  errors,
}: FieldProps & { control: Control<FieldValues> }) {
  const fieldErrors = errors.entries as
    | FieldErrors<DayEntryFormValue>[]
    | undefined;

  return (
    <Controller
      name={`entries.${selectedIndex}.photoUrl` as Path<FieldValues>}
      control={control}
      render={({ field }) => (
        <div className="size-full overflow-hidden [&>div]:h-full [&>div]:gap-0 [&>div>div]:h-full [&_img]:size-full [&_img]:object-cover">
          <PhotoUrlField
            id={`entries.${selectedIndex}.photoUrl`}
            variant="inset"
            value={typeof field.value === 'string' ? field.value : ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
            errorMessage={fieldErrors?.[selectedIndex]?.photoUrl?.message}
          />
        </div>
      )}
    />
  );
}

function _CaptionFields({
  selectedIndex,
  control,
  errors,
}: FieldProps & {
  control: Control<FieldValues>;
}) {
  const fieldErrors = errors.entries as
    | FieldErrors<DayEntryFormValue>[]
    | undefined;

  return (
    <div className="flex flex-col gap-4">
      <Controller
        name={`entries.${selectedIndex}.timeOfDay` as Path<FieldValues>}
        control={control}
        render={({ field }) => (
          <TimeOfDayButtons
            id={`entries.${selectedIndex}.timeOfDay`}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Field>
        <Label htmlFor={`entries.${selectedIndex}.caption`}>Caption</Label>
        <Controller
          name={`entries.${selectedIndex}.caption` as Path<FieldValues>}
          control={control}
          render={({ field }) => (
            <Input
              id={`entries.${selectedIndex}.caption`}
              type="text"
              variant="inset"
              placeholder="Write a caption"
              value={typeof field.value === 'string' ? field.value : ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              errorMessage={fieldErrors?.[selectedIndex]?.caption?.message}
            />
          )}
        />
      </Field>
      <Field>
        <Label htmlFor={`entries.${selectedIndex}.location`}>Location</Label>
        <Controller
          name={`entries.${selectedIndex}.location` as Path<FieldValues>}
          control={control}
          render={({ field }) => (
            <Input
              id={`entries.${selectedIndex}.location`}
              type="text"
              variant="inset"
              placeholder="Where was this?"
              value={typeof field.value === 'string' ? field.value : ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
              errorMessage={fieldErrors?.[selectedIndex]?.location?.message}
            />
          )}
        />
      </Field>
    </div>
  );
}

export default MemoriesByMonth;
