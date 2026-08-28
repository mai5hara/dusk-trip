import { describe, expect, it } from 'vitest';
import {
  destinationPlaceSchema,
  destinationSuggestionsQuerySchema,
} from './geocoding';

describe('destinationPlaceSchema', () => {
  it('accepts a resolved destination place', () => {
    const result = destinationPlaceSchema.safeParse({
      label: 'San Francisco, California, United States',
      lat: 37.7749,
      lng: -122.4194,
      countryCode: 'us',
    });

    expect(result.success).toBe(true);
  });
});

describe('destinationSuggestionsQuerySchema', () => {
  it('requires at least two characters', () => {
    const result = destinationSuggestionsQuerySchema.safeParse({ q: 'S' });

    expect(result.success).toBe(false);
  });

  it('accepts a trimmed query', () => {
    const result = destinationSuggestionsQuerySchema.safeParse({
      q: 'San Francisco',
    });

    expect(result.success).toBe(true);
  });
});
