import type { Entry } from '@mood-trip/validators';

export type DayEntryFormValue = {
  id?: string;
  dateKey: string;
  dayLabel: string;
  sortOrder: number;
  photoUrl: string;
  caption?: string;
  location?: string;
};

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
  };
}

function matchExistingEntry(
  dateKey: string,
  dayIndex: number,
  existingEntries: Entry[],
): Entry | undefined {
  return (
    existingEntries.find((entry) => entry.dayLabel === dateKey) ??
    existingEntries.find((entry) => entry.dayLabel === `Day ${dayIndex + 1}`) ??
    existingEntries.find((entry) => entry.sortOrder === dayIndex)
  );
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
  const previousByDate = new Map(previous.map((entry) => [entry.dateKey, entry]));

  return eachDayInRange(start, end).map((date, dayIndex) => {
    const dateKey = toDateKey(date);
    const prev = previousByDate.get(dateKey);
    const existing = matchExistingEntry(dateKey, dayIndex, existingEntries);

    return {
      id: prev?.id ?? existing?.id,
      dateKey,
      dayLabel: `Day ${dayIndex + 1}`,
      sortOrder: dayIndex,
      photoUrl: prev?.photoUrl || existing?.photoUrl || '',
      caption: prev?.caption || existing?.caption || '',
      location: prev?.location || existing?.location || '',
    };
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
    group.days.push(entry);
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
