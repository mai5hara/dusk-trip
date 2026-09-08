'use client';

import {
  Button,
  DateRangePicker,
  Field,
  Input,
  Label,
  Select,
  Textarea,
  type DateRangePickerValue,
} from '@mood-trip/ui';
import { budgetOptions, paceOptions } from '../_lib/plan-form-options';

type ItineraryDestinationStepProps = {
  destination: string;
  dateRange: DateRangePickerValue | undefined;
  dateRangeError: string | undefined;
  pace: string;
  budget: string;
  travelers: string;
  interests: string;
  constraints: string;
  itineraryIdea: string;
  error: string | null;
  isGenerating: boolean;
  onDestinationChange: (value: string) => void;
  onDateRangeChange: (value: DateRangePickerValue | undefined) => void;
  onPaceChange: (value: string) => void;
  onBudgetChange: (value: string) => void;
  onTravelersChange: (value: string) => void;
  onInterestsChange: (value: string) => void;
  onConstraintsChange: (value: string) => void;
  onBack: () => void;
};

const ItineraryDestinationStep = ({
  destination,
  dateRange,
  dateRangeError,
  pace,
  budget,
  travelers,
  interests,
  constraints,
  itineraryIdea,
  error,
  isGenerating,
  onDestinationChange,
  onDateRangeChange,
  onPaceChange,
  onBudgetChange,
  onTravelersChange,
  onInterestsChange,
  onConstraintsChange,
  onBack,
}: ItineraryDestinationStepProps) => {
  return (
    <section className="flex w-full flex-col gap-9">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-mono font-medium">Destination</h1>
        <p className="text-sm opacity-70">{itineraryIdea}</p>
      </div>

      <div className="flex w-full max-w-xl flex-col gap-3">
        <Field>
          <Label htmlFor="destination" required>
            Destination
          </Label>
          <Input
            id="destination"
            variant="inset"
            value={destination}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onDestinationChange(event.target.value)
            }
            placeholder="Kyoto, Lisbon, Big Sur..."
            required
          />
        </Field>

        <Field>
          <Label htmlFor="itineraryDates" required>
            Travel period
          </Label>
          <DateRangePicker
            id="itineraryDates"
            variant="inset"
            value={dateRange}
            onValueChange={onDateRangeChange}
            placeholder="Select travel dates"
            numberOfMonths={2}
            errorMessage={dateRangeError}
          />
        </Field>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field>
            <Label htmlFor="pace" required>
              Pace
            </Label>
            <Select
              id="pace"
              variant="inset"
              options={paceOptions}
              value={pace}
              onValueChange={onPaceChange}
              placeholder="Choose a pace"
            />
          </Field>
          <Field>
            <Label htmlFor="budget" required>
              Budget
            </Label>
            <Select
              id="budget"
              variant="inset"
              options={budgetOptions}
              value={budget}
              onValueChange={onBudgetChange}
              placeholder="Choose a budget"
            />
          </Field>
        </div>

        <Field>
          <Label htmlFor="travelers" required>
            Travelers
          </Label>
          <Input
            id="travelers"
            type="number"
            min="1"
            max="12"
            variant="inset"
            value={travelers}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onTravelersChange(event.target.value)
            }
            required
          />
        </Field>

        <Field>
          <Label htmlFor="interests" required>
            Interests
          </Label>
          <Input
            id="interests"
            variant="inset"
            value={interests}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onInterestsChange(event.target.value)
            }
            placeholder="food, art, hikes, markets..."
            required
          />
          <p className="text-xs opacity-60">Separate interests with commas.</p>
        </Field>

        <Field>
          <Label htmlFor="constraints">Constraints</Label>
          <Textarea
            id="constraints"
            variant="inset"
            value={constraints}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
              onConstraintsChange(event.target.value)
            }
            placeholder="No driving, vegetarian food, kid-friendly..."
          />
        </Field>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <div className="flex max-w-125 flex-col gap-3 self-center sm:flex-row">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" variant="accent" disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate itinerary'}
        </Button>
      </div>
    </section>
  );
};

export default ItineraryDestinationStep;
