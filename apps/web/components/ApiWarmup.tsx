'use client';

import { useEffect } from 'react';

// Wakes the API (Render free tier sleeps after 15 min idle) as soon as the page loads.
export function ApiWarmup() {
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) return;
    fetch(`${baseUrl}/health`).catch(() => {});
  }, []);

  return null;
}
