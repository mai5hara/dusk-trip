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

type MemoriesByMonthProps = {
  entries: DayEntryFormValue[];
  // Parent form shape is wider; keep this loosely typed for reuse.
  control: Control<FieldValues>;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors<FieldValues>;
  onAddMemory: (dateKey: string) => string;
  onRemoveMemory: (clientId: string) => void;
};

const TIME_OF_DAY_OPTIONS = [
  ['MORNING', 'Morning'],
  ['AFTERNOON', 'Afternoon'],
  ['EVENING', 'Evening'],
] as const;

const MemoriesByMonth = ({
  entries,
  control,
  register,
  errors,
  onAddMemory,
  onRemoveMemory,
}: MemoriesByMonthProps) => {
  const months = groupEntriesByMonth(entries);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Derive a valid selection from entries so we don't sync with useEffect.
  const effectiveSelectedDateKey =
    entries.length === 0
      ? null
      : entries.some((entry) => entry.dateKey === selectedDateKey)
        ? selectedDateKey
        : entries[0].dateKey;

  const selectedDayEntries = entries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.dateKey === effectiveSelectedDateKey);
  const effectiveSelectedClientId = selectedDayEntries.some(
    ({ entry }) => entry.clientId === selectedClientId,
  )
    ? selectedClientId
    : selectedDayEntries[0]?.entry.clientId;
  const selected = selectedDayEntries.find(
    ({ entry }) => entry.clientId === effectiveSelectedClientId,
  );
  const selectedDay = selected?.entry;
  const selectedIndex = selected?.index ?? -1;

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
                          <span className="ml-auto text-xs opacity-60">
                            {
                              entries.filter(
                                (entry) =>
                                  entry.dateKey === day.dateKey &&
                                  entry.photoUrl.trim().length > 0,
                              ).length
                            }
                          </span>
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

            <div className="flex flex-wrap items-center gap-2">
              {selectedDayEntries.map(({ entry }, memoryIndex) => (
                <button
                  key={entry.clientId}
                  type="button"
                  onClick={() => setSelectedClientId(entry.clientId)}
                  className={[
                    'rounded-full border px-3 py-1 text-sm',
                    entry.clientId === effectiveSelectedClientId
                      ? 'bg-accent/15 font-medium'
                      : 'hover:bg-black/5',
                  ].join(' ')}
                >
                  Memory {memoryIndex + 1}
                </button>
              ))}
              <button
                type="button"
                className="rounded-full border px-3 py-1 text-sm hover:bg-black/5"
                onClick={() => {
                  const clientId = onAddMemory(selectedDay.dateKey);
                  setSelectedClientId(clientId);
                }}
              >
                Add memory
              </button>
            </div>

            <Field>
              <Label htmlFor={`entries.${selectedIndex}.timeOfDay`}>
                Time of day
              </Label>
              <Controller
                name={`entries.${selectedIndex}.timeOfDay` as Path<FieldValues>}
                control={control}
                render={({ field }) => (
                  <div
                    id={`entries.${selectedIndex}.timeOfDay`}
                    className="grid grid-cols-1 gap-2 sm:grid-cols-3"
                  >
                    {TIME_OF_DAY_OPTIONS.map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={[
                          'rounded-full border px-3 py-2 text-sm',
                          field.value === value
                            ? 'bg-accent/15 font-medium'
                            : 'hover:bg-black/5',
                        ].join(' ')}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              />
            </Field>

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

            {selectedDayEntries.length > 1 && (
              <button
                type="button"
                className="self-start text-sm text-red-700 hover:underline"
                onClick={() => {
                  onRemoveMemory(selectedDay.clientId);
                  setSelectedClientId(null);
                }}
              >
                Remove memory
              </button>
            )}
          </div>
        ) : (
          <p className="text-sm opacity-70">Select a day to edit memories.</p>
        )}
      </div>
    </div>
  );
};

export default MemoriesByMonth;
