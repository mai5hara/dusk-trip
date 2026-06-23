import { Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '@mood-trip/database';
import { PrismaService } from '../prisma/prisma.service';

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
    const user = await this.prisma.client.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    return user;
  }
}
