import { Test } from '@nestjs/testing';
import { Prisma } from '@mood-trip/database';
import { NotFoundException } from '@nestjs/common';
import { AdminTripsService } from './admin-trips.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdminTripsService', () => {
  let service: AdminTripsService;
  let prismaService: {
    client: {
      trip: {
        findMany: jest.Mock;
        count: jest.Mock;
        findUnique: jest.Mock;
        delete: jest.Mock;
      };
    };
  };

  beforeEach(async () => {
    prismaService = {
      client: {
        trip: {
          findMany: jest.fn(),
          count: jest.fn(),
          findUnique: jest.fn(),
          delete: jest.fn(),
        },
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AdminTripsService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get(AdminTripsService);
  });

  describe('findAll', () => {
    it('returns paginated trips', async () => {
      prismaService.client.trip.findMany.mockResolvedValue([
        {
          id: '1',
          title: 'Test Trip',
          description: 'Test Description',
          user: {
            id: '1',
            email: 'test@test.com',
            name: 'Test',
          },
          _count: {
            entries: 0,
          },
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-05'),
        },
      ]);

      prismaService.client.trip.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10, undefined);

      expect(result).toEqual({
        trips: [
          {
            id: '1',
            title: 'Test Trip',
            description: 'Test Description',
            owner: {
              id: '1',
              email: 'test@test.com',
              name: 'Test',
            },
            entryCount: 0,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            startDate: '2024-01-01T00:00:00.000Z',
            endDate: '2024-01-05T00:00:00.000Z',
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('returns paginated trips with search query', async () => {
      prismaService.client.trip.findMany.mockResolvedValue([]);
      prismaService.client.trip.count.mockResolvedValue(0);

      await service.findAll(1, 10, 'paris');

      expect(prismaService.client.trip.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { title: { contains: 'paris', mode: 'insensitive' } },
              { location: { contains: 'paris', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('passes skip and take based on page and limit', async () => {
      prismaService.client.trip.findMany.mockResolvedValue([]);

      prismaService.client.trip.count.mockResolvedValue(0);

      await service.findAll(2, 10, undefined);

      expect(prismaService.client.trip.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('returns a trip by id', async () => {
      prismaService.client.trip.findUnique.mockResolvedValue({
        id: '1',
        title: 'Test Trip',
        description: 'Test Description',
        user: {
          id: '1',
          email: 'test@test.com',
          name: 'Test',
        },
        _count: {
          entries: 10,
        },
        entries: [
          {
            id: '1',
            title: 'Test Entry',
            description: 'Test Description',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
          },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-05'),
      });

      const result = await service.findOne('1');

      expect(result).toEqual({
        id: '1',
        title: 'Test Trip',
        description: 'Test Description',
        owner: {
          id: '1',
          email: 'test@test.com',
          name: 'Test',
        },
        entryCount: 10,
        entries: [
          {
            id: '1',
            title: 'Test Entry',
            description: 'Test Description',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-05T00:00:00.000Z',
      });
    });

    it('throws a NotFoundException if the trip is not found', async () => {
      prismaService.client.trip.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('removes a trip by id', async () => {
      prismaService.client.trip.delete.mockResolvedValue(undefined);

      await service.remove('1');

      expect(prismaService.client.trip.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('throws a NotFoundException if the trip is not found', async () => {
      prismaService.client.trip.delete.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError(
          'Record to delete does not exist.',
          {
            code: 'P2025',
            clientVersion: 'test',
          },
        ),
      );

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
