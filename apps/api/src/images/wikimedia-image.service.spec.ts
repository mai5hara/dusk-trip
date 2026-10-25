import { WikimediaImageService } from './wikimedia-image.service';

describe('WikimediaImageService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  function mockFetch(payload: unknown, ok = true) {
    const fetchMock = jest.fn().mockResolvedValue({
      ok,
      status: ok ? 200 : 500,
      json: jest.fn().mockResolvedValue(payload),
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    return fetchMock;
  }

  it('returns the article lead image, coordinates and attribution', async () => {
    const fetchMock = mockFetch({
      query: {
        pages: {
          '246341': {
            index: 1,
            title: 'Kinkaku-ji',
            fullurl: 'https://en.wikipedia.org/wiki/Kinkaku-ji',
            thumbnail: { source: 'https://upload.wikimedia.org/golden.jpg' },
            coordinates: [{ lat: 35.0394, lon: 135.7292 }],
          },
        },
      },
    });

    const service = new WikimediaImageService();
    const place = await service.findPlace('Kinkaku-ji', 'Kyoto');

    expect(place.image).toEqual({
      url: 'https://upload.wikimedia.org/golden.jpg',
      attribution: 'Kinkaku-ji',
      attributionUrl: 'https://en.wikipedia.org/wiki/Kinkaku-ji',
    });
    expect(place.coords).toEqual({ lat: 35.0394, lng: 135.7292 });
    // Sends a descriptive User-Agent as Wikimedia requires.
    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers['User-Agent']).toContain('Dusk-Trip');
  });

  it('returns coordinates even when the article has no image', async () => {
    mockFetch({
      query: {
        pages: {
          '1': {
            index: 1,
            title: 'Tokyo Metropolitan Government Building',
            fullurl: 'https://en.wikipedia.org/wiki/Tokyo_...',
            coordinates: [{ lat: 35.6897, lon: 139.6922 }],
          },
        },
      },
    });

    const service = new WikimediaImageService();
    const place = await service.findPlace(
      'Tokyo Metropolitan Government Building',
      'Tokyo',
    );

    expect(place.image).toBeNull();
    expect(place.coords).toEqual({ lat: 35.6897, lng: 139.6922 });
  });

  it('rejects a tangential match that only shares the destination word', async () => {
    mockFetch({
      query: {
        pages: {
          '1': {
            index: 1,
            title: 'Kyoto Animation',
            thumbnail: { source: 'https://upload.wikimedia.org/kyoani.jpg' },
            coordinates: [{ lat: 34.9, lon: 135.8 }],
          },
        },
      },
    });

    const service = new WikimediaImageService();
    // "Kyoto Station Building" vs "Kyoto Animation" only overlap on "Kyoto",
    // which is the destination and therefore excluded — so nothing is returned.
    const place = await service.findPlace('Kyoto Station Building', 'Kyoto');
    expect(place.image).toBeNull();
    expect(place.coords).toBeNull();
  });

  it('rejects a nearby-but-different article (Nippori Station for Yanaka Ginza)', async () => {
    mockFetch({
      query: {
        pages: {
          '1': {
            index: 1,
            title: 'Nippori Station',
            coordinates: [{ lat: 35.7276, lon: 139.7708 }],
          },
        },
      },
    });

    const service = new WikimediaImageService();
    const place = await service.findPlace('Yanaka Ginza', 'Tokyo');
    expect(place.coords).toBeNull();
  });

  it('caches repeated lookups for the same place', async () => {
    const fetchMock = mockFetch({ query: { pages: {} } });
    const service = new WikimediaImageService();

    await service.findPlace('Nishiki Market', 'Kyoto');
    await service.findPlace('Nishiki Market', 'Kyoto');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('never throws when the request fails', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error('network')) as unknown as typeof fetch;

    const service = new WikimediaImageService();
    expect(await service.findPlace('Anywhere')).toEqual({
      image: null,
      coords: null,
    });
  });
});
