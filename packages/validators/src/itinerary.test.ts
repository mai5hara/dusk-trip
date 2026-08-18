import { describe, expect, it } from 'vitest';
import { createItineraryBodySchema } from './itinerary';

const samplePlan = {
  title: 'Curious Lisbon',
  location: 'Lisbon, Portugal',
  summary: 'A relaxed food and neighborhood itinerary.',
  startDate: '2026-07-01',
  endDate: '2026-07-02',
  center: { lat: 38.7223, lng: -9.1393 },
  days: [
    {
      dayLabel: 'Day 1',
      theme: 'Neighborhood wandering',
      items: [
        {
          timeOfDay: 'morning',
          title: 'Alfama walk',
          description: 'Start with a slow walk through Alfama.',
          location: 'Alfama',
          placeName: 'Miradouro de Santa Luzia',
          lat: 38.7117,
          lng: -9.1304,
        },
      ],
    },
  ],
};

describe('createItineraryBodySchema', () => {
  it('accepts a generated plan with a mood', () => {
    const result = createItineraryBodySchema.safeParse({
      mood: 'curious',
      plan: samplePlan,
    });

    expect(result.success).toBe(true);
  });

  it('rejects a save without a plan', () => {
    const result = createItineraryBodySchema.safeParse({
      mood: 'curious',
    });

    expect(result.success).toBe(false);
  });
});
