import { distanceKm, fallbackCoords, isWithinRange } from './geocoding-utils';

describe('geocoding-utils', () => {
  const kyoto = { lat: 35.0116, lng: 135.7681 };

  it('measures great-circle distance between coordinates', () => {
    const osaka = { lat: 34.6937, lng: 135.5023 };
    // Kyoto <-> Osaka is roughly 40km.
    expect(distanceKm(kyoto, osaka)).toBeGreaterThan(35);
    expect(distanceKm(kyoto, osaka)).toBeLessThan(45);
  });

  it('accepts nearby coordinates and rejects far ones', () => {
    const toronto = { lat: 43.65, lng: -79.38 };
    expect(isWithinRange(kyoto, { lat: 35.02, lng: 135.77 }, 120)).toBe(true);
    expect(isWithinRange(kyoto, toronto, 120)).toBe(false);
  });

  it('scatters fallback pins close to the center', () => {
    const pin = fallbackCoords(kyoto, 0);
    expect(distanceKm(kyoto, pin)).toBeLessThan(5);
  });
});
