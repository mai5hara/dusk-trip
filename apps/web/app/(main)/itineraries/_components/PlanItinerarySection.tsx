'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { DateRangePickerValue } from '@mood-trip/ui';
import type {
  DestinationPlace,
  GenerateItineraryBody,
  ItineraryMapStyle,
  ItineraryPlan,
} from '@mood-trip/validators';
import { generateItinerary } from '@/api/itineraries/api';
import { getErrorMessage } from '@/lib/get-error-message';
import { buildItineraryIdea } from '../_lib/plan-form-options';
import { useCreateItineraryMutation } from '../_hooks/useCreateItineraryMutation';
import ItineraryDestinationStep from './ItineraryDestinationStep';
import ItineraryMoodStep from './ItineraryMoodStep';
import ItineraryExplorer from './ItineraryExplorer';

type PlanStep = 1 | 2;

const PlanItinerarySection = () => {
  const router = useRouter();
  const { mutateAsync: createItineraryAsync, isPending: isSaving } =
    useCreateItineraryMutation();
  const [step, setStep] = useState<PlanStep>(1);
  const [mood, setMood] = useState('');
  const [pace, setPace] = useState('balanced');
  const [budget, setBudget] = useState('moderate');
  const [destinationPlace, setDestinationPlace] =
    useState<DestinationPlace | null>(null);
  const [destinationError, setDestinationError] = useState<
    string | undefined
  >();
  const [dateRange, setDateRange] = useState<DateRangePickerValue | undefined>(
    undefined,
  );
  const [dateRangeError, setDateRangeError] = useState<string | undefined>();
  const [travelers, setTravelers] = useState('2');
  const [interests, setInterests] = useState(
    'local food, neighborhoods, views',
  );
  const [constraints, setConstraints] = useState('');
  const [plan, setPlan] = useState<ItineraryPlan | null>(null);
  const [mapStyle, setMapStyle] = useState<ItineraryMapStyle | null>(null);
  const [isFormExiting, setIsFormExiting] = useState(false);
  const [showExplorer, setShowExplorer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const itineraryIdea = useMemo(
    () => buildItineraryIdea(destinationPlace?.label ?? '', mood, pace),
    [destinationPlace?.label, mood, pace],
  );

  const handleBackToForm = (): void => {
    setShowExplorer(false);
    setIsFormExiting(false);
    setStep(2);
    window.setTimeout(() => {
      setPlan(null);
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
    setPlan(null);
    setMapStyle(null);

    if (!dateRange?.from || !dateRange?.to) {
      setDateRangeError('Select a start and end date for your itinerary.');
      return;
    }

    if (!destinationPlace) {
      setDestinationError('Pick a destination from the suggestions.');
      return;
    }

    setDestinationError(undefined);
    setIsGenerating(true);

    const body: GenerateItineraryBody = {
      destination: destinationPlace.label,
      destinationPlace,
      mood: mood as GenerateItineraryBody['mood'],
      pace: pace as GenerateItineraryBody['pace'],
      startDate: dateRange.from,
      endDate: dateRange.to,
      budget: budget as GenerateItineraryBody['budget'],
      travelers: Number(travelers),
      interests: interests
        .split(',')
        .map((interest) => interest.trim())
        .filter(Boolean),
      constraints: constraints.trim() || undefined,
    };

    try {
      const generated = await generateItinerary(body);
      setPlan(generated.plan);
      setMapStyle(generated.mapStyle);
      setIsFormExiting(true);
      window.setTimeout(() => {
        setShowExplorer(true);
        setIsFormExiting(false);
      }, 300);
    } catch {
      setError(
        'Could not generate an itinerary. Check your inputs and try again.',
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

  const handleSave = async (): Promise<void> => {
    if (!plan || !mood) {
      return;
    }

    try {
      const saved = await createItineraryAsync({
        mood: mood as GenerateItineraryBody['mood'],
        plan,
      });
      toast.success('Itinerary saved');
      router.push(`/itineraries/${saved.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to save itinerary'));
    }
  };

  if (showExplorer && plan) {
    return (
      <section className="flex flex-col py-2 lg:min-h-0 lg:flex-1 lg:py-0">
        <ItineraryExplorer
          plan={plan}
          mapStyle={mapStyle}
          onBack={handleBackToForm}
          onSave={handleSave}
          isSaving={isSaving}
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
            <ItineraryMoodStep mood={mood} onMoodChange={setMood} />
          ) : (
            <ItineraryDestinationStep
              destinationPlace={destinationPlace}
              destinationError={destinationError}
              dateRange={dateRange}
              dateRangeError={dateRangeError}
              pace={pace}
              budget={budget}
              travelers={travelers}
              interests={interests}
              constraints={constraints}
              itineraryIdea={itineraryIdea}
              error={error}
              isGenerating={isGenerating}
              onDestinationPlaceChange={setDestinationPlace}
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

export default PlanItinerarySection;
