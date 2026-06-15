'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { type TripSort } from './trip-sort';
import { type DateRangePickerValue } from '@mood-trip/ui';

type TripListContextValue = {
  query: string;
  setQuery: (value: string) => void;
  sort: TripSort;
  setSort: (value: TripSort) => void;
  dateRange: DateRangePickerValue | undefined;
  setDateRange: (value: DateRangePickerValue | undefined) => void;
};

const TripListContext = createContext<TripListContextValue | null>(null);

export function TripListProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<TripSort>('newest');
  const [dateRange, setDateRange] = useState<DateRangePickerValue | undefined>(
    undefined,
  );

  return (
    <TripListContext.Provider
      value={{ query, setQuery, sort, setSort, dateRange, setDateRange }}
    >
      {children}
    </TripListContext.Provider>
  );
}

export function useTripListContext() {
  const context = useContext(TripListContext);
  if (!context) {
    throw new Error(
      'useTripListContext must be used within a TripListProvider',
    );
  }
  return context;
}
