export const TRIP_SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'A-Z', value: 'a-z' },
  { label: 'Z-A', value: 'z-a' },
] as const;

export type TripSort = (typeof TRIP_SORT_OPTIONS)[number]['value'];