import { buildAquarelleStyle } from './maptiler-map-style';

describe('buildAquarelleStyle', () => {
  const style = buildAquarelleStyle('my-key');

  it('templates the API key into source and glyph URLs', () => {
    const serialized = JSON.stringify(style);
    expect(serialized).not.toContain('__MAPTILER_KEY__');
    expect(style.glyphs).toContain('key=my-key');
  });

  it('keeps the watercolor base and the planet vector source', () => {
    expect(style.version).toBe(8);
    expect(style.sources).toHaveProperty('maptiler_planet_v4');
  });

  it('injects label layers for streets, places and food POIs', () => {
    const ids = style.layers.map((layer) => layer.id);
    expect(ids).toContain('label-street');
    expect(ids).toContain('label-city');
    expect(ids).toContain('poi-food-label');
  });

  it('reads food POI labels from the poi_food source layer', () => {
    const foodLabel = style.layers.find(
      (layer) => layer.id === 'poi-food-label',
    );
    expect(foodLabel?.['source-layer']).toBe('poi_food');
    expect(foodLabel?.source).toBe('maptiler_planet_v4');
  });

  it('labels in English by default, falling back to the local name', () => {
    const cityLabel = style.layers.find((layer) => layer.id === 'label-city');
    const textField = (cityLabel?.layout as Record<string, unknown>)[
      'text-field'
    ];
    expect(textField).toEqual([
      'coalesce',
      ['get', 'name:en'],
      ['get', 'name'],
    ]);
  });

  it('honours an explicit language override', () => {
    const frenchStyle = buildAquarelleStyle('my-key', 'fr');
    const streetLabel = frenchStyle.layers.find(
      (layer) => layer.id === 'label-street',
    );
    const textField = (streetLabel?.layout as Record<string, unknown>)[
      'text-field'
    ];
    expect(textField).toEqual([
      'coalesce',
      ['get', 'name:fr'],
      ['get', 'name'],
    ]);
  });
});
