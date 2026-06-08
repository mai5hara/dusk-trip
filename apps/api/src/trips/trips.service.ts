import { Injectable, NotFoundException } from '@nestjs/common';
import type { Trip, TripWithEntries } from '@mood-trip/validators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string): Promise<Trip[]> {
    return this.prisma.client.trip.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: string): Promise<TripWithEntries> {
    const trip = await this.prisma.client.trip.findUnique({
      where: { id },
      include: {
        entries: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    
    if (!trip) {
      throw new NotFoundException(`Trip ${id} not found`);
    }

    return trip;
  }
}