import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  TripListItem,
  TripWithEntries,
  CreateTripBody,
  CreateEntryBody,
  UpdateEntryBody,
  UpdateTripBody,
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

    return trips.map(_toTripListItem);
  }

  async findOne(id: string, userId: string): Promise<TripWithEntries> {
    const trip = await this.prisma.client.trip.findUnique({
      where: { id },
      include: {
        entries: {
          orderBy: [
            { timeOfDay: 'asc' },
            { sortOrder: 'asc' },
            { createdAt: 'asc' },
          ],
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

    return _toTripListItem(trip);
  }

  async update(
    id: string,
    userId: string,
    body: UpdateTripBody,
  ): Promise<TripListItem> {
    await this._assertTripOwnedByUser(id, userId);

    const trip = await this.prisma.client.trip.update({
      where: { id },
      data: body,
      include: {
        _count: { select: { entries: true } },
      },
    });

    return _toTripListItem(trip);
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
            ..._entryWriteData(body),
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

    const ids = bodies.map((body) => body.id);
    const existing = await this.prisma.client.entry.findMany({
      where: { tripId, id: { in: ids } },
      select: { id: true },
    });

    if (existing.length !== ids.length) {
      throw new NotFoundException(`Entry not found for trip ${tripId}`);
    }

    return this.prisma.client.$transaction(
      bodies.map((body) =>
        this.prisma.client.entry.update({
          where: { id: body.id },
          data: _entryWriteData(body),
        }),
      ),
    );
  }
}

type TripListRecord = Omit<TripListItem, 'entryCount'> & {
  _count: { entries: number };
};

function _toTripListItem(trip: TripListRecord): TripListItem {
  return {
    ...trip,
    entryCount: trip._count.entries,
  };
}

function _entryWriteData(body: CreateEntryBody | UpdateEntryBody): {
  photoUrl: string;
  caption: string | null;
  location: string | null;
  dayLabel: string | null;
  timeOfDay: CreateEntryBody['timeOfDay'] | null;
  sortOrder: number;
} {
  return {
    photoUrl: body.photoUrl,
    caption: body.caption ?? null,
    location: body.location ?? null,
    dayLabel: body.dayLabel ?? null,
    timeOfDay: body.timeOfDay ?? null,
    sortOrder: body.sortOrder ?? 0,
  };
}
