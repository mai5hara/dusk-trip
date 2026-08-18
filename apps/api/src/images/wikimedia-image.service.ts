import { Injectable, Logger } from '@nestjs/common';
import type { ItineraryImage } from '@mood-trip/validators';

// Wikimedia asks every API client to send a descriptive User-Agent.
const USER_AGENT = 'Mood-Trip/1.0 (https://mood-trip.app; itinerary planner)';
const ENDPOINT = 'https://en.wikipedia.org/w/api.php';
const THUMB_SIZE = 800;

type Coordinates = { lat: number; lng: number };

export type WikimediaPlace = {
  image: ItineraryImage | null;
  /** Authoritative coordinates of the matched landmark, when the article has them. */
  coords: Coordinates | null;
};

type WikiPage = {
  index?: number;
  title?: string;
  fullurl?: string;
  thumbnail?: { source?: string };
  coordinates?: Array<{ lat?: number; lon?: number }>;
};

type WikiResponse = {
  query?: { pages?: Record<string, WikiPage> };
};

const EMPTY: WikimediaPlace = { image: null, coords: null };

@Injectable()
export class WikimediaImageService {
  private readonly logger = new Logger(WikimediaImageService.name);
  private readonly cache = new Map<string, WikimediaPlace>();

  /**
   * Look up a place on Wikipedia by name and return both its lead photo and its
   * coordinates. A title match is far more reliable than a coordinate match —
   * nearby articles can describe a different venue — and for landmarks the
   * article's own coordinates are far more accurate than POI geocoding.
   *
   * `context` (the destination) is NOT added to the search — appending it lets
   * the destination's own famous articles outrank the place — but its words are
   * excluded from the relevance check so a tangential match (e.g. "Kyoto
   * Animation" for "Kyoto Station Building", or "Nippori Station" for "Yanaka
   * Ginza") is rejected. Returns empty fields when there is no confident match.
   */
  async findPlace(
    placeName: string,
    context?: string,
  ): Promise<WikimediaPlace> {
    const query = placeName.trim();
    if (!query) {
      return EMPTY;
    }

    const cacheKey = query.toLowerCase();
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const place = await this.search(query, context);
    this.cache.set(cacheKey, place);
    return place;
  }

  private async search(
    query: string,
    context?: string,
  ): Promise<WikimediaPlace> {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      generator: 'search',
      gsrsearch: query,
      gsrlimit: '1',
      gsrnamespace: '0',
      prop: 'pageimages|coordinates|info',
      piprop: 'thumbnail',
      pithumbsize: String(THUMB_SIZE),
      inprop: 'url',
    });

    try {
      const response = await fetch(`${ENDPOINT}?${params}`, {
        headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
      });

      if (!response.ok) {
        this.logger.warn(
          `Wikimedia lookup failed for "${query}" (${response.status})`,
        );
        return EMPTY;
      }

      const data = (await response.json()) as WikiResponse;
      const page = firstPage(data.query?.pages);
      if (!page || !isRelevant(query, page.title, context)) {
        return EMPTY;
      }

      return {
        image: buildImage(page),
        coords: buildCoords(page),
      };
    } catch (error) {
      this.logger.warn(`Wikimedia lookup error for "${query}"`, error);
      return EMPTY;
    }
  }
}

function buildImage(page: WikiPage): ItineraryImage | null {
  const source = page.thumbnail?.source;
  if (!source) {
    return null;
  }
  return {
    url: source,
    attribution: page.title ?? 'Wikipedia',
    attributionUrl:
      page.fullurl ??
      `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title ?? '')}`,
  };
}

function buildCoords(page: WikiPage): Coordinates | null {
  const coord = page.coordinates?.[0];
  if (typeof coord?.lat !== 'number' || typeof coord?.lon !== 'number') {
    return null;
  }
  return { lat: coord.lat, lng: coord.lon };
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics (ō -> o)
    .replace(/\([^)]*\)/g, '') // drop parentheticals
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Guard against tangential search hits. The matched article must share a
 * meaningful word with the place name — ignoring the destination's own words,
 * which otherwise let "Kyoto Animation" pass for "Kyoto Station Building".
 * Substring comparison absorbs spacing/diacritic differences (e.g. "Pontocho"
 * vs "Ponto-chō").
 */
function isRelevant(
  place: string,
  title: string | undefined,
  context?: string,
): boolean {
  if (!title) {
    return false;
  }

  const stop = new Set(
    context ? normalize(context).split(' ').filter(Boolean) : [],
  );
  const significant = (value: string) =>
    normalize(value)
      .split(' ')
      .filter((token) => token.length >= 3 && !stop.has(token));

  const placeJoined = normalize(place).replace(/ /g, '');
  const titleJoined = normalize(title).replace(/ /g, '');

  return (
    significant(place).some((token) => titleJoined.includes(token)) ||
    significant(title).some((token) => placeJoined.includes(token))
  );
}

// `generator=search` returns pages keyed by id; `index` preserves rank order.
function firstPage(
  pages: Record<string, WikiPage> | undefined,
): WikiPage | null {
  if (!pages) {
    return null;
  }
  return (
    Object.values(pages).sort(
      (a, b) => (a.index ?? Infinity) - (b.index ?? Infinity),
    )[0] ?? null
  );
}
