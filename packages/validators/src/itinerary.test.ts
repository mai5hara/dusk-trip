import { describe, expect, it } from 'vitest';
import {
  createItineraryBodySchema,
  generateItineraryBodySchema,
  itineraryPlanSchema,
} from './itinerary';

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

describe('generateItineraryBodySchema', () => {
  it('accepts valid planning input', () => {
    const result = generateItineraryBodySchema.safeParse({
      destination: 'Lisbon',
      mood: 'curious',
      pace: 'balanced',
      startDate: '2026-07-01',
      endDate: '2026-07-04',
      budget: 'moderate',
      travelers: 2,
      interests: ['food', 'neighborhoods'],
      constraints: 'No rental car',
    });

    expect(result.success).toBe(true);
  });

  it('rejects planning input without interests', () => {
    const result = generateItineraryBodySchema.safeParse({
      destination: 'Lisbon',
      mood: 'curious',
      pace: 'balanced',
      startDate: '2026-07-01',
      endDate: '2026-07-04',
      budget: 'moderate',
      travelers: 2,
      interests: [],
    });

    expect(result.success).toBe(false);
  });
});

describe('itineraryPlanSchema', () => {
  it('accepts valid generated itinerary output', () => {
    const result = itineraryPlanSchema.safeParse(samplePlan);

    expect(result.success).toBe(true);
  });

  it('rejects invalid generated time slots', () => {
    const result = itineraryPlanSchema.safeParse({
      ...samplePlan,
      days: [
        {
          dayLabel: 'Day 1',
          theme: 'Neighborhood wandering',
          items: [
            {
              timeOfDay: 'late night',
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
    });

    expect(result.success).toBe(false);
  });
});
