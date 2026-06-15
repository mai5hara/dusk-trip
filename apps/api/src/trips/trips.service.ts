import { Injectable, NotFoundException } from '@nestjs/common';
import type { TripListItem, TripWithEntries } from '@mood-trip/validators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<TripListItem[]> {
    const trips = await this.prisma.client.trip.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
      include: {
        _count: { select: { entries: true } },
      },
    });

    return trips.map((trip) => ({
      ...trip,
      entryCount: trip._count.entries,
    }));
  }

  async findOne(id: string, userId: string): Promise<TripWithEntries> {
    const trip = await this.prisma.client.trip.findUnique({
      where: { id },
      include: {
        entries: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!trip || trip.userId !== userId) {
      throw new NotFoundException(`Trip ${id} not found`);
    }

    return trip;
  }
}
