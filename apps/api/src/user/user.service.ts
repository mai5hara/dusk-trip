import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma, type User } from '@mood-trip/database';
import { PrismaService } from '../prisma/prisma.service';

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string): Promise<User | null> {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }

  async findByEmailForAuth(email: string): Promise<User | null> {
    const user = await this.prisma.client.user.findUnique({
      where: { email },
    });

    return user;
  }

  async findByIdForAuth(id: string): Promise<User | null> {
    return this.prisma.client.user.findUnique({ where: { id } });
  }

  async create(
    name: string,
    email: string,
    passwordHash: string,
  ): Promise<User> {
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

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.client.user.findUnique({ where: { googleId } });
  }

  async createWithGoogle(
    name: string,
    email: string,
    googleId: string,
  ): Promise<User> {
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
