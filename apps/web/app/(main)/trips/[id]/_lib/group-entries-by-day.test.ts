import { describe, it, expect } from 'vitest';
import type { Entry } from '@mood-trip/validators';
import {
  formatEntryDayHeading,
  groupEntriesByDay,
} from './group-entries-by-day';

function entry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: 'entry-1',
    tripId: 'trip-1',
    photoUrl: 'https://example.com/photo.jpg',
    caption: 'Caption',
    location: 'Kyoto',
    dayLabel: '2026-06-01',
    sortOrder: 0,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('formatEntryDayHeading', () => {
  it('formats a date key with day index from trip start', () => {
    expect(
      formatEntryDayHeading('2026-06-03', 2, '2026-06-01'),
    ).toBe('Day 3 · Jun 3');
  });

  it('falls back to day label text', () => {
    expect(formatEntryDayHeading('Day 2', 1)).toBe('Day 2');
  });
});

describe('groupEntriesByDay', () => {
  it('groups multiple entries on the same day', () => {
    const groups = groupEntriesByDay(
      [
        entry({ id: 'a', dayLabel: '2026-06-01', sortOrder: 0 }),
        entry({ id: 'b', dayLabel: '2026-06-01', sortOrder: 1 }),
        entry({ id: 'c', dayLabel: '2026-06-02', sortOrder: 2 }),
      ],
      '2026-06-01',
    );

    expect(groups).toHaveLength(2);
    expect(groups[0]?.entries).toHaveLength(2);
    expect(groups[1]?.entries).toHaveLength(1);
    expect(groups[0]?.heading).toBe('Day 1 · Jun 1');
    expect(groups[1]?.heading).toBe('Day 2 · Jun 2');
  });

  it('orders day groups by date label when sortOrder collides', () => {
    const groups = groupEntriesByDay([
      entry({ id: 'd2', dayLabel: '2026-06-02', sortOrder: 0 }),
      entry({ id: 'd1a', dayLabel: '2026-06-01', sortOrder: 0 }),
      entry({ id: 'd1b', dayLabel: '2026-06-01', sortOrder: 1 }),
    ]);

    expect(groups.map((group) => group.key)).toEqual([
      '2026-06-01',
      '2026-06-02',
    ]);
  });

  it('orders Day N labels by day number', () => {
    const groups = groupEntriesByDay([
      entry({ id: 'b', dayLabel: 'Day 2', sortOrder: 5 }),
      entry({ id: 'a', dayLabel: 'Day 1', sortOrder: 9 }),
    ]);

    expect(groups.map((group) => group.key)).toEqual(['Day 1', 'Day 2']);
  });
});
