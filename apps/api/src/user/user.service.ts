import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma, type User as PrismaUser } from '@mood-trip/database';
import type { User } from '@mood-trip/validators';
import { PrismaService } from '../prisma/prisma.service';

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
      omit: {
        passwordHash: true,
        googleId: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async findByEmailForAuth(email: string): Promise<PrismaUser | null> {
    const user = await this.prisma.client.user.findUnique({
      where: { email },
    });

    return user;
  }

  async findByIdForAuth(id: string): Promise<PrismaUser | null> {
    return this.prisma.client.user.findUnique({ where: { id } });
  }

  async create(
    name: string,
    email: string,
    passwordHash: string,
  ): Promise<PrismaUser> {
    try {
      return await this.prisma.client.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });
    } catch (error) {
      throw this.mapUniqueConstraintError(error);
    }
  }

  async findByGoogleId(googleId: string): Promise<PrismaUser | null> {
    return this.prisma.client.user.findUnique({ where: { googleId } });
  }

  async createWithGoogle(
    name: string,
    email: string,
    googleId: string,
  ): Promise<PrismaUser> {
    try {
      return await this.prisma.client.user.create({
        data: { name, email, googleId },
      });
    } catch (error) {
      throw this.mapUniqueConstraintError(error);
    }
  }

  private mapUniqueConstraintError(error: unknown): unknown {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === UNIQUE_CONSTRAINT_VIOLATION
    ) {
      return new ConflictException('User already exists');
    }

    return error;
  }
}
