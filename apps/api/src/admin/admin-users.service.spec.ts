import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminUsersService } from './admin-users.service';

describe('AdminUsersService', () => {
  let service: AdminUsersService;
  let prismaService: {
    client: {
      user: {
        findMany: jest.Mock;
        count: jest.Mock;
        findUnique: jest.Mock;
      };
    };
  };

  beforeEach(async () => {
    prismaService = {
      client: {
        user: {
          findMany: jest.fn(),
          count: jest.fn(),
          findUnique: jest.fn(),
        },
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get(AdminUsersService);
  });

  describe('findAll', () => {
    it('returns paginated users', async () => {
      prismaService.client.user.findMany.mockResolvedValue([
        {
          id: '1',
          email: 'test@test.com',
          name: 'Test',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          isAdmin: false,
        },
      ]);

      prismaService.client.user.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10, undefined);

      expect(result).toEqual({
        users: [
          {
            id: '1',
            email: 'test@test.com',
            name: 'Test',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            isAdmin: false,
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('passes skip and take based on page and limit', async () => {
      prismaService.client.user.findMany.mockResolvedValue([]);
      prismaService.client.user.count.mockResolvedValue(0);

      await service.findAll(2, 10, undefined);

      expect(prismaService.client.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException if the user does not exist', async () => {
      prismaService.client.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });

    it('returns the user if it exists', async () => {
      prismaService.client.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        name: 'Test',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isAdmin: false,
        _count: {
          trips: 0,
          itineraries: 0,
        },
      });

      const result = await service.findOne('1');

      expect(result).toEqual({
        id: '1',
        email: 'test@test.com',
        name: 'Test',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        isAdmin: false,
        tripCount: 0,
        itineraryCount: 0,
      });
    });
  });
});
