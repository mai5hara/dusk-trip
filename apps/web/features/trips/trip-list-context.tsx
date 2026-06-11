"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type TripListContextValue = {
  query: string;
  setQuery: (value: string) => void;
};

const TripListContext = createContext<TripListContextValue | null>(null);

export function TripListProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  return (
    <TripListContext.Provider value={{ query, setQuery }}>
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