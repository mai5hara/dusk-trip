import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  TripListItem,
  TripWithEntries,
  CreateTripBody,
  CreateEntryBody,
  Entry,
} from '@mood-trip/validators';
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

  async create(userId: string, body: CreateTripBody): Promise<TripListItem> {
    const trip = await this.prisma.client.trip.create({
      data: {
        userId,
        ...body,
      },
      include: {
        _count: { select: { entries: true } },
      },
    });

    return {
      ...trip,
      entryCount: trip._count.entries,
    };
  }

  private async _assertTripOwnedByUser(
    tripId: string,
    userId: string,
  ): Promise<void> {
    const trip = await this.prisma.client.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip || trip.userId !== userId) {
      throw new NotFoundException(`Trip ${tripId} not found`);
    }
  }

  async createEntry(
    tripId: string,
    userId: string,
    body: CreateEntryBody,
  ): Promise<Entry> {
    await this._assertTripOwnedByUser(tripId, userId);

    return this.prisma.client.entry.create({
      data: {
        tripId,
        photoUrl: body.photoUrl,
        caption: body.caption ?? null,
        location: body.location ?? null,
        dayLabel: body.dayLabel ?? null,
        timeOfDay: body.timeOfDay ?? null,
        sortOrder: body.sortOrder ?? 0,
      },
    });
  }

  async createEntries(
    tripId: string,
    userId: string,
    bodies: CreateEntryBody[],
  ): Promise<Entry[]> {
    await this._assertTripOwnedByUser(tripId, userId);

    return this.prisma.client.$transaction(
      bodies.map((body) =>
        this.prisma.client.entry.create({
          data: {
            tripId,
            photoUrl: body.photoUrl,
            caption: body.caption ?? null,
            location: body.location ?? null,
            dayLabel: body.dayLabel ?? null,
            timeOfDay: body.timeOfDay ?? null,
            sortOrder: body.sortOrder ?? 0,
          },
        }),
      ),
    );
  }
}
