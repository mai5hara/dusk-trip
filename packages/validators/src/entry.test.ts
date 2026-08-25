import { describe, it, expect } from 'vitest';
import {
  createEntryBodySchema,
  createEntriesBatchBodySchema,
  CREATE_ENTRIES_BATCH_MAX,
} from './entry';

describe('createEntryBodySchema', () => {
  it('accepts valid input', () => {
    const result = createEntryBodySchema.safeParse({
      photoUrl: 'https://example.com/photo.jpg',
      caption: 'Test Caption',
      location: 'Test Location',
      dayLabel: 'Test Day Label',
      timeOfDay: 'afternoon',
      sortOrder: 0,
    });

    expect(result.success).toBe(true);
  });

  it('rejects an invalid timeOfDay', () => {
    const result = createEntryBodySchema.safeParse({
      photoUrl: 'https://example.com/photo.jpg',
      timeOfDay: 'day',
    });

    expect(result.success).toBe(false);
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

describe('createEntriesBatchBodySchema', () => {
  it('accepts a non-empty entries array', () => {
    const result = createEntriesBatchBodySchema.safeParse({
      entries: [
        { photoUrl: 'https://example.com/a.jpg', sortOrder: 0 },
        { photoUrl: 'https://example.com/b.jpg', sortOrder: 1 },
      ],
    });

    expect(result.success).toBe(true);
  });

  it('rejects an empty entries array', () => {
    const result = createEntriesBatchBodySchema.safeParse({ entries: [] });
    expect(result.success).toBe(false);
  });

  it('rejects more than the batch max', () => {
    const result = createEntriesBatchBodySchema.safeParse({
      entries: Array.from({ length: CREATE_ENTRIES_BATCH_MAX + 1 }, (_, i) => ({
        photoUrl: `https://example.com/${i}.jpg`,
        sortOrder: i,
      })),
    });

    expect(result.success).toBe(false);
  });
});
