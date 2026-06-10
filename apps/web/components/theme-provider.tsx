"use client";

import { useEffect } from "react";
import { initTheme } from "@mood-trip/ui";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initTheme();
  }, []);

  return children;
}