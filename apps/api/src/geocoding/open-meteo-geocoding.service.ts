import { Injectable, Logger } from '@nestjs/common';
import type { DestinationSuggestion } from '@mood-trip/validators';
import {
  NEGATIVE_CACHE_TTL_MS,
  REQUEST_TIMEOUT_MS,
  SUCCESS_CACHE_TTL_MS,
  TtlCache,
  abortAfter,
  isAbortError,
} from './geocoding-utils';

const OPEN_METEO_GEOCODING_URL =
  'https://geocoding-api.open-meteo.com/v1/search';

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

@Injectable()
export class OpenMeteoGeocodingService {
  private readonly logger = new Logger(OpenMeteoGeocodingService.name);
  private readonly cache = new TtlCache<DestinationSuggestion[]>();

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
    const cached = this.cache.get(cacheKey);
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
        this.cache.set(cacheKey, [], NEGATIVE_CACHE_TTL_MS);
        return [];
      }

      const data = (await response.json()) as OpenMeteoGeocodeResponse;
      const suggestions = dedupeSuggestions(
        (data.results ?? []).map((result) =>
          formatDestinationSuggestion(result),
        ),
      );
      this.cache.set(
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
