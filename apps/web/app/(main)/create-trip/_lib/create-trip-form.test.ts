import { describe, it, expect } from 'vitest';
import { albumModeSchema, entryFormSchema, toDate } from './create-trip-form';

const validNewTrip = {
  title: 'Kyoto Spring',
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
  location: 'Kyoto',
  startDate: new Date('2026-06-01'),
  endDate: new Date('2026-06-03'),
};

describe('albumModeSchema', () => {
  it('accepts new and existing', () => {
    expect(albumModeSchema.safeParse('new').success).toBe(true);
    expect(albumModeSchema.safeParse('existing').success).toBe(true);
  });

  it('rejects unknown modes', () => {
    expect(albumModeSchema.safeParse('other').success).toBe(false);
  });
});

describe('entryFormSchema', () => {
  it('accepts a new album with valid trip fields', () => {
    const result = entryFormSchema.safeParse({
      albumMode: 'new',
      tripId: '',
      entries: [],
      newTrip: validNewTrip,
    });

    expect(result.success).toBe(true);
  });

  it('accepts an existing album when tripId is set', () => {
    const result = entryFormSchema.safeParse({
      albumMode: 'existing',
      tripId: 'trip-1',
      entries: [],
    });

    expect(result.success).toBe(true);
  });

  it('requires tripId for an existing album', () => {
    const result = entryFormSchema.safeParse({
      albumMode: 'existing',
      tripId: '',
      entries: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'tripId')).toBe(
        true,
      );
    }
  });

  it('validates newTrip fields when creating a new album', () => {
    const result = entryFormSchema.safeParse({
      albumMode: 'new',
      tripId: '',
      entries: [],
      newTrip: {
        ...validNewTrip,
        title: '',
        thumbnailUrl: 'not-a-url',
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join('.'));
      expect(paths).toContain('newTrip.title');
      expect(paths).toContain('newTrip.thumbnailUrl');
    }
  });

  it('skips entry validation when photoUrl is empty', () => {
    const result = entryFormSchema.safeParse({
      albumMode: 'existing',
      tripId: 'trip-1',
      entries: [
        {
          dateKey: '2026-06-01',
          dayLabel: 'Day 1',
          sortOrder: 0,
          photoUrl: '',
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it('rejects entries with an invalid photoUrl', () => {
    const result = entryFormSchema.safeParse({
      albumMode: 'existing',
      tripId: 'trip-1',
      entries: [
        {
          dateKey: '2026-06-01',
          dayLabel: 'Day 1',
          sortOrder: 0,
          photoUrl: 'not-a-url',
        },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) => issue.path[0] === 'entries' && issue.path[1] === 0,
        ),
      ).toBe(true);
    }
  });

  it('accepts entries with a valid photoUrl', () => {
    const result = entryFormSchema.safeParse({
      albumMode: 'existing',
      tripId: 'trip-1',
      entries: [
        {
          dateKey: '2026-06-01',
          dayLabel: 'Day 1',
          sortOrder: 0,
          photoUrl: 'https://example.com/photo.jpg',
          caption: 'First morning',
        },
      ],
    });

    expect(result.success).toBe(true);
  });
});

describe('toDate', () => {
  it('returns undefined for empty values', () => {
    expect(toDate(undefined)).toBeUndefined();
  });

  it('returns undefined for invalid strings', () => {
    expect(toDate('not-a-date')).toBeUndefined();
  });

  it('parses date strings', () => {
    const date = toDate('2026-06-01T00:00:00');
    expect(date).toBeInstanceOf(Date);
    expect(date?.getFullYear()).toBe(2026);
  });

  it('returns Date values as-is', () => {
    const input = new Date(2026, 5, 1);
    expect(toDate(input)).toBe(input);
  });
});
