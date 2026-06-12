"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { type TripSort } from "./trip-sort";

type TripListContextValue = {
  query: string;
  setQuery: (value: string) => void;
  sort: TripSort;
  setSort: (value: TripSort) => void;
};

const TripListContext = createContext<TripListContextValue | null>(null);

export function TripListProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<TripSort>("newest");

  return (
    <TripListContext.Provider value={{ query, setQuery, sort, setSort }}>
      {children}
    </TripListContext.Provider>
  );
}

export function useTripListContext() {
  const context = useContext(TripListContext);
  if (!context) {
    throw new Error("useTripListContext must be used within a TripListProvider");
  }
  return context;
}