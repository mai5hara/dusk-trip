import type { Entry } from '@mood-trip/validators';

export type EntryDayGroup = {
  key: string;
  heading: string;
  entries: Entry[];
};

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_LABEL_RE = /^Day\s+(\d+)$/i;
const TIME_OF_DAY_ORDER = {
  MORNING: 0,
  DAY: 1,
  EVENING: 2,
  NIGHT: 3,
} as const;

export function formatTimeOfDay(timeOfDay: Entry['timeOfDay']): string {
  return `${timeOfDay.charAt(0)}${timeOfDay.slice(1).toLowerCase()}`;
}

function parseDateKey(dateKey: string): Date {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toLocalDate(value: Date | string): Date {
  if (typeof value === 'string' && DATE_KEY_RE.test(value)) {
    return parseDateKey(value);
  }

  const date = value instanceof Date ? value : new Date(value);
  return startOfDay(date);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getGroupSortValue(key: string, fallbackSortOrder: number): number {
  if (DATE_KEY_RE.test(key)) {
    return parseDateKey(key).getTime();
  }

  const dayMatch = key.match(DAY_LABEL_RE);
  if (dayMatch) {
    return Number(dayMatch[1]);
  }

  const sortMatch = key.match(/^sort-(\d+)$/);
  if (sortMatch) {
    return Number(sortMatch[1]);
  }

  return fallbackSortOrder;
}

export function formatEntryDayHeading(
  dayLabel: string | null,
  sortOrder: number,
  tripStartDate?: Date | string,
): string {
  if (dayLabel && DATE_KEY_RE.test(dayLabel)) {
    const date = parseDateKey(dayLabel);
    const dateLabel = formatShortDate(date);

    if (tripStartDate) {
      const start = toLocalDate(tripStartDate);
      const dayIndex = Math.round(
        (startOfDay(date).getTime() - start.getTime()) / 86_400_000,
      );
      if (dayIndex >= 0) {
        return `Day ${dayIndex + 1} · ${dateLabel}`;
      }
    }

    return dateLabel;
  }

  if (dayLabel) {
    return dayLabel;
  }

  return `Day ${sortOrder + 1}`;
}

export function groupEntriesByDay(
  entries: Entry[],
  tripStartDate?: Date | string,
): EntryDayGroup[] {
  const groups = new Map<string, EntryDayGroup>();

  for (const entry of entries) {
    const key = entry.dayLabel ?? `sort-${entry.sortOrder}`;
    const existing = groups.get(key);

    if (existing) {
      existing.entries.push(entry);
      continue;
    }

    groups.set(key, {
      key,
      heading: formatEntryDayHeading(
        entry.dayLabel,
        entry.sortOrder,
        tripStartDate,
      ),
      entries: [entry],
    });
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      entries: [...group.entries].sort(
        (a, b) =>
          TIME_OF_DAY_ORDER[a.timeOfDay] - TIME_OF_DAY_ORDER[b.timeOfDay] ||
          a.sortOrder - b.sortOrder,
      ),
    }))
    .sort(
      (a, b) =>
        getGroupSortValue(a.key, a.entries[0]?.sortOrder ?? 0) -
        getGroupSortValue(b.key, b.entries[0]?.sortOrder ?? 0),
    );
}
