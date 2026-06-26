import { describe, it, expect } from 'vitest';
import { createEntryBodySchema } from './entry';

describe('createEntryBodySchema', () => {
  it('accepts valid input', () => {
    const result = createEntryBodySchema.safeParse({
      photoUrl: 'https://example.com/photo.jpg',
      caption: 'Test Caption',
      location: 'Test Location',
      dayLabel: 'Test Day Label',
      sortOrder: 0,
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid input', () => {
    const result = createEntryBodySchema.safeParse({
      photoUrl: 'invalid-url',
      caption: 'Test Caption',
      location: 'Test Location',
      dayLabel: 'Test Day Label',
      sortOrder: 0,
    });

    expect(result.success).toBe(false);
  });

  it('accepts photoUrl only', () => {
    const result = createEntryBodySchema.safeParse({
      photoUrl: 'https://example.com/photo.jpg',
    });

    expect(result.success).toBe(true);
  });
});
