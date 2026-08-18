'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type { DateRangePickerValue } from '@mood-trip/ui';
import type {
  ItineraryMapStyle,
  PlannedTrip,
  PlanTripBody,
} from '@mood-trip/validators';
import { planTrip } from '@/api/trips/api';
import { buildTripIdea } from '../_lib/plan-form-options';
import PlanDestinationStep from './PlanDestinationStep';
import PlanMoodStep from './PlanMoodStep';
import TripItineraryExplorer from './TripItineraryExplorer';

type PlanStep = 1 | 2;

const PlanMyTripSection = () => {
  const [step, setStep] = useState<PlanStep>(1);
  const [mood, setMood] = useState('');
  const [pace, setPace] = useState('balanced');
  const [budget, setBudget] = useState('moderate');
  const [destination, setDestination] = useState('');
  const [dateRange, setDateRange] = useState<DateRangePickerValue | undefined>(
    undefined,
  );
  const [dateRangeError, setDateRangeError] = useState<string | undefined>();
  const [travelers, setTravelers] = useState('2');
  const [interests, setInterests] = useState(
    'local food, neighborhoods, views',
  );
  const [constraints, setConstraints] = useState('');
  const [plannedTrip, setPlannedTrip] = useState<PlannedTrip | null>(null);
  const [mapStyle, setMapStyle] = useState<ItineraryMapStyle | null>(null);
  const [isFormExiting, setIsFormExiting] = useState(false);
  const [showExplorer, setShowExplorer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const tripIdea = useMemo(
    () => buildTripIdea(destination, mood, pace),
    [destination, mood, pace],
  );

  const handleBackToForm = (): void => {
    setShowExplorer(false);
    setIsFormExiting(false);
    setStep(2);
    window.setTimeout(() => {
      setPlannedTrip(null);
      setMapStyle(null);
    }, 300);
  };

  const handleDateRangeChange = (
    value: DateRangePickerValue | undefined,
  ): void => {
    setDateRange(value);
    if (value?.from && value?.to) {
      setDateRangeError(undefined);
    }
  };

  const handleGenerate = async (): Promise<void> => {
    setError(null);
    setPlannedTrip(null);
    setMapStyle(null);

    if (!dateRange?.from || !dateRange?.to) {
      setDateRangeError('Select a start and end date for your trip.');
      return;
    }

    setIsGenerating(true);

    const body: PlanTripBody = {
      destination,
      mood: mood as PlanTripBody['mood'],
      pace: pace as PlanTripBody['pace'],
      startDate: dateRange.from,
      endDate: dateRange.to,
      budget: budget as PlanTripBody['budget'],
      travelers: Number(travelers),
      interests: interests
        .split(',')
        .map((interest) => interest.trim())
        .filter(Boolean),
      constraints: constraints.trim() || undefined,
    };

    try {
      const nextPlan = await planTrip(body);
      setPlannedTrip(nextPlan.trip);
      setMapStyle(nextPlan.mapStyle);
      setIsFormExiting(true);
      window.setTimeout(() => {
        setShowExplorer(true);
        setIsFormExiting(false);
      }, 300);
    } catch {
      setError(
        'Could not generate a trip plan. Check your inputs and try again.',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (step === 1) {
      if (!mood) {
        return;
      }
      setStep(2);
      return;
    }

    await handleGenerate();
  };

  if (showExplorer && plannedTrip) {
    return (
      <section className="flex flex-col py-4 lg:min-h-0 lg:flex-1 lg:py-6">
        <TripItineraryExplorer
          trip={plannedTrip}
          mapStyle={mapStyle}
          onBack={handleBackToForm}
        />
      </section>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-225 flex-col items-center pt-20 pb-40">
      <div
        className={`flex w-full flex-col items-center gap-14 ${
          isFormExiting ? 'form-exit pointer-events-none' : ''
        }`}
      >
        <p className="text-sm opacity-70">
          Step {step} of 2 · {step === 1 ? 'Mood' : 'Destination'}
        </p>

        <form className="flex w-full flex-col" onSubmit={handleSubmit}>
          {step === 1 ? (
            <PlanMoodStep mood={mood} onMoodChange={setMood} />
          ) : (
            <PlanDestinationStep
              destination={destination}
              dateRange={dateRange}
              dateRangeError={dateRangeError}
              pace={pace}
              budget={budget}
              travelers={travelers}
              interests={interests}
              constraints={constraints}
              tripIdea={tripIdea}
              error={error}
              isGenerating={isGenerating}
              onDestinationChange={setDestination}
              onDateRangeChange={handleDateRangeChange}
              onPaceChange={setPace}
              onBudgetChange={setBudget}
              onTravelersChange={setTravelers}
              onInterestsChange={setInterests}
              onConstraintsChange={setConstraints}
              onBack={() => setStep(1)}
            />
          )}
        </form>
      </div>
    </div>
  );
};

export default PlanMyTripSection;
