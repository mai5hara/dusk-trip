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

export function createDayEntry(
  dateKey: string,
  dayIndex: number,
  memoryIndex = 0,
): DayEntryFormValue {
  return {
    clientId: crypto.randomUUID(),
    dateKey,
    dayLabel: `Day ${dayIndex + 1}`,
    timeOfDay: 'AFTERNOON',
    sortOrder: dayIndex * 100 + memoryIndex,
    photoUrl: '',
    caption: '',
    location: '',
  };
}

function _emptyDayEntry(date: Date, dayIndex: number): DayEntryFormValue {
  const dateKey = toDateKey(date);
  return createDayEntry(dateKey, dayIndex);
}

function _matchExistingEntries(
  dateKey: string,
  dayIndex: number,
  existingEntries: Entry[],
): Entry[] {
  const byLabel = existingEntries.filter(
    (entry) =>
      entry.dayLabel === dateKey || entry.dayLabel === `Day ${dayIndex + 1}`,
  );
  if (byLabel.length > 0) return byLabel;

  const legacyEntry = existingEntries.find(
    (entry) => entry.sortOrder === dayIndex,
  );
  return legacyEntry ? [legacyEntry] : [];
}

/**
 * Build per-day form rows for a travel period.
 * Keeps previous form values and API memories when the date still exists.
 */
export function buildDayEntries(
  start: Date,
  end: Date,
  previous: DayEntryFormValue[] = [],
  existingEntries: Entry[] = [],
): DayEntryFormValue[] {
  const validDateKeys = new Set(eachDayInRange(start, end).map(toDateKey));
  const preserved = previous.filter((entry) =>
    validDateKeys.has(entry.dateKey),
  );
  if (preserved.length > 0) {
    const preservedDates = new Set(preserved.map((entry) => entry.dateKey));
    const missingDays = eachDayInRange(start, end)
      .map((date, dayIndex) => ({ date, dayIndex }))
      .filter(({ date }) => !preservedDates.has(toDateKey(date)))
      .map(({ date, dayIndex }) => _emptyDayEntry(date, dayIndex));
    return [...preserved, ...missingDays].sort(
      (a, b) => a.dateKey.localeCompare(b.dateKey) || a.sortOrder - b.sortOrder,
    );
  }

  return eachDayInRange(start, end).flatMap((date, dayIndex) => {
    const dateKey = toDateKey(date);
    const existing = _matchExistingEntries(dateKey, dayIndex, existingEntries);

    if (existing.length === 0) return [_emptyDayEntry(date, dayIndex)];

    return existing.map((entry, memoryIndex) => ({
      clientId: entry.id,
      id: entry.id,
      dateKey,
      dayLabel: `Day ${dayIndex + 1}`,
      timeOfDay: entry.timeOfDay,
      sortOrder: dayIndex * 100 + memoryIndex,
      photoUrl: entry.photoUrl,
      caption: entry.caption ?? '',
      location: entry.location ?? '',
    }));
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
