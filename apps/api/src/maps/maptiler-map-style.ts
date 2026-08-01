import { aquarelleV4BaseStyle } from './aquarelle-v4.base';

const KEY_TOKEN = '__MAPTILER_KEY__';
const PLANET_SOURCE = 'maptiler_planet_v4';

const TEXT_FONT_REGULAR = ['Noto Sans Regular'];
const TEXT_FONT_ITALIC = ['Noto Sans Italic'];
const TEXT_FONT_BOLD = ['Noto Sans Bold'];

// Default label language. The planet_v4 tiles localize names as `name:<lang>`
// (e.g. name:en -> "Kyoto"), falling back to the local `name` when a place has
// no translation.
const DEFAULT_LANGUAGE = 'en';

type StyleLayer = Record<string, unknown>;

// Prefer the requested language, then the local name as a fallback.
function nameField(language: string) {
  return ['coalesce', ['get', `name:${language}`], ['get', 'name']];
}

/**
 * The aquarelle-v4 vector style ships without any text — it is a deliberately
 * label-free watercolor base. Its `maptiler_planet_v4` source, however, carries
 * the full label schema (poi_food, road_label, place_label, ...). These symbol
 * layers surface streets, places, and points of interest (cafes, restaurants,
 * sights, shops) on top of the watercolor canvas.
 */
function buildLabelLayers(name: unknown): StyleLayer[] {
  return [
    // --- Streets / roads -----------------------------------------------------
    {
      id: 'label-street',
      type: 'symbol',
      source: PLANET_SOURCE,
      'source-layer': 'road_label',
      minzoom: 13,
      filter: ['has', 'name'],
      layout: {
        'symbol-placement': 'line',
        'text-field': name,
        'text-font': TEXT_FONT_REGULAR,
        'text-size': ['interpolate', ['linear'], ['zoom'], 13, 10, 18, 13],
        'text-letter-spacing': 0.02,
        'text-max-angle': 30,
        'symbol-spacing': 280,
      },
      paint: {
        'text-color': '#6b6358',
        'text-halo-color': 'rgba(255,253,247,0.9)',
        'text-halo-width': 1.4,
      },
    },

    // --- Points of interest --------------------------------------------------
    // Each POI gets a soft category-tinted dot plus a label. Food/drink is warm,
    // sights are sage, culture is plum, shopping is clay.
    ...buildPoiLayers('poi-food', 'poi_food', '#b4541f', 15, name),
    ...buildPoiLayers('poi-tourism', 'poi_tourism', '#5a7d62', 14, name),
    ...buildPoiLayers('poi-culture', 'poi_culture', '#7d6491', 14, name),
    ...buildPoiLayers('poi-shopping', 'poi_shopping', '#9a6a4f', 15, name),

    // --- Water bodies --------------------------------------------------------
    {
      id: 'label-water',
      type: 'symbol',
      source: PLANET_SOURCE,
      'source-layer': 'water_label',
      minzoom: 9,
      filter: ['has', 'name'],
      layout: {
        'text-field': name,
        'text-font': TEXT_FONT_ITALIC,
        'text-size': ['interpolate', ['linear'], ['zoom'], 9, 11, 16, 14],
        'text-max-width': 6,
      },
      paint: {
        'text-color': '#5a7d9a',
        'text-halo-color': 'rgba(255,253,247,0.85)',
        'text-halo-width': 1.2,
      },
    },

    // --- Neighbourhoods / suburbs / localities -------------------------------
    {
      id: 'label-place',
      type: 'symbol',
      source: PLANET_SOURCE,
      'source-layer': 'place_label',
      minzoom: 11,
      filter: ['has', 'name'],
      layout: {
        'text-field': name,
        'text-font': TEXT_FONT_REGULAR,
        'text-size': ['interpolate', ['linear'], ['zoom'], 11, 11, 16, 15],
        'text-letter-spacing': 0.04,
        'text-transform': 'uppercase',
        'text-max-width': 7,
      },
      paint: {
        'text-color': '#7a7064',
        'text-halo-color': 'rgba(255,253,247,0.9)',
        'text-halo-width': 1.3,
      },
    },

    // --- Towns ---------------------------------------------------------------
    {
      id: 'label-town',
      type: 'symbol',
      source: PLANET_SOURCE,
      'source-layer': 'town_label',
      minzoom: 7,
      filter: ['has', 'name'],
      layout: {
        'text-field': name,
        'text-font': TEXT_FONT_REGULAR,
        'text-size': ['interpolate', ['linear'], ['zoom'], 7, 12, 13, 16],
        'text-max-width': 8,
      },
      paint: {
        'text-color': '#534b42',
        'text-halo-color': 'rgba(255,253,247,0.95)',
        'text-halo-width': 1.4,
      },
    },

    // --- Cities --------------------------------------------------------------
    {
      id: 'label-city',
      type: 'symbol',
      source: PLANET_SOURCE,
      'source-layer': 'city_label',
      minzoom: 4,
      maxzoom: 14,
      filter: ['has', 'name'],
      layout: {
        'text-field': name,
        'text-font': TEXT_FONT_BOLD,
        'text-size': ['interpolate', ['linear'], ['zoom'], 4, 12, 10, 18],
        'text-max-width': 8,
      },
      paint: {
        'text-color': '#3f382f',
        'text-halo-color': 'rgba(255,253,247,0.95)',
        'text-halo-width': 1.6,
      },
    },
  ];
}

// Text-only POI labels (no marker dots) so the watercolor map stays uncluttered.
function buildPoiLayers(
  idPrefix: string,
  sourceLayer: string,
  color: string,
  minzoom: number,
  name: unknown,
): StyleLayer[] {
  return [
    {
      id: `${idPrefix}-label`,
      type: 'symbol',
      source: PLANET_SOURCE,
      'source-layer': sourceLayer,
      minzoom: minzoom + 1,
      filter: ['has', 'name'],
      layout: {
        'text-field': name,
        'text-font': TEXT_FONT_REGULAR,
        'text-size': [
          'interpolate',
          ['linear'],
          ['zoom'],
          minzoom + 1,
          10,
          18,
          13,
        ],
        'text-max-width': 8,
        'text-optional': true,
      },
      paint: {
        'text-color': color,
        'text-halo-color': 'rgba(255,253,247,0.95)',
        'text-halo-width': 1.3,
      },
    },
  ];
}

/**
 * Build the full aquarelle-v4 map style: the watercolor base plus injected
 * label layers, with the API key templated into the source and glyph URLs.
 * Labels are rendered in `language` (defaults to English), falling back to each
 * place's local name when no translation exists.
 */
export function buildAquarelleStyle(
  apiKey: string,
  language: string = DEFAULT_LANGUAGE,
) {
  const serialized = JSON.stringify(aquarelleV4BaseStyle).replaceAll(
    KEY_TOKEN,
    apiKey,
  );
  const base = JSON.parse(serialized) as {
    version: number;
    glyphs?: string;
    sprite?: string;
    sources: Record<string, unknown>;
    layers: StyleLayer[];
  };

  return {
    ...base,
    layers: [...base.layers, ...buildLabelLayers(nameField(language))],
  };
}
