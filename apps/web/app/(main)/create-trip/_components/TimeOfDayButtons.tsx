'use client';

import { Button, Field, Label } from '@mood-trip/ui';
import {
  ENTRY_TIME_OF_DAY_VALUES,
  type EntryTimeOfDay,
} from '@mood-trip/validators';

const TIME_OF_DAY_OPTIONS: { value: EntryTimeOfDay; label: string }[] = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'night', label: 'Night' },
];

type TimeOfDayButtonsProps = {
  id: string;
  value: unknown;
  onChange: (value: EntryTimeOfDay | undefined) => void;
};

function _parseEntryTimeOfDay(value: unknown): EntryTimeOfDay | undefined {
  return ENTRY_TIME_OF_DAY_VALUES.includes(value as EntryTimeOfDay)
    ? (value as EntryTimeOfDay)
    : undefined;
}

const TimeOfDayButtons = ({
  id,
  value,
  onChange,
}: TimeOfDayButtonsProps): React.JSX.Element => {
  const selected = _parseEntryTimeOfDay(value);

  return (
    <Field>
      <Label htmlFor={id}>Time of day</Label>
      <div
        id={id}
        role="group"
        aria-label="Time of day"
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {TIME_OF_DAY_OPTIONS.map((option) => {
          const isSelected = selected === option.value;

          return (
            <Button
              key={option.value}
              type="button"
              variant={isSelected ? 'accent' : 'inset'}
              width="full"
              aria-pressed={isSelected}
              onClick={() => onChange(isSelected ? undefined : option.value)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </Field>
  );
};

export default TimeOfDayButtons;
