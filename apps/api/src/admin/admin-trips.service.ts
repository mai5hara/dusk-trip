import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@mood-trip/database';
import type {
  AdminTripListItem,
  AdminTrips,
  AdminTripDetails,
} from '@mood-trip/validators';
import { PrismaService } from '../prisma/prisma.service';

type AdminTripOwner = {
  id: string;
  name: string;
  email: string;
};

type AdminTripListRecord = {
  id: string;
  userId: string;
  title: string;
  thumbnailUrl: string;
  description: string | null;
  location: string;
  user: AdminTripOwner;
  _count: { entries: number };
  createdAt: Date;
  updatedAt: Date;
  startDate: Date;
  endDate: Date;
};

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
      trips: trips.map((trip) => _toAdminTripListItem(trip)),
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

    const { entries, ...listRecord } = trip;

    return {
      ..._toAdminTripListItem(listRecord),
      entries: entries.map((entry) => ({
        ...entry,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString(),
      })),
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

function _toAdminTripListItem(trip: AdminTripListRecord): AdminTripListItem {
  const { user, _count, createdAt, updatedAt, startDate, endDate, ...rest } =
    trip;

  return {
    ...rest,
    owner: user,
    entryCount: _count.entries,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  };
}
