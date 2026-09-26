import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@mood-trip/database';
import type { AdminTrips, AdminTripDetails } from '@mood-trip/validators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminTripsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page: number,
    limit: number,
    search: string | undefined,
  ): Promise<AdminTrips> {
    const where: Prisma.TripWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [trips, total] = await Promise.all([
      this.prisma.client.trip.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              entries: true,
            },
          },
        },
      }),
      this.prisma.client.trip.count({ where }),
    ]);

    return {
      trips: trips.map((trip) => {
        const { user, _count, ...rest } = trip;

        return {
          ...rest,
          owner: user,
          entryCount: _count.entries,
          createdAt: trip.createdAt.toISOString(),
          updatedAt: trip.updatedAt.toISOString(),
          startDate: trip.startDate.toISOString(),
          endDate: trip.endDate.toISOString(),
        };
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<AdminTripDetails> {
    const trip = await this.prisma.client.trip.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        entries: true,
        _count: {
          select: {
            entries: true,
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException(`Trip ${id} not found.`);
    }

    const { user, _count, ...rest } = trip;

    return {
      ...rest,
      owner: user,
      entryCount: _count.entries,
      createdAt: trip.createdAt.toISOString(),
      updatedAt: trip.updatedAt.toISOString(),
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
    };
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.client.trip.delete({ where: { id } });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException(`Trip ${id} not found.`);
      }
      throw err;
    }
  }
}
