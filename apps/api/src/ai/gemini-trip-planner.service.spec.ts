import { BadGatewayException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiTripPlannerService } from './gemini-trip-planner.service';
import type { PlanTripBody } from '@mood-trip/validators';

const generateContent = jest.fn();

describe('GeminiTripPlannerService', () => {
  let service: GeminiTripPlannerService;

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

  beforeEach(() => {
    generateContent.mockReset();

    service = new GeminiTripPlannerService({
      getOrThrow: jest.fn().mockReturnValue('test-gemini-key'),
    } as unknown as ConfigService);
    jest
      .spyOn(
        service as unknown as {
          createClient: (apiKey: string) => Promise<{
            models: { generateContent: typeof generateContent };
          }>;
        },
        'createClient',
      )
      .mockResolvedValue({ models: { generateContent } });
  });

  it('returns a validated generated trip plan', async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({
        title: 'Curious Lisbon',
        location: 'Lisbon, Portugal',
        summary: 'A food and neighborhood trip.',
        startDate: '2026-07-01',
        endDate: '2026-07-02',
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
      }),
    });

    const result = await service.generateTripPlan(body);

    expect(result.title).toBe('Curious Lisbon');
    expect(generateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gemini-2.5-flash',
        config: { responseMimeType: 'application/json' },
      }),
    );
  });

  it('retries on transient Gemini overload and eventually succeeds', async () => {
    const overloadError = Object.assign(new Error('overloaded'), { status: 503 });
    jest
      .spyOn(
        service as unknown as { sleep: (ms: number) => Promise<void> },
        'sleep',
      )
      .mockResolvedValue(undefined);

    generateContent
      .mockRejectedValueOnce(overloadError)
      .mockResolvedValueOnce({
        text: JSON.stringify({
          title: 'Curious Lisbon',
          location: 'Lisbon, Portugal',
          summary: 'A food and neighborhood trip.',
          startDate: '2026-07-01',
          endDate: '2026-07-02',
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
        }),
      });

    const result = await service.generateTripPlan(body);

    expect(result.title).toBe('Curious Lisbon');
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it('throws a friendly error when Gemini stays unavailable', async () => {
    const overloadError = Object.assign(new Error('overloaded'), { status: 503 });
    generateContent.mockRejectedValue(overloadError);
    jest
      .spyOn(
        service as unknown as { sleep: (ms: number) => Promise<void> },
        'sleep',
      )
      .mockResolvedValue(undefined);

    await expect(service.generateTripPlan(body)).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('throws if Gemini returns invalid JSON', async () => {
    generateContent.mockResolvedValue({ text: 'not json' });

    await expect(service.generateTripPlan(body)).rejects.toThrow(
      BadGatewayException,
    );
  });

  it('throws if Gemini returns an invalid trip shape', async () => {
    generateContent.mockResolvedValue({
      text: JSON.stringify({ title: 'Missing required fields' }),
    });

    await expect(service.generateTripPlan(body)).rejects.toThrow(
      BadGatewayException,
    );
  });
});
