type Coordinates = { lat: number; lng: number };

export const REQUEST_TIMEOUT_MS = 10_000;
export const MAX_CACHE_SIZE = 5000;
export const SUCCESS_CACHE_TTL_MS = 60 * 60 * 1000;
export const NEGATIVE_CACHE_TTL_MS = 30 * 1000;

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export class TtlCache<T> {
  private readonly cache = new Map<string, CacheEntry<T>>();

  constructor(private readonly maxSize: number = MAX_CACHE_SIZE) {}

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: T, ttlMs: number): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) {
        this.cache.delete(oldest);
      }
    }
    this.cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
}

export function abortAfter(ms: number): AbortSignal {
  if (typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms);
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof Error &&
      (error.name === 'AbortError' || error.name === 'TimeoutError')) ||
    (typeof DOMException !== 'undefined' &&
      error instanceof DOMException &&
      error.name === 'AbortError')
  );
}

const EARTH_RADIUS_KM = 6371;
const METERS_PER_DEGREE = 111_320;

export function fallbackCoords(
  center: Coordinates,
  index: number,
): Coordinates {
  const angle = index * 2.1;
  const radius = 0.006 + index * 0.0025;
  return geodesicOffset(center, radius * METERS_PER_DEGREE, angle);
}

function geodesicOffset(
  center: Coordinates,
  distanceM: number,
  bearingRad: number,
): Coordinates {
  const angular = distanceM / (EARTH_RADIUS_KM * 1000);
  const lat1 = (center.lat * Math.PI) / 180;
  const lng1 = (center.lng * Math.PI) / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angular) +
      Math.cos(lat1) * Math.sin(angular) * Math.cos(bearingRad),
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angular) * Math.cos(lat1),
      Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2),
    );

  return {
    lat: clamp(radToDeg(lat2), -90, 90),
    lng: normalizeLng(radToDeg(lng2)),
  };
}

function radToDeg(value: number): number {
  return (value * 180) / Math.PI;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeLng(lng: number): number {
  const wrapped = ((((lng + 180) % 360) + 360) % 360) - 180;
  return wrapped === -180 ? 180 : wrapped;
}

/** Great-circle distance in kilometers between two coordinates. */
export function distanceKm(a: Coordinates, b: Coordinates): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * A geocoded place is trustworthy only when it lands within a sensible radius
 * of the trip's center. This rejects in-country-but-wrong matches (a same-named
 * venue in another city) that proximity biasing alone does not prevent.
 */
export function isWithinRange(
  center: Coordinates,
  candidate: Coordinates,
  maxKm: number,
): boolean {
  return distanceKm(center, candidate) <= maxKm;
}
