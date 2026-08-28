import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  NEGATIVE_CACHE_TTL_MS,
  REQUEST_TIMEOUT_MS,
  SUCCESS_CACHE_TTL_MS,
  TtlCache,
  abortAfter,
  isAbortError,
} from './geocoding-utils';

export type Coordinates = { lat: number; lng: number };

// [west, south, east, north]
export type BoundingBox = [number, number, number, number];

export type GeocodeOptions = {
  proximity?: Coordinates;
  /** ISO 3166-1 alpha-2 codes, comma separated, to restrict results. */
  country?: string;
  /** Restrict results to this bounding box. */
  bbox?: BoundingBox;
  /** Override the feature types searched. */
  types?: string;
  limit?: number;
};

/** A single geocoding match with the signals needed to rank it. */
export type GeocodeCandidate = Coordinates & {
  /** MapTiler relevance score, 0-1. */
  relevance: number;
  /** True when the match is a precise point of interest (not a street/area). */
  isPoi: boolean;
};

type MapTilerFeature = {
  center?: [number, number];
  geometry?: { coordinates?: [number, number] };
  bbox?: BoundingBox;
  place_type?: string[];
  relevance?: number;
  properties?: Record<string, unknown>;
  context?: Array<{
    id?: string;
    short_code?: string;
    country_code?: string;
    text?: string;
  }>;
};

type MapTilerGeocodeResponse = {
  features?: MapTilerFeature[];
};

@Injectable()
export class MapTilerGeocodingService {
  private readonly logger = new Logger(MapTilerGeocodingService.name);
  private readonly cache = new TtlCache<MapTilerFeature[]>();

  constructor(private readonly configService: ConfigService) {}

  async geocode(
    query: string,
    options?: GeocodeOptions,
  ): Promise<Coordinates | null> {
    const feature = await this.fetchFeature(query, options);
    return feature ? featureCoordinates(feature) : null;
  }

  /**
   * Return several ranked candidates so the caller can choose the best match
   * (e.g. nearest an AI hint, preferring points of interest) rather than
   * trusting the single top result.
   */
  async geocodeCandidates(
    query: string,
    options?: GeocodeOptions,
  ): Promise<GeocodeCandidate[]> {
    const features = await this.fetchFeatures(query, {
      ...options,
      limit: options?.limit ?? 5,
    });

    return features
      .map((feature) => {
        const coords = featureCoordinates(feature);
        if (!coords) {
          return null;
        }
        return {
          ...coords,
          relevance: feature.relevance ?? 0,
          isPoi: feature.place_type?.includes('poi') ?? false,
        } satisfies GeocodeCandidate;
      })
      .filter((candidate): candidate is GeocodeCandidate => candidate !== null);
  }

  private async fetchFeature(
    query: string,
    options?: GeocodeOptions,
  ): Promise<MapTilerFeature | null> {
    const features = await this.fetchFeatures(query, options);
    return features[0] ?? null;
  }

  private async fetchFeatures(
    query: string,
    options?: GeocodeOptions,
  ): Promise<MapTilerFeature[]> {
    const normalized = query.trim();
    if (!normalized) {
      return [];
    }

    const cacheKey = buildCacheKey(normalized, options);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const apiKey = this.configService.getOrThrow<string>('MAPTILER_API_KEY');
    const encoded = encodeURIComponent(normalized);
    const params = new URLSearchParams({
      key: apiKey,
      limit: String(options?.limit ?? 1),
      types: options?.types ?? 'poi,address,street,place',
    });

    if (options?.proximity) {
      params.set(
        'proximity',
        `${options.proximity.lng},${options.proximity.lat}`,
      );
    }

    if (options?.country) {
      params.set('country', options.country);
    }

    if (options?.bbox) {
      params.set('bbox', options.bbox.join(','));
    }

    const url = `https://api.maptiler.com/geocoding/${encoded}.json?${params}`;

    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: abortAfter(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        this.logger.warn(
          `Geocoding failed for "${normalized}" (${response.status})`,
        );
        this.cache.set(cacheKey, [], NEGATIVE_CACHE_TTL_MS);
        return [];
      }

      const data = (await response.json()) as MapTilerGeocodeResponse;
      const features = data.features ?? [];
      this.cache.set(
        cacheKey,
        features,
        features.length === 0 ? NEGATIVE_CACHE_TTL_MS : SUCCESS_CACHE_TTL_MS,
      );
      return features;
    } catch (error) {
      this.logger.warn(
        isAbortError(error)
          ? `Geocoding timed out for "${normalized}"`
          : `Geocoding error for "${normalized}"`,
        error,
      );
      return [];
    }
  }
}

function featureCoordinates(feature: MapTilerFeature): Coordinates | null {
  const coords = feature.center ?? feature.geometry?.coordinates;
  if (!coords) {
    return null;
  }
  return { lat: coords[1], lng: coords[0] };
}

function buildCacheKey(query: string, options?: GeocodeOptions): string {
  const proximity = options?.proximity
    ? `${options.proximity.lat.toFixed(2)},${options.proximity.lng.toFixed(2)}`
    : '';
  return [
    query.toLowerCase(),
    options?.types ?? '',
    options?.country ?? '',
    options?.bbox?.join(',') ?? '',
    proximity,
    String(options?.limit ?? 1),
  ].join('|');
}
