import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  TripListItem,
  TripWithEntries,
  CreateTripBody,
  CreateEntryBody,
  UpdateEntryBody,
  Entry,
} from '@mood-trip/validators';
import { PrismaService } from '../prisma/prisma.service';

function _isPrismaRecordNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2025'
  );
}

function _entryWriteData(body: CreateEntryBody): {
  photoUrl: string;
  caption: string | null;
  location: string | null;
  dayLabel: string | null;
  timeOfDay?: CreateEntryBody['timeOfDay'];
  sortOrder?: number;
} {
  return {
    photoUrl: body.photoUrl,
    caption: body.caption ?? null,
    location: body.location ?? null,
    dayLabel: body.dayLabel ?? null,
    ...(body.timeOfDay ? { timeOfDay: body.timeOfDay } : {}),
    ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
  };
}

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

  async update(
    id: string,
    userId: string,
    body: CreateTripBody,
  ): Promise<TripListItem> {
    await this._assertTripOwnedByUser(id, userId);

    const trip = await this.prisma.client.trip.update({
      where: { id },
      data: body,
      include: {
        _count: { select: { entries: true } },
      },
    });

    return {
      ...trip,
      entryCount: trip._count.entries,
    };
  }

  async remove(id: string, userId: string): Promise<void> {
    await this._assertTripOwnedByUser(id, userId);
    await this.prisma.client.trip.delete({ where: { id } });
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
        ..._entryWriteData(body),
        sortOrder: body.sortOrder ?? 0,
      },
    });
  }

  async updateEntry(
    tripId: string,
    entryId: string,
    userId: string,
    body: CreateEntryBody,
  ): Promise<Entry> {
    await this._assertTripOwnedByUser(tripId, userId);

    try {
      return await this.prisma.client.entry.update({
        where: { id: entryId, tripId },
        data: _entryWriteData(body),
      });
    } catch (error) {
      if (_isPrismaRecordNotFound(error)) {
        throw new NotFoundException(`Entry ${entryId} not found`);
      }
      throw error;
    }
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
            ..._entryWriteData(body),
            sortOrder: body.sortOrder ?? 0,
          },
        }),
      ),
    );
  }

  async updateEntries(
    tripId: string,
    userId: string,
    bodies: UpdateEntryBody[],
  ): Promise<Entry[]> {
    await this._assertTripOwnedByUser(tripId, userId);

    try {
      return await this.prisma.client.$transaction(
        bodies.map((body) =>
          this.prisma.client.entry.update({
            where: { id: body.id, tripId },
            data: _entryWriteData(body),
          }),
        ),
      );
    } catch (error) {
      if (_isPrismaRecordNotFound(error)) {
        throw new NotFoundException(`Entry not found for trip ${tripId}`);
      }
      throw error;
    }
  }
}
