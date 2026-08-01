type Coordinates = { lat: number; lng: number };

export function fallbackCoords(
  center: Coordinates,
  index: number,
): Coordinates {
  const angle = index * 2.1;
  const radius = 0.006 + index * 0.0025;

  return {
    lat: center.lat + radius * Math.cos(angle),
    lng: center.lng + radius * Math.sin(angle),
  };
}

const EARTH_RADIUS_KM = 6371;

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
