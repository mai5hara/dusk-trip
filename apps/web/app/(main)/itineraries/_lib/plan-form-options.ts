export const moodOptions = [
  { label: 'Calm', value: 'calm' },
  { label: 'Curious', value: 'curious' },
  { label: 'Energized', value: 'energized' },
  { label: 'Romantic', value: 'romantic' },
  { label: 'Restorative', value: 'restorative' },
];

export const paceOptions = [
  { label: 'Slow and spacious', value: 'slow' },
  { label: 'Balanced', value: 'balanced' },
  { label: 'Packed with plans', value: 'packed' },
];

export const budgetOptions = [
  { label: 'Budget', value: 'budget' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Premium', value: 'premium' },
  { label: 'Luxury', value: 'luxury' },
];

export const moodCopy: Record<string, string> = {
  calm: 'quiet stays, gentle walks, and places with soft edges',
  curious: 'neighborhood wandering, local food, and small cultural surprises',
  energized: 'bright cities, bold activities, and a full-day rhythm',
  romantic: 'intimate dinners, scenic views, and unhurried evenings',
  restorative: 'nature, wellness rituals, and plenty of room to recharge',
};

export function buildItineraryIdea(
  destination: string,
  mood: string,
  pace: string,
): string {
  const place = destination.trim() || 'your next destination';
  const moodText = moodCopy[mood] ?? 'the feeling you choose';
  const paceText =
    paceOptions
      .find((option) => option.value === pace)
      ?.label.toLowerCase() ?? 'balanced';

  return `Plan ${place} around ${moodText}, with a ${paceText} pace.`;
}
