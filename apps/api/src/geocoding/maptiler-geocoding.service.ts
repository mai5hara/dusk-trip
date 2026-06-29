import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type Coordinates = { lat: number; lng: number };

// [west, south, east, north]
export type BoundingBox = [number, number, number, number];

export type AreaResult = Coordinates & {
  countryCode?: string;
  bbox?: BoundingBox;
};

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

// City-level types resolve "Kyoto" to the city, not the much larger prefecture
// centroid. Region/country are only used as a fallback for broad destinations.
const CITY_AREA_TYPES = 'place,municipality,municipal_district';
const REGION_AREA_TYPES = 'region,country';

type MapTilerGeocodeResponse = {
  features?: MapTilerFeature[];
};

@Injectable()
export class MapTilerGeocodingService {
  private readonly logger = new Logger(MapTilerGeocodingService.name);
  private readonly cache = new Map<string, MapTilerFeature[]>();

  constructor(private readonly configService: ConfigService) {}

  /**
   * Resolve a city / region to its center, country code and bounding box.
   * Uses place-level types so a city name never resolves to a same-named POI
   * on another continent.
   */
  async geocodeArea(query: string): Promise<AreaResult | null> {
    const feature =
      (await this.fetchFeature(query, { types: CITY_AREA_TYPES })) ??
      (await this.fetchFeature(query, { types: REGION_AREA_TYPES }));
    if (!feature) {
      return null;
    }

    const coords = featureCoordinates(feature);
    if (!coords) {
      return null;
    }

    return {
      ...coords,
      countryCode: extractCountryCode(feature),
      bbox: feature.bbox,
    };
  }

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
      });

      if (!response.ok) {
        this.logger.warn(
          `Geocoding failed for "${normalized}" (${response.status})`,
        );
        this.cache.set(cacheKey, []);
        return [];
      }

      const data = (await response.json()) as MapTilerGeocodeResponse;
      const features = data.features ?? [];
      this.cache.set(cacheKey, features);
      return features;
    } catch (error) {
      this.logger.warn(`Geocoding error for "${normalized}"`, error);
      this.cache.set(cacheKey, []);
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

function extractCountryCode(feature: MapTilerFeature): string | undefined {
  const fromProperties =
    typeof feature.properties?.country_code === 'string'
      ? (feature.properties.country_code as string)
      : undefined;

  const countryContext = feature.context?.find((entry) =>
    entry.id?.startsWith('country'),
  );
  const fromContext =
    countryContext?.short_code ?? countryContext?.country_code;

  const code = fromProperties ?? fromContext;
  return code ? code.toLowerCase() : undefined;
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
