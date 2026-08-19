import { describe, it, expect } from 'vitest';
import type { Entry } from '@mood-trip/validators';
import {
  buildDayEntries,
  eachDayInRange,
  formatDayHeading,
  groupEntriesByMonth,
  parseDateKey,
  toDateKey,
  type DayEntryFormValue,
} from './travel-period';

function day(
  dateKey: string,
  overrides: Partial<DayEntryFormValue> = {},
): DayEntryFormValue {
  return {
    clientId: `draft-${dateKey}`,
    dateKey,
    dayLabel: 'Day 1',
    timeOfDay: 'AFTERNOON',
    sortOrder: 0,
    photoUrl: '',
    caption: '',
    location: '',
    ...overrides,
  };
}

function apiEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: 'entry-1',
    tripId: 'trip-1',
    photoUrl: 'https://example.com/saved.jpg',
    caption: 'Saved caption',
    location: 'Kyoto',
    dayLabel: '2026-06-01',
    timeOfDay: 'AFTERNOON',
    sortOrder: 0,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('toDateKey / parseDateKey', () => {
  it('formats local dates as YYYY-MM-DD', () => {
    expect(toDateKey(new Date(2026, 5, 1))).toBe('2026-06-01');
    expect(toDateKey(new Date(2026, 11, 9))).toBe('2026-12-09');
  });

  it('parses a date key in local time', () => {
    const date = parseDateKey('2026-06-01');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(5);
    expect(date.getDate()).toBe(1);
  });
});

describe('eachDayInRange', () => {
  it('includes start and end dates', () => {
    const days = eachDayInRange(new Date(2026, 5, 1), new Date(2026, 5, 3));
    expect(days.map(toDateKey)).toEqual([
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
    ]);
  });

  it('returns an empty array when end is before start', () => {
    expect(eachDayInRange(new Date(2026, 5, 3), new Date(2026, 5, 1))).toEqual(
      [],
    );
  });
});

describe('buildDayEntries', () => {
  it('builds one row per day with Day labels', () => {
    const entries = buildDayEntries(new Date(2026, 5, 1), new Date(2026, 5, 3));

    expect(entries).toHaveLength(3);
    expect(entries.map((entry) => entry.dayLabel)).toEqual([
      'Day 1',
      'Day 2',
      'Day 3',
    ]);
    expect(entries.map((entry) => entry.sortOrder)).toEqual([0, 100, 200]);
  });

  it('keeps previous form values for matching dates', () => {
    const entries = buildDayEntries(
      new Date(2026, 5, 1),
      new Date(2026, 5, 2),
      [
        day('2026-06-01', {
          photoUrl: 'https://example.com/draft.jpg',
          caption: 'Draft',
        }),
      ],
    );

    expect(entries[0]?.photoUrl).toBe('https://example.com/draft.jpg');
    expect(entries[0]?.caption).toBe('Draft');
    expect(entries[1]?.photoUrl).toBe('');
  });

  it('fills from saved API entries when the form is empty', () => {
    const entries = buildDayEntries(
      new Date(2026, 5, 1),
      new Date(2026, 5, 2),
      [],
      [apiEntry({ dayLabel: '2026-06-01' })],
    );

    expect(entries[0]?.id).toBe('entry-1');
    expect(entries[0]?.photoUrl).toBe('https://example.com/saved.jpg');
    expect(entries[1]?.id).toBeUndefined();
  });

  it('keeps multiple saved memories on the same day', () => {
    const entries = buildDayEntries(
      new Date(2026, 5, 1),
      new Date(2026, 5, 1),
      [],
      [
        apiEntry({ id: 'morning', timeOfDay: 'MORNING' }),
        apiEntry({ id: 'evening', timeOfDay: 'EVENING' }),
      ],
    );

    expect(entries.map((entry) => entry.id)).toEqual(['morning', 'evening']);
    expect(entries.map((entry) => entry.timeOfDay)).toEqual([
      'MORNING',
      'EVENING',
    ]);
  });

  it('prefers previous form values over saved API entries', () => {
    const entries = buildDayEntries(
      new Date(2026, 5, 1),
      new Date(2026, 5, 1),
      [
        day('2026-06-01', {
          id: 'draft-id',
          photoUrl: 'https://example.com/draft.jpg',
        }),
      ],
      [apiEntry({ id: 'entry-1', dayLabel: '2026-06-01' })],
    );

    expect(entries[0]?.id).toBe('draft-id');
    expect(entries[0]?.photoUrl).toBe('https://example.com/draft.jpg');
  });

  it('preserves explicit empty previous values instead of falling back', () => {
    const entries = buildDayEntries(
      new Date(2026, 5, 1),
      new Date(2026, 5, 1),
      [
        day('2026-06-01', {
          photoUrl: '',
          caption: '',
          location: '',
        }),
      ],
      [apiEntry({ dayLabel: '2026-06-01' })],
    );

    expect(entries[0]?.photoUrl).toBe('');
    expect(entries[0]?.caption).toBe('');
    expect(entries[0]?.location).toBe('');
  });
});

describe('groupEntriesByMonth', () => {
  it('groups days by month in order of appearance', () => {
    const groups = groupEntriesByMonth([
      day('2026-05-31', { dayLabel: 'Day 1', sortOrder: 0 }),
      day('2026-06-01', { dayLabel: 'Day 2', sortOrder: 1 }),
      day('2026-06-02', { dayLabel: 'Day 3', sortOrder: 2 }),
    ]);

    expect(groups.map((group) => group.monthKey)).toEqual([
      '2026-05',
      '2026-06',
    ]);
    expect(groups[0]?.days).toHaveLength(1);
    expect(groups[1]?.days).toHaveLength(2);
  });
});

describe('formatDayHeading', () => {
  it('includes the day label and short date', () => {
    expect(formatDayHeading(day('2026-06-01', { dayLabel: 'Day 1' }))).toBe(
      'Day 1 · Jun 1',
    );
  });
});
