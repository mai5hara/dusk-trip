import type { Entry } from '@mood-trip/validators';
import type { DayEntryFormValue } from './create-trip-form';

export type { DayEntryFormValue };

export type MonthGroup = {
  monthKey: string;
  label: string;
  days: DayEntryFormValue[];
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Format as YYYY-MM-DD in local time. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function eachDayInRange(start: Date, end: Date): Date[] {
  const from = startOfDay(start);
  const to = startOfDay(end);
  if (to < from) return [];

  const days: Date[] = [];
  const cursor = new Date(from);
  while (cursor <= to) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function emptyDayEntry(date: Date, dayIndex: number): DayEntryFormValue {
  const dateKey = toDateKey(date);
  return {
    dateKey,
    dayLabel: `Day ${dayIndex + 1}`,
    sortOrder: dayIndex,
    photoUrl: '',
    caption: '',
    location: '',
    timeOfDay: undefined,
  };
}

function _unusedEntries(
  existingEntries: Entry[],
  usedIds: Set<string>,
): Entry[] {
  return existingEntries.filter((entry) => !entry.id || !usedIds.has(entry.id));
}

function _matchExistingEntries(
  dateKey: string,
  dayIndex: number,
  existingEntries: Entry[],
  usedIds: Set<string>,
): Entry[] {
  const unused = _unusedEntries(existingEntries, usedIds);
  const byDateKey = unused.filter((entry) => entry.dayLabel === dateKey);
  const matches =
    byDateKey.length > 0
      ? byDateKey
      : unused.filter((entry) => entry.dayLabel === `Day ${dayIndex + 1}`);

  if (matches.length > 0) {
    return [...matches].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  const bySortOrder = unused.find((entry) => entry.sortOrder === dayIndex);
  return bySortOrder ? [bySortOrder] : [];
}

function _markUsed(entries: Entry[], usedIds: Set<string>): void {
  for (const entry of entries) {
    if (entry.id) usedIds.add(entry.id);
  }
}

function _formEntryFromSaved(
  date: Date,
  dayIndex: number,
  existing: Entry,
): DayEntryFormValue {
  return {
    id: existing.id,
    dateKey: toDateKey(date),
    dayLabel: `Day ${dayIndex + 1}`,
    sortOrder: existing.sortOrder,
    photoUrl: existing.photoUrl,
    caption: existing.caption ?? '',
    location: existing.location ?? '',
    timeOfDay: existing.timeOfDay ?? undefined,
  };
}

function _formEntryFromPrevious(
  date: Date,
  dayIndex: number,
  previous: DayEntryFormValue,
): DayEntryFormValue {
  return {
    ...previous,
    dateKey: toDateKey(date),
    dayLabel: `Day ${dayIndex + 1}`,
  };
}

/**
 * Build form rows for a travel period.
 * Keeps previous form values and all API memories for each day.
 */
export function buildDayEntries(
  start: Date,
  end: Date,
  previous: DayEntryFormValue[] = [],
  existingEntries: Entry[] = [],
): DayEntryFormValue[] {
  const previousByDate = new Map<string, DayEntryFormValue[]>();
  for (const entry of previous) {
    const rows = previousByDate.get(entry.dateKey) ?? [];
    rows.push(entry);
    previousByDate.set(entry.dateKey, rows);
  }

  const usedIds = new Set<string>();

  return eachDayInRange(start, end).flatMap((date, dayIndex) => {
    const dateKey = toDateKey(date);
    const prev = previousByDate.get(dateKey);
    if (prev && prev.length > 0) {
      return prev.map((entry) => _formEntryFromPrevious(date, dayIndex, entry));
    }

    const existing = _matchExistingEntries(
      dateKey,
      dayIndex,
      existingEntries,
      usedIds,
    );
    _markUsed(existing, usedIds);

    if (existing.length > 0) {
      return existing.map((entry) =>
        _formEntryFromSaved(date, dayIndex, entry),
      );
    }

    return [emptyDayEntry(date, dayIndex)];
  });
}

export function groupEntriesByMonth(
  entries: DayEntryFormValue[],
): MonthGroup[] {
  const groups = new Map<string, MonthGroup>();

  for (const entry of entries) {
    const date = parseDateKey(entry.dateKey);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    const group = groups.get(monthKey) ?? {
      monthKey,
      label,
      days: [],
    };
    if (!group.days.some((day) => day.dateKey === entry.dateKey)) {
      group.days.push(entry);
    }
    groups.set(monthKey, group);
  }

  return [...groups.values()];
}

export function formatDayHeading(entry: DayEntryFormValue): string {
  const date = parseDateKey(entry.dateKey);
  const dateLabel = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  return `${entry.dayLabel} · ${dateLabel}`;
}
