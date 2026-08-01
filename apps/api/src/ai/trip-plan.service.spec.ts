import { ConfigService } from '@nestjs/config';
import { TripPlanService } from './trip-plan.service';
import { GeminiTripPlannerService } from './gemini-trip-planner.service';
import { MapTilerGeocodingService } from '../geocoding/maptiler-geocoding.service';
import { WikimediaImageService } from '../images/wikimedia-image.service';
import type { PlanTripBody, PlannedTripDraft } from '@mood-trip/validators';

// No Wikipedia match is the common case in these tests; the Wikipedia lookup
// is covered separately and must never affect geocoding-based resolution.
const noImageService = {
  findPlace: jest.fn().mockResolvedValue({ image: null, coords: null }),
} as unknown as WikimediaImageService;

describe('TripPlanService', () => {
  const body: PlanTripBody = {
    destination: 'Lisbon',
    mood: 'curious',
    pace: 'balanced',
    startDate: new Date('2026-07-01'),
    endDate: new Date('2026-07-02'),
    budget: 'moderate',
    travelers: 2,
    interests: ['food', 'neighborhoods'],
    constraints: 'No rental car',
  };

  const draft: PlannedTripDraft = {
    title: 'Curious Lisbon',
    location: 'Lisbon, Portugal',
    summary: 'A food and neighborhood trip.',
    startDate: new Date('2026-07-01'),
    endDate: new Date('2026-07-02'),
    days: [
      {
        dayLabel: 'Day 1',
        theme: 'Old streets and local food',
        items: [
          {
            timeOfDay: 'morning',
            title: 'Alfama walk',
            description: 'Wander through Alfama before lunch.',
            location: 'Alfama',
            placeName: 'Miradouro de Santa Luzia',
          },
        ],
      },
    ],
  };

  it('enriches draft itinerary items with coordinates', async () => {
    const tripPlannerService = {
      generateTripPlan: jest.fn().mockResolvedValue(draft),
    } as unknown as GeminiTripPlannerService;
    const geocodingService = {
      geocodeArea: jest.fn().mockResolvedValue({
        lat: 38.7223,
        lng: -9.1393,
        countryCode: 'pt',
        bbox: [-9.5, 38.6, -9.0, 38.85],
      }),
      // Closest POI candidate resolves within range of the city center.
      geocodeCandidates: jest
        .fn()
        .mockResolvedValue([
          { lat: 38.7117, lng: -9.1304, relevance: 0.9, isPoi: true },
        ]),
    } as unknown as MapTilerGeocodingService;

    const service = new TripPlanService(
      tripPlannerService,
      geocodingService,
      noImageService,
      {
        getOrThrow: jest.fn().mockReturnValue('test-maptiler-key'),
      } as unknown as ConfigService,
    );
    const result = await service.generateTripPlan(body);

    expect(geocodingService.geocodeArea).toHaveBeenCalledWith(
      'Lisbon, Portugal',
    );
    expect(result.trip.center).toEqual({ lat: 38.7223, lng: -9.1393 });
    expect(result.trip.days[0].items[0]).toMatchObject({
      lat: 38.7117,
      lng: -9.1304,
      placeName: 'Miradouro de Santa Luzia',
    });
    // Geocoding is constrained to the destination country.
    expect(geocodingService.geocodeCandidates).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ country: 'pt' }),
    );
    expect(result.mapStyle.version).toBe(8);
    expect(result.mapStyle.sources).toHaveProperty('maptiler_planet_v4');
  });

  it('uses the AI coordinate hint to pick between geocoding candidates', async () => {
    const draftWithHint: PlannedTripDraft = {
      ...draft,
      days: [
        {
          ...draft.days[0],
          items: [
            // Hint sits right next to the second (correct) candidate.
            { ...draft.days[0].items[0], lat: 38.715, lng: -9.131 },
          ],
        },
      ],
    };
    const tripPlannerService = {
      generateTripPlan: jest.fn().mockResolvedValue(draftWithHint),
    } as unknown as GeminiTripPlannerService;
    const geocodingService = {
      geocodeArea: jest
        .fn()
        .mockResolvedValue({ lat: 38.7223, lng: -9.1393, countryCode: 'pt' }),
      geocodeCandidates: jest.fn().mockResolvedValue([
        // A nearby same-named decoy and the real venue; both within range.
        { lat: 38.74, lng: -9.16, relevance: 0.8, isPoi: true },
        { lat: 38.7152, lng: -9.1308, relevance: 0.8, isPoi: true },
      ]),
    } as unknown as MapTilerGeocodingService;

    const service = new TripPlanService(
      tripPlannerService,
      geocodingService,
      noImageService,
      {
        getOrThrow: jest.fn().mockReturnValue('test-maptiler-key'),
      } as unknown as ConfigService,
    );
    const result = await service.generateTripPlan(body);

    const stop = result.trip.days[0].items[0];
    expect(stop.lat).toBeCloseTo(38.7152, 3);
    expect(stop.lng).toBeCloseTo(-9.1308, 3);
  });

  it('falls back to the AI hint, then near-center, when no geocode is in range', async () => {
    const draftWithHint: PlannedTripDraft = {
      ...draft,
      days: [
        {
          ...draft.days[0],
          items: [{ ...draft.days[0].items[0], lat: 38.708, lng: -9.137 }],
        },
      ],
    };
    const tripPlannerService = {
      generateTripPlan: jest.fn().mockResolvedValue(draftWithHint),
    } as unknown as GeminiTripPlannerService;
    const geocodingService = {
      geocodeArea: jest
        .fn()
        .mockResolvedValue({ lat: 38.7223, lng: -9.1393, countryCode: 'pt' }),
      // A same-named match on another continent — far outside Lisbon.
      geocodeCandidates: jest
        .fn()
        .mockResolvedValue([
          { lat: 43.65, lng: -79.38, relevance: 0.9, isPoi: true },
        ]),
    } as unknown as MapTilerGeocodingService;

    const service = new TripPlanService(
      tripPlannerService,
      geocodingService,
      noImageService,
      {
        getOrThrow: jest.fn().mockReturnValue('test-maptiler-key'),
      } as unknown as ConfigService,
    );
    const result = await service.generateTripPlan(body);

    const stop = result.trip.days[0].items[0];
    // The out-of-range geocode is rejected; the AI's own estimate is used.
    expect(stop.lat).toBeCloseTo(38.708, 3);
    expect(stop.lng).toBeCloseTo(-9.137, 3);
  });

  it('attaches a place image when one is found', async () => {
    const tripPlannerService = {
      generateTripPlan: jest.fn().mockResolvedValue(draft),
    } as unknown as GeminiTripPlannerService;
    const geocodingService = {
      geocodeArea: jest
        .fn()
        .mockResolvedValue({ lat: 38.7223, lng: -9.1393, countryCode: 'pt' }),
      geocodeCandidates: jest
        .fn()
        .mockResolvedValue([
          { lat: 38.7117, lng: -9.1304, relevance: 0.9, isPoi: true },
        ]),
    } as unknown as MapTilerGeocodingService;
    const imageService = {
      findPlace: jest.fn().mockResolvedValue({
        image: {
          url: 'https://upload.wikimedia.org/example.jpg',
          attribution: 'Miradouro de Santa Luzia',
          attributionUrl:
            'https://en.wikipedia.org/wiki/Miradouro_de_Santa_Luzia',
        },
        coords: null,
      }),
    } as unknown as WikimediaImageService;

    const service = new TripPlanService(
      tripPlannerService,
      geocodingService,
      imageService,
      {
        getOrThrow: jest.fn().mockReturnValue('test-maptiler-key'),
      } as unknown as ConfigService,
    );
    const result = await service.generateTripPlan(body);

    expect(imageService.findPlace).toHaveBeenCalledWith(
      'Miradouro de Santa Luzia',
      'Lisbon',
    );
    expect(result.trip.days[0].items[0].image).toEqual({
      url: 'https://upload.wikimedia.org/example.jpg',
      attribution: 'Miradouro de Santa Luzia',
      attributionUrl: 'https://en.wikipedia.org/wiki/Miradouro_de_Santa_Luzia',
    });
  });

  it('prefers authoritative Wikipedia coordinates over geocoding', async () => {
    const tripPlannerService = {
      generateTripPlan: jest.fn().mockResolvedValue(draft),
    } as unknown as GeminiTripPlannerService;
    const geocodingService = {
      geocodeArea: jest
        .fn()
        .mockResolvedValue({ lat: 38.7223, lng: -9.1393, countryCode: 'pt' }),
      // Geocoding would resolve a (wrong) nearby POI...
      geocodeCandidates: jest
        .fn()
        .mockResolvedValue([
          { lat: 38.7, lng: -9.15, relevance: 0.9, isPoi: true },
        ]),
    } as unknown as MapTilerGeocodingService;
    const imageService = {
      // ...but Wikipedia knows the landmark's exact location.
      findPlace: jest
        .fn()
        .mockResolvedValue({
          image: null,
          coords: { lat: 38.711, lng: -9.129 },
        }),
    } as unknown as WikimediaImageService;

    const service = new TripPlanService(
      tripPlannerService,
      geocodingService,
      imageService,
      {
        getOrThrow: jest.fn().mockReturnValue('test-maptiler-key'),
      } as unknown as ConfigService,
    );
    const result = await service.generateTripPlan(body);

    const stop = result.trip.days[0].items[0];
    expect(stop.lat).toBeCloseTo(38.711, 3);
    expect(stop.lng).toBeCloseTo(-9.129, 3);
    // Geocoding is not even consulted when Wikipedia has the coordinates.
    expect(geocodingService.geocodeCandidates).not.toHaveBeenCalled();
  });
});
