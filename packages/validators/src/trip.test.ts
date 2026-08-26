import { describe, it, expect } from 'vitest';
import { createTripBodySchema, updateTripBodySchema } from './trip';

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

describe('updateTripBodySchema', () => {
  it('accepts a single field', () => {
    const result = updateTripBodySchema.safeParse({ title: 'Updated' });

    expect(result.success).toBe(true);
  });

  it('accepts a full payload', () => {
    const result = updateTripBodySchema.safeParse({
      title: 'Test Trip',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      location: 'Test Location',
      startDate: new Date(),
      endDate: new Date(),
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid thumbnailUrl when present', () => {
    const result = updateTripBodySchema.safeParse({
      thumbnailUrl: 'invalid-url',
    });

    expect(result.success).toBe(false);
  });

  it('rejects endDate before startDate when both dates are present', () => {
    const result = updateTripBodySchema.safeParse({
      startDate: '2026-06-10',
      endDate: '2026-06-01',
    });

    expect(result.success).toBe(false);
  });
});
