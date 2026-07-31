import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  type PlanTripBody,
  type PlanTripResponse,
  type PlannedTrip,
  type PlannedTripDraft,
  plannedTripSchema,
  planTripResponseSchema,
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
import { GeminiTripPlannerService } from './gemini-trip-planner.service';

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

type DraftDay = PlannedTripDraft['days'][number];
type DraftItem = DraftDay['items'][number];

@Injectable()
export class TripPlanService {
  constructor(
    private readonly tripPlannerService: GeminiTripPlannerService,
    private readonly geocodingService: MapTilerGeocodingService,
    private readonly imageService: WikimediaImageService,
    private readonly configService: ConfigService,
  ) {}

  async generateTripPlan(body: PlanTripBody): Promise<PlanTripResponse> {
    const draft = await this.tripPlannerService.generateTripPlan(body);
    const trip = await this.enrichWithCoordinates(draft, body.destination);
    const apiKey = this.configService.getOrThrow<string>('MAPTILER_API_KEY');

    return planTripResponseSchema.parse({
      trip,
      mapStyle: buildAquarelleStyle(apiKey),
    });
  }

  private async enrichWithCoordinates(
    draft: PlannedTripDraft,
    destination: string,
  ): Promise<PlannedTrip> {
    const area =
      (await this.geocodingService.geocodeArea(draft.location)) ??
      (await this.geocodingService.geocodeArea(destination));

    if (!area) {
      throw new BadRequestException(
        `Could not resolve a map center for "${destination}".`,
      );
    }

    const center: Coordinates = { lat: area.lat, lng: area.lng };
    const country = area.countryCode;

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

    const enrichedDays = [];

    for (const [dayIndex, day] of draft.days.entries()) {
      const enrichedItems = [];

      for (const [index, item] of day.items.entries()) {
        const place = places[dayIndex][index];
        const coords = await this.locateStop(
          item,
          destination,
          center,
          country,
          index,
          place.coords,
        );

        enrichedItems.push({
          ...item,
          lat: coords.lat,
          lng: coords.lng,
          image: place.image ?? undefined,
        });
      }

      enrichedDays.push({
        ...day,
        items: enrichedItems,
      });
    }

    return plannedTripSchema.parse({
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
