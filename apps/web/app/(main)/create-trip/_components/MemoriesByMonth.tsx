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
import { CheckIcon } from 'lucide-react';
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

type MemoriesByMonthProps = {
  entries: DayEntryFormValue[];
  // Parent form shape is wider; keep this loosely typed for reuse.
  control: Control<FieldValues>;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors<FieldValues>;
};

function isSavedDay(day: DayEntryFormValue): boolean {
  return Boolean(day.id);
}

const MemoriesByMonth = ({
  entries,
  control,
  register,
  errors,
}: MemoriesByMonthProps) => {
  const months = groupEntriesByMonth(entries);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  // Derive a valid selection from entries so we don't sync with useEffect.
  const effectiveSelectedDateKey =
    entries.length === 0
      ? null
      : entries.some((entry) => entry.dateKey === selectedDateKey)
        ? selectedDateKey
        : entries[0].dateKey;

  const selectedIndex = entries.findIndex(
    (entry) => entry.dateKey === effectiveSelectedDateKey,
  );
  const selectedDay = selectedIndex >= 0 ? entries[selectedIndex] : undefined;

  if (months.length === 0) {
    return (
      <p className="text-sm opacity-70">
        Select a travel period to add memories by day.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-16">
      <div className="md:col-span-5">
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
                    const saved = isSavedDay(day);

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
                          <span
                            className="flex size-4 shrink-0 items-center justify-center"
                            aria-hidden
                          >
                            {saved ? (
                              <CheckIcon className="size-3.5 text-accent" />
                            ) : null}
                          </span>
                          <span>{formatDayHeading(day)}</span>
                          {saved ? (
                            <span className="sr-only">(saved)</span>
                          ) : null}
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

      <div className="md:col-span-11">
        {selectedDay && selectedIndex >= 0 ? (
          <div key={selectedDay.dateKey} className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">
              {formatDayHeading(selectedDay)}
            </h3>

            <Field>
              <Label htmlFor={`entries.${selectedIndex}.photoUrl`}>Photo</Label>
              <Controller
                name={`entries.${selectedIndex}.photoUrl` as Path<FieldValues>}
                control={control}
                render={({ field }) => (
                  <PhotoUrlField
                    id={`entries.${selectedIndex}.photoUrl`}
                    variant="inset"
                    value={typeof field.value === 'string' ? field.value : ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    errorMessage={
                      (
                        errors.entries as
                          | FieldErrors<DayEntryFormValue>[]
                          | undefined
                      )?.[selectedIndex]?.photoUrl?.message
                    }
                  />
                )}
              />
            </Field>

            <Field>
              <Label htmlFor={`entries.${selectedIndex}.caption`}>
                Caption
              </Label>
              <Input
                type="text"
                variant="inset"
                placeholder="Write a caption"
                {...register(
                  `entries.${selectedIndex}.caption` as Path<FieldValues>,
                )}
                errorMessage={
                  (
                    errors.entries as
                      | FieldErrors<DayEntryFormValue>[]
                      | undefined
                  )?.[selectedIndex]?.caption?.message
                }
              />
            </Field>

            <Field>
              <Label htmlFor={`entries.${selectedIndex}.location`}>
                Location
              </Label>
              <Input
                type="text"
                variant="inset"
                placeholder="Where was this?"
                {...register(
                  `entries.${selectedIndex}.location` as Path<FieldValues>,
                )}
                errorMessage={
                  (
                    errors.entries as
                      | FieldErrors<DayEntryFormValue>[]
                      | undefined
                  )?.[selectedIndex]?.location?.message
                }
              />
            </Field>
          </div>
        ) : (
          <p className="text-sm opacity-70">Select a day to edit memories.</p>
        )}
      </div>
    </div>
  );
};

export default MemoriesByMonth;
