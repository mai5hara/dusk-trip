import { Test } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@mood-trip/database';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from './user.service';

function uniqueConstraintError(target: string) {
  return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test',
    meta: { target: [target] },
  });
}

describe('UserService', () => {
  let service: UserService;
  let prismaService: {
    client: {
      user: {
        findUnique: jest.Mock;
        create: jest.Mock;
      };
    };
  };

  beforeEach(async () => {
    prismaService = {
      client: {
        user: {
          findUnique: jest.fn(),
          create: jest.fn(),
        },
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get(UserService);
  });

  describe('findOne', () => {
    it('throws NotFoundException if user does not exist', async () => {
      prismaService.client.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns the user if found', async () => {
      prismaService.client.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
      });

      const result = await service.findOne('1');
      expect(result?.id).toBe('1');
    });
  });

  describe('create', () => {
    it('creates a user with a password hash', async () => {
      prismaService.client.user.create.mockResolvedValue({
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      });

      const result = await service.create(
        'Test User',
        'test@test.com',
        'hashed-password',
      );

      expect(result.email).toBe('test@test.com');
    });

    it('throws ConflictException when email is already taken', async () => {
      prismaService.client.user.create.mockRejectedValue(
        uniqueConstraintError('User_email_key'),
      );

      await expect(
        service.create('Test User', 'test@test.com', 'hashed-password'),
      ).rejects.toThrow(ConflictException);
    });

    it('rethrows non-unique-constraint errors unchanged', async () => {
      const dbError = new Error('connection lost');
      prismaService.client.user.create.mockRejectedValue(dbError);

      await expect(
        service.create('Test User', 'test@test.com', 'hashed-password'),
      ).rejects.toBe(dbError);
    });
  });

  describe('createWithGoogle', () => {
    it('creates a user with a google id', async () => {
      prismaService.client.user.create.mockResolvedValue({
        id: '1',
        name: 'Test User',
        email: 'test@test.com',
        googleId: 'google-1',
      });

      const result = await service.createWithGoogle(
        'Test User',
        'test@test.com',
        'google-1',
      );

      expect(result.googleId).toBe('google-1');
    });

    it('throws ConflictException when email is already taken', async () => {
      prismaService.client.user.create.mockRejectedValue(
        uniqueConstraintError('User_email_key'),
      );

      await expect(
        service.createWithGoogle('Test User', 'test@test.com', 'google-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException when google id is already taken', async () => {
      prismaService.client.user.create.mockRejectedValue(
        uniqueConstraintError('User_googleId_key'),
      );

      await expect(
        service.createWithGoogle('Test User', 'test@test.com', 'google-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('rethrows non-unique-constraint errors unchanged', async () => {
      const dbError = new Error('connection lost');
      prismaService.client.user.create.mockRejectedValue(dbError);

      await expect(
        service.createWithGoogle('Test User', 'test@test.com', 'google-1'),
      ).rejects.toBe(dbError);
    });
  });
});
