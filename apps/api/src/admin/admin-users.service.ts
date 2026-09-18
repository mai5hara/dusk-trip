import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@mood-trip/database';
import type { AdminUsers, AdminUserDetails } from '@mood-trip/validators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page: number,
    limit: number,
    search: string | undefined,
  ): Promise<AdminUsers> {
    const where: Prisma.UserWhereInput = {
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const users = await this.prisma.client.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
      where,
      omit: {
        passwordHash: true,
        googleId: true,
      },
    });

    const total = await this.prisma.client.user.count({
      where,
    });

    return {
      users: users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<AdminUserDetails> {
    const user = await this.prisma.client.user.findUnique({
      where: {
        id,
      },
      include: {
        _count: { select: { trips: true, itineraries: true } },
      },
      omit: {
        passwordHash: true,
        googleId: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    const { _count, ...rest } = user;

    return {
      ...rest,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      tripCount: _count.trips,
      itineraryCount: _count.itineraries,
    };
  }
}
