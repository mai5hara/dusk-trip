'use client';

import { Button, Field, Label, Radio, RadioGroup } from '@mood-trip/ui';
import { moodCopy, moodOptions } from '../_lib/plan-form-options';

type ItineraryMoodStepProps = {
  mood: string;
  onMoodChange: (value: string) => void;
};

const ItineraryMoodStep = ({ mood, onMoodChange }: ItineraryMoodStepProps) => {
  const subtitle = mood
    ? `An itinerary built around ${moodCopy[mood]}.`
    : 'Choose how this itinerary should feel.';

  return (
    <section className="flex w-full flex-col items-center gap-9">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-mono font-medium">Plan an itinerary</h1>
        <p className="text-sm opacity-70">{subtitle}</p>
      </div>

      <div className="w-full max-w-md">
        <Field>
          <Label htmlFor="mood" required>
            Mood
          </Label>
          <RadioGroup
            id="mood"
            value={mood}
            onValueChange={onMoodChange}
            variant="inset"
            gap="2"
          >
            {moodOptions.map((option) => (
              <Radio
                key={option.value}
                value={option.value}
                description={moodCopy[option.value]}
              >
                {option.label}
              </Radio>
            ))}
          </RadioGroup>
        </Field>
      </div>

      <div className="flex max-w-125 flex-col gap-3 self-center sm:flex-row">
        <Button type="submit" variant="accent" disabled={!mood}>
          Continue to destination
        </Button>
      </div>
    </section>
  );
};

export default ItineraryMoodStep;
