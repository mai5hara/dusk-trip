import { Injectable, Logger } from '@nestjs/common';
import type { DestinationSuggestion } from '@mood-trip/validators';

const OPEN_METEO_GEOCODING_URL =
  'https://geocoding-api.open-meteo.com/v1/search';
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_CACHE_SIZE = 5000;
const SUCCESS_CACHE_TTL_MS = 60 * 60 * 1000;
const NEGATIVE_CACHE_TTL_MS = 30 * 1000;

type OpenMeteoGeocodeResult = {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
};

type OpenMeteoGeocodeResponse = {
  results?: OpenMeteoGeocodeResult[];
};

type CacheEntry = {
  suggestions: DestinationSuggestion[];
  expiresAt: number;
};

@Injectable()
export class OpenMeteoGeocodingService {
  private readonly logger = new Logger(OpenMeteoGeocodingService.name);
  private readonly cache = new Map<string, CacheEntry>();

  /** Return population-ranked city suggestions for destination autocomplete. */
  async suggestDestinations(
    query: string,
    limit = 6,
  ): Promise<DestinationSuggestion[]> {
    const normalized = query.trim();
    if (!normalized) {
      return [];
    }

    const cacheKey = `${normalized.toLowerCase()}|${limit}`;
    const cached = this.getCached(cacheKey);
    if (cached) {
      return cached;
    }

    const params = new URLSearchParams({
      name: normalized,
      count: String(limit),
      language: 'en',
    });
    const url = `${OPEN_METEO_GEOCODING_URL}?${params.toString()}`;

    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: abortAfter(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        this.logger.warn(
          `Open-Meteo geocoding failed for "${normalized}" (${response.status})`,
        );
        this.setCached(cacheKey, [], NEGATIVE_CACHE_TTL_MS);
        return [];
      }

      const data = (await response.json()) as OpenMeteoGeocodeResponse;
      const suggestions = dedupeSuggestions(
        (data.results ?? []).map((result) => formatDestinationSuggestion(result)),
      );
      this.setCached(
        cacheKey,
        suggestions,
        suggestions.length === 0 ? NEGATIVE_CACHE_TTL_MS : SUCCESS_CACHE_TTL_MS,
      );
      return suggestions;
    } catch (error) {
      this.logger.warn(
        isAbortError(error)
          ? `Open-Meteo geocoding timed out for "${normalized}"`
          : `Open-Meteo geocoding error for "${normalized}"`,
        error,
      );
      return [];
    }
  }

  private getCached(key: string): DestinationSuggestion[] | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.suggestions;
  }

  private setCached(
    key: string,
    suggestions: DestinationSuggestion[],
    ttlMs: number,
  ): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= MAX_CACHE_SIZE) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) {
        this.cache.delete(oldest);
      }
    }
    this.cache.set(key, { suggestions, expiresAt: Date.now() + ttlMs });
  }
}

function formatDestinationSuggestion(
  result: OpenMeteoGeocodeResult,
): DestinationSuggestion {
  const context = [result.admin1, result.country]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(', ');
  const label = context ? `${result.name}, ${context}` : result.name;

  return {
    label,
    primary: result.name,
    context,
    lat: result.latitude,
    lng: result.longitude,
    countryCode: result.country_code?.toLowerCase(),
  };
}

function dedupeSuggestions(
  suggestions: DestinationSuggestion[],
): DestinationSuggestion[] {
  const seen = new Set<string>();

  return suggestions.filter((suggestion) => {
    const key = `${suggestion.label}|${suggestion.lat.toFixed(4)}|${suggestion.lng.toFixed(4)}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function abortAfter(ms: number): AbortSignal {
  if (typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms);
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

function isAbortError(error: unknown): boolean {
  return (
    (error instanceof Error &&
      (error.name === 'AbortError' || error.name === 'TimeoutError')) ||
    (typeof DOMException !== 'undefined' &&
      error instanceof DOMException &&
      error.name === 'AbortError')
  );
}
