import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ItinerariesService } from './itineraries.service';

const samplePlan = {
  title: 'Curious Lisbon',
  location: 'Lisbon, Portugal',
  summary: 'A relaxed food and neighborhood itinerary.',
  startDate: new Date('2026-07-01'),
  endDate: new Date('2026-07-02'),
  center: { lat: 38.7223, lng: -9.1393 },
  days: [
    {
      dayLabel: 'Day 1',
      theme: 'Neighborhood wandering',
      items: [
        {
          timeOfDay: 'morning' as const,
          title: 'Alfama walk',
          description: 'Start with a slow walk through Alfama.',
          location: 'Alfama',
          placeName: 'Miradouro de Santa Luzia',
          lat: 38.7117,
          lng: -9.1304,
          image: {
            url: 'https://upload.wikimedia.org/golden.jpg',
            attribution: 'Wikipedia',
            attributionUrl: 'https://en.wikipedia.org/wiki/Lisbon',
          },
        },
      ],
    },
  ],
};

describe('ItinerariesService', () => {
  let service: ItinerariesService;
  let prismaService: {
    client: {
      itinerary: {
        findMany: jest.Mock;
        findUnique: jest.Mock;
        create: jest.Mock;
      };
    };
  };

  beforeEach(async () => {
    prismaService = {
      client: {
        itinerary: {
          findMany: jest.fn(),
          findUnique: jest.fn(),
          create: jest.fn(),
        },
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        ItinerariesService,
        { provide: PrismaService, useValue: prismaService },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('maptiler-key') },
        },
      ],
    }).compile();

    service = module.get(ItinerariesService);
  });

  it('findOne: throws when the itinerary is missing', async () => {
    prismaService.client.itinerary.findUnique.mockResolvedValue(null);

    await expect(service.findOne('itinerary-1', 'user-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('create: stores denormalized card fields from the plan', async () => {
    prismaService.client.itinerary.create.mockResolvedValue({
      id: 'itinerary-1',
      userId: 'user-1',
      title: samplePlan.title,
      location: samplePlan.location,
      summary: samplePlan.summary,
      thumbnailUrl: samplePlan.days[0].items[0].image.url,
      startDate: samplePlan.startDate,
      endDate: samplePlan.endDate,
      mood: 'curious',
      dayCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.create('user-1', {
      mood: 'curious',
      plan: samplePlan,
    });

    expect(prismaService.client.itinerary.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          title: 'Curious Lisbon',
          thumbnailUrl: 'https://upload.wikimedia.org/golden.jpg',
          dayCount: 1,
          mood: 'curious',
        }),
      }),
    );
    expect(result.dayCount).toBe(1);
  });
});
