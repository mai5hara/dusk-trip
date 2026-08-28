import { ConfigService } from '@nestjs/config';
import { ItineraryPlanService } from './itinerary-plan.service';
import type { ItineraryPlanner } from './itinerary-planner';
import { MapTilerGeocodingService } from '../geocoding/maptiler-geocoding.service';
import { WikimediaImageService } from '../images/wikimedia-image.service';
import type {
  GenerateItineraryBody,
  ItineraryPlanDraft,
} from '@mood-trip/validators';

// No Wikipedia match is the common case in these tests; the Wikipedia lookup
// is covered separately and must never affect geocoding-based resolution.
const noImageService = {
  findPlace: jest.fn().mockResolvedValue({ image: null, coords: null }),
} as unknown as WikimediaImageService;

describe('ItineraryPlanService', () => {
  const destinationPlace = {
    label: 'Lisbon, Portugal',
    lat: 38.7223,
    lng: -9.1393,
    countryCode: 'pt',
  };

  const body: GenerateItineraryBody = {
    destination: 'Lisbon',
    destinationPlace,
    mood: 'curious',
    pace: 'balanced',
    startDate: new Date('2026-07-01'),
    endDate: new Date('2026-07-02'),
    budget: 'moderate',
    travelers: 2,
    interests: ['food', 'neighborhoods'],
    constraints: 'No rental car',
  };

  const draft: ItineraryPlanDraft = {
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
    const itineraryPlannerService = {
      generateItinerary: jest.fn().mockResolvedValue(draft),
    } as ItineraryPlanner;
    const geocodingService = {
      geocodeCandidates: jest
        .fn()
        .mockResolvedValue([
          { lat: 38.7117, lng: -9.1304, relevance: 0.9, isPoi: true },
        ]),
    } as unknown as MapTilerGeocodingService;

    const service = new ItineraryPlanService(
      itineraryPlannerService,
      geocodingService,
      noImageService,
      {
        getOrThrow: jest.fn().mockReturnValue('test-maptiler-key'),
      } as unknown as ConfigService,
    );
    const result = await service.generateItinerary(body);

    expect(result.plan.center).toEqual({ lat: 38.7223, lng: -9.1393 });
    expect(result.plan.days[0].items[0]).toMatchObject({
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
    const draftWithHint: ItineraryPlanDraft = {
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
    const itineraryPlannerService = {
      generateItinerary: jest.fn().mockResolvedValue(draftWithHint),
    } as ItineraryPlanner;
    const geocodingService = {
      geocodeCandidates: jest.fn().mockResolvedValue([
        // A nearby same-named decoy and the real venue; both within range.
        { lat: 38.74, lng: -9.16, relevance: 0.8, isPoi: true },
        { lat: 38.7152, lng: -9.1308, relevance: 0.8, isPoi: true },
      ]),
    } as unknown as MapTilerGeocodingService;

    const service = new ItineraryPlanService(
      itineraryPlannerService,
      geocodingService,
      noImageService,
      {
        getOrThrow: jest.fn().mockReturnValue('test-maptiler-key'),
      } as unknown as ConfigService,
    );
    const result = await service.generateItinerary(body);

    const stop = result.plan.days[0].items[0];
    expect(stop.lat).toBeCloseTo(38.7152, 3);
    expect(stop.lng).toBeCloseTo(-9.1308, 3);
  });

  it('falls back to the AI hint, then near-center, when no geocode is in range', async () => {
    const draftWithHint: ItineraryPlanDraft = {
      ...draft,
      days: [
        {
          ...draft.days[0],
          items: [{ ...draft.days[0].items[0], lat: 38.708, lng: -9.137 }],
        },
      ],
    };
    const itineraryPlannerService = {
      generateItinerary: jest.fn().mockResolvedValue(draftWithHint),
    } as ItineraryPlanner;
    const geocodingService = {
      geocodeCandidates: jest
        .fn()
        .mockResolvedValue([
          { lat: 43.65, lng: -79.38, relevance: 0.9, isPoi: true },
        ]),
    } as unknown as MapTilerGeocodingService;

    const service = new ItineraryPlanService(
      itineraryPlannerService,
      geocodingService,
      noImageService,
      {
        getOrThrow: jest.fn().mockReturnValue('test-maptiler-key'),
      } as unknown as ConfigService,
    );
    const result = await service.generateItinerary(body);

    const stop = result.plan.days[0].items[0];
    // The out-of-range geocode is rejected; the AI's own estimate is used.
    expect(stop.lat).toBeCloseTo(38.708, 3);
    expect(stop.lng).toBeCloseTo(-9.137, 3);
  });

  it('attaches a place image when one is found', async () => {
    const itineraryPlannerService = {
      generateItinerary: jest.fn().mockResolvedValue(draft),
    } as ItineraryPlanner;
    const geocodingService = {
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

    const service = new ItineraryPlanService(
      itineraryPlannerService,
      geocodingService,
      imageService,
      {
        getOrThrow: jest.fn().mockReturnValue('test-maptiler-key'),
      } as unknown as ConfigService,
    );
    const result = await service.generateItinerary(body);

    expect(imageService.findPlace).toHaveBeenCalledWith(
      'Miradouro de Santa Luzia',
      'Lisbon',
    );
    expect(result.plan.days[0].items[0].image).toEqual({
      url: 'https://upload.wikimedia.org/example.jpg',
      attribution: 'Miradouro de Santa Luzia',
      attributionUrl: 'https://en.wikipedia.org/wiki/Miradouro_de_Santa_Luzia',
    });
  });

  it('prefers authoritative Wikipedia coordinates over geocoding', async () => {
    const itineraryPlannerService = {
      generateItinerary: jest.fn().mockResolvedValue(draft),
    } as ItineraryPlanner;
    const geocodingService = {
      geocodeCandidates: jest
        .fn()
        .mockResolvedValue([
          { lat: 38.7, lng: -9.15, relevance: 0.9, isPoi: true },
        ]),
    } as unknown as MapTilerGeocodingService;
    const imageService = {
      // ...but Wikipedia knows the landmark's exact location.
      findPlace: jest.fn().mockResolvedValue({
        image: null,
        coords: { lat: 38.711, lng: -9.129 },
      }),
    } as unknown as WikimediaImageService;

    const service = new ItineraryPlanService(
      itineraryPlannerService,
      geocodingService,
      imageService,
      {
        getOrThrow: jest.fn().mockReturnValue('test-maptiler-key'),
      } as unknown as ConfigService,
    );
    const result = await service.generateItinerary(body);

    const stop = result.plan.days[0].items[0];
    expect(stop.lat).toBeCloseTo(38.711, 3);
    expect(stop.lng).toBeCloseTo(-9.129, 3);
    // Geocoding is not even consulted when Wikipedia has the coordinates.
    expect(geocodingService.geocodeCandidates).not.toHaveBeenCalled();
  });
});
