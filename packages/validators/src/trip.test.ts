import { describe, it, expect } from 'vitest';
import {
  createTripBodySchema,
  plannedTripSchema,
  planTripBodySchema,
} from './trip';

describe('createTripBodySchema', () => {
  it('accepts valid input', () => {
    const result = createTripBodySchema.safeParse({
      title: 'Test Trip',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      location: 'Test Location',
      startDate: new Date(),
      endDate: new Date(),
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid thumbnailUrl', () => {
    const result = createTripBodySchema.safeParse({
      title: 'Test Trip',
      thumbnailUrl: 'invalid-url',
      location: 'Test Location',
      startDate: new Date(),
      endDate: new Date(),
    });

    expect(result.success).toBe(false);
  });

  it('rejects endDate before startDate', () => {
    const result = createTripBodySchema.safeParse({
      title: 'Test Trip',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      location: 'Test Location',
      startDate: '2026-06-10',
      endDate: '2026-06-01',
    });

    expect(result.success).toBe(false);
  });
});

describe('planTripBodySchema', () => {
  it('accepts valid planning input', () => {
    const result = planTripBodySchema.safeParse({
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
    const result = planTripBodySchema.safeParse({
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

describe('plannedTripSchema', () => {
  it('accepts valid generated trip output', () => {
    const result = plannedTripSchema.safeParse({
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
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid generated time slots', () => {
    const result = plannedTripSchema.safeParse({
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
