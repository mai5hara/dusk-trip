import { OpenMeteoGeocodingService } from './open-meteo-geocoding.service';

describe('OpenMeteoGeocodingService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('formats population-ranked destination suggestions', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            name: 'San Francisco',
            latitude: 37.77493,
            longitude: -122.41942,
            country: 'United States',
            country_code: 'US',
            admin1: 'California',
          },
          {
            name: 'San Francisco',
            latitude: 8.53556,
            longitude: 125.95,
            country: 'Philippines',
            country_code: 'PH',
            admin1: 'Caraga',
          },
        ],
      }),
    } as Response);

    const service = new OpenMeteoGeocodingService();
    const suggestions = await service.suggestDestinations('San Francisco');

    expect(suggestions).toEqual([
      {
        label: 'San Francisco, California, United States',
        primary: 'San Francisco',
        context: 'California, United States',
        lat: 37.77493,
        lng: -122.41942,
        countryCode: 'us',
      },
      {
        label: 'San Francisco, Caraga, Philippines',
        primary: 'San Francisco',
        context: 'Caraga, Philippines',
        lat: 8.53556,
        lng: 125.95,
        countryCode: 'ph',
      },
    ]);
  });

  it('deduplicates identical suggestions', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            name: 'San Francisco',
            latitude: 8.53556,
            longitude: 125.95,
            country: 'Philippines',
            country_code: 'PH',
            admin1: 'Caraga',
          },
          {
            name: 'San Francisco',
            latitude: 8.53556,
            longitude: 125.95,
            country: 'Philippines',
            country_code: 'PH',
            admin1: 'Caraga',
          },
        ],
      }),
    } as Response);

    const service = new OpenMeteoGeocodingService();
    const suggestions = await service.suggestDestinations('San Francisco');

    expect(suggestions).toHaveLength(1);
  });
});
