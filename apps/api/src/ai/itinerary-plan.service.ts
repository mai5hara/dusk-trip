import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  type GenerateItineraryBody,
  type GenerateItineraryResponse,
  type ItineraryPlan,
  type ItineraryPlanDraft,
  itineraryPlanSchema,
  generateItineraryResponseSchema,
  type DestinationPlace,
} from '@mood-trip/validators';
import {
  MapTilerGeocodingService,
  type Coordinates,
  type GeocodeCandidate,
} from '../geocoding/maptiler-geocoding.service';
import {
  distanceKm,
  fallbackCoords,
  isWithinRange,
} from '../geocoding/geocoding-utils';
import { WikimediaImageService } from '../images/wikimedia-image.service';
import { buildAquarelleStyle } from '../maps/maptiler-map-style';
import { getMapTilerStyleApiKey } from '../maps/maptiler-style-key';
import { ITINERARY_PLANNER, type ItineraryPlanner } from './itinerary-planner';

// A real itinerary stop should sit within day-trip range of the destination
// center. Anything beyond this is treated as a wrong geocoding match.
const MAX_STOP_DISTANCE_KM = 120;

// The AI's coordinate is only trusted as an anchor / fallback when it lands
// this close to the resolved city center; beyond that it is likely a
// hallucination and we lean on the city center instead.
const HINT_TRUST_RADIUS_KM = 60;

// When two candidates are a near tie, prefer the one that is a precise point of
// interest over a street or area centroid (expressed as a distance discount).
const POI_PREFERENCE_KM = 0.5;

type DraftDay = ItineraryPlanDraft['days'][number];
type DraftItem = DraftDay['items'][number];

@Injectable()
export class ItineraryPlanService {
  constructor(
    @Inject(ITINERARY_PLANNER)
    private readonly itineraryPlanner: ItineraryPlanner,
    private readonly geocodingService: MapTilerGeocodingService,
    private readonly imageService: WikimediaImageService,
    private readonly configService: ConfigService,
  ) {}

  async generateItinerary(
    body: GenerateItineraryBody,
  ): Promise<GenerateItineraryResponse> {
    const draft = await this.itineraryPlanner.generateItinerary(body);
    const plan = await this.enrichWithCoordinates(
      draft,
      body.destination,
      body.destinationPlace,
    );
    const apiKey = getMapTilerStyleApiKey(this.configService);

    return generateItineraryResponseSchema.parse({
      plan,
      mapStyle: buildAquarelleStyle(apiKey),
    });
  }

  private async enrichWithCoordinates(
    draft: ItineraryPlanDraft,
    destination: string,
    destinationPlace: DestinationPlace,
  ): Promise<ItineraryPlan> {
    const center: Coordinates = {
      lat: destinationPlace.lat,
      lng: destinationPlace.lng,
    };
    const country = destinationPlace.countryCode;

    // Look up Wikipedia (photo + authoritative coordinates) for every stop up
    // front, in parallel. The coordinates feed location resolution; the image
    // is attached for display.
    const places = await Promise.all(
      draft.days.map((day: DraftDay) =>
        Promise.all(
          day.items.map((item: DraftItem) =>
            this.imageService.findPlace(item.placeName, destination),
          ),
        ),
      ),
    );

    const enrichedDays = await Promise.all(
      draft.days.map((day: DraftDay, dayIndex: number) =>
        Promise.all(
          day.items.map(async (item: DraftItem, index: number) => {
            const place = places[dayIndex][index];
            const coords = await this.locateStop(
              item,
              destination,
              center,
              country,
              index,
              place.coords,
            );

            return {
              ...item,
              lat: coords.lat,
              lng: coords.lng,
              image: place.image ?? undefined,
            };
          }),
        ).then((items) => ({ ...day, items })),
      ),
    );

    return itineraryPlanSchema.parse({
      ...draft,
      center,
      days: enrichedDays,
    });
  }

  private async locateStop(
    item: DraftItem,
    destination: string,
    center: Coordinates,
    country: string | undefined,
    index: number,
    wikiCoords: Coordinates | null,
  ): Promise<Coordinates> {
    // A Wikipedia article's own coordinates are authoritative for landmarks and
    // far beat POI geocoding (which often lacks an entry for big public
    // buildings). Trust them when they sit within day-trip range.
    if (wikiCoords && isWithinRange(center, wikiCoords, MAX_STOP_DISTANCE_KM)) {
      return wikiCoords;
    }

    // The AI's own estimate, trusted only when it lands near the city center.
    const hint = trustworthyHint(item, center);

    // Parenthetical asides like "Kinkaku-ji (Golden Pavilion)" confuse the
    // geocoder, so search a cleaned variant. Each query is constrained to the
    // destination country and biased toward its center.
    const cleanedPlace = stripParentheticals(item.placeName);
    const queries = unique([
      `${cleanedPlace}, ${item.location}, ${destination}`,
      `${cleanedPlace}, ${destination}`,
      `${item.location}, ${destination}`,
    ]);

    const candidates: GeocodeCandidate[] = [];
    for (const query of queries) {
      const matches = await this.geocodingService.geocodeCandidates(query, {
        proximity: hint ?? center,
        country,
      });
      candidates.push(...matches);

      // Stop early once we have a precise POI within range — the later,
      // broader queries only add noise.
      if (
        candidates.some(
          (candidate) =>
            candidate.isPoi &&
            isWithinRange(center, candidate, MAX_STOP_DISTANCE_KM),
        )
      ) {
        break;
      }
    }

    const best = selectBestCandidate(candidates, center, hint);
    if (best) {
      return { lat: best.lat, lng: best.lng };
    }

    // No trustworthy geocode — use the AI's estimate if we have one, otherwise
    // scatter near the center so the pin stays in the right city.
    return hint ?? fallbackCoords(center, index);
  }
}

/**
 * Pick the geocoding candidate closest to the anchor (the AI hint when present,
 * else the city center), giving precise POIs a small edge over street/area
 * centroids. Candidates outside day-trip range are discarded as wrong matches.
 */
function selectBestCandidate(
  candidates: GeocodeCandidate[],
  center: Coordinates,
  hint: Coordinates | null,
): GeocodeCandidate | null {
  const anchor = hint ?? center;

  const inRange = candidates.filter((candidate) =>
    isWithinRange(center, candidate, MAX_STOP_DISTANCE_KM),
  );
  if (inRange.length === 0) {
    return null;
  }

  return inRange.reduce((best, candidate) =>
    score(candidate, anchor) < score(best, anchor) ? candidate : best,
  );
}

function score(candidate: GeocodeCandidate, anchor: Coordinates): number {
  const poiDiscount = candidate.isPoi ? POI_PREFERENCE_KM : 0;
  return distanceKm(anchor, candidate) - poiDiscount;
}

function trustworthyHint(
  item: DraftItem,
  center: Coordinates,
): Coordinates | null {
  if (typeof item.lat !== 'number' || typeof item.lng !== 'number') {
    return null;
  }

  const hint = { lat: item.lat, lng: item.lng };
  return isWithinRange(center, hint, HINT_TRUST_RADIUS_KM) ? hint : null;
}

function stripParentheticals(value: string): string {
  return value.replace(/\s*\([^)]*\)/g, '').trim();
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
