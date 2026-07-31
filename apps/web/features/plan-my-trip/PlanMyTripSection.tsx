'use client';

import { useMemo, useState, type FormEvent } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DateRangePicker,
  Input,
  Label,
  Select,
  type DateRangePickerValue,
} from '@mood-trip/ui';
import { SparklesIcon } from 'lucide-react';
import type {
  ItineraryMapStyle,
  PlannedTrip,
  PlanTripBody,
} from '@mood-trip/validators';
import { planTrip } from './api';
import TripItineraryExplorer from './TripItineraryExplorer';

const moodOptions = [
  { label: 'Calm', value: 'calm' },
  { label: 'Curious', value: 'curious' },
  { label: 'Energized', value: 'energized' },
  { label: 'Romantic', value: 'romantic' },
  { label: 'Restorative', value: 'restorative' },
];

const paceOptions = [
  { label: 'Slow and spacious', value: 'slow' },
  { label: 'Balanced', value: 'balanced' },
  { label: 'Packed with plans', value: 'packed' },
];

const budgetOptions = [
  { label: 'Budget', value: 'budget' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Premium', value: 'premium' },
  { label: 'Luxury', value: 'luxury' },
];

const moodCopy: Record<string, string> = {
  calm: 'quiet stays, gentle walks, and places with soft edges',
  curious: 'neighborhood wandering, local food, and small cultural surprises',
  energized: 'bright cities, bold activities, and a full-day rhythm',
  romantic: 'intimate dinners, scenic views, and unhurried evenings',
  restorative: 'nature, wellness rituals, and plenty of room to recharge',
};

const PlanMyTripSection = () => {
  const [mood, setMood] = useState('calm');
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

  const handleBackToForm = () => {
    setShowExplorer(false);
    setIsFormExiting(false);
    window.setTimeout(() => {
      setPlannedTrip(null);
      setMapStyle(null);
    }, 450);
  };

  const tripIdea = useMemo(() => {
    const place = destination.trim() || 'your next destination';
    const moodText = moodCopy[mood] ?? moodCopy.calm;
    const paceText =
      paceOptions
        .find((option) => option.value === pace)
        ?.label.toLowerCase() ?? 'balanced';

    return `Plan ${place} around ${moodText}, with a ${paceText} pace.`;
  }, [destination, mood, pace]);

  const handleDateRangeChange = (value: DateRangePickerValue | undefined) => {
    setDateRange(value);
    if (value?.from && value?.to) {
      setDateRangeError(undefined);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
      }, 450);
    } catch {
      setError(
        'Could not generate a trip plan. Check your inputs and try again.',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section
      className={
        showExplorer
          ? 'flex flex-col py-4 lg:min-h-0 lg:flex-1 lg:py-6'
          : 'py-10'
      }
    >
      {showExplorer && plannedTrip ? (
        <TripItineraryExplorer
          trip={plannedTrip}
          mapStyle={mapStyle}
          onBack={handleBackToForm}
        />
      ) : (
        <Card
          className={`mx-auto max-w-5xl transition-all duration-500 ease-out ${
            isFormExiting ? 'form-exit pointer-events-none' : ''
          }`}
        >
          <CardHeader>
            <CardTitle>Plan My Trip</CardTitle>
            <CardDescription>
              Pick the feeling first, then shape a trip around it.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2 md:col-span-1">
                  <Label htmlFor="mood">Mood</Label>
                  <Select
                    variant="border"
                    rounded="lg"
                    options={moodOptions}
                    value={mood}
                    onValueChange={setMood}
                    placeholder="Choose a mood"
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-1">
                  <Label htmlFor="pace">Pace</Label>
                  <Select
                    variant="border"
                    rounded="lg"
                    options={paceOptions}
                    value={pace}
                    onValueChange={setPace}
                    placeholder="Choose a pace"
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-1">
                  <Label htmlFor="destination">Destination</Label>
                  <Input
                    id="destination"
                    variant="border"
                    rounded="lg"
                    value={destination}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setDestination(event.target.value)
                    }
                    placeholder="Kyoto, Lisbon, Big Sur..."
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="tripDates">Trip dates</Label>
                  <DateRangePicker
                    id="tripDates"
                    variant="border"
                    rounded="lg"
                    value={dateRange}
                    onValueChange={handleDateRangeChange}
                    placeholder="Select trip dates"
                    numberOfMonths={2}
                    errorMessage={dateRangeError}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="budget">Budget</Label>
                  <Select
                    variant="border"
                    rounded="lg"
                    options={budgetOptions}
                    value={budget}
                    onValueChange={setBudget}
                    placeholder="Choose a budget"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="travelers">Travelers</Label>
                  <Input
                    id="travelers"
                    type="number"
                    min="1"
                    max="12"
                    variant="border"
                    rounded="lg"
                    value={travelers}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setTravelers(event.target.value)
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="interests">Interests</Label>
                  <Input
                    id="interests"
                    variant="border"
                    rounded="lg"
                    value={interests}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setInterests(event.target.value)
                    }
                    placeholder="food, art, hikes, markets..."
                    required
                  />
                  <p className="text-xs opacity-60">
                    Separate interests with commas.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="constraints">Constraints</Label>
                  <textarea
                    id="constraints"
                    className="min-h-24 rounded-lg border bg-transparent px-3 py-2 text-sm"
                    value={constraints}
                    onChange={(event) => setConstraints(event.target.value)}
                    placeholder="No driving, vegetarian food, kid-friendly..."
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-dashed p-5">
                <p className="text-sm uppercase tracking-[0.2em] opacity-70">
                  Mood brief
                </p>
                <p className="mt-3 text-xl">{tripIdea}</p>
              </div>

              {error ? <p className="text-sm text-red-500">{error}</p> : null}

              <Button
                type="submit"
                variant="accent"
                rounded="full"
                className="self-start"
                disabled={isGenerating}
              >
                <SparklesIcon className="size-4" />
                {isGenerating ? 'Generating...' : 'Generate trip'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default PlanMyTripSection;
