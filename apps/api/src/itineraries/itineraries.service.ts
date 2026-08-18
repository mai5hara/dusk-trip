import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  moodSchema,
  plannedTripSchema,
  type CreateItineraryBody,
  type ItineraryDetail,
  type ItineraryListItem,
  type PlannedTrip,
} from '@mood-trip/validators';
import { PrismaService } from '../prisma/prisma.service';
import { buildAquarelleStyle } from '../maps/maptiler-map-style';

const listSelect = {
  id: true,
  userId: true,
  title: true,
  location: true,
  summary: true,
  thumbnailUrl: true,
  startDate: true,
  endDate: true,
  mood: true,
  dayCount: true,
  createdAt: true,
  updatedAt: true,
} as const;

function _firstImageUrl(plan: PlannedTrip): string | null {
  for (const day of plan.days) {
    for (const item of day.items) {
      if (item.image?.url) {
        return item.image.url;
      }
    }
  }

  return null;
}

function _toListItem(row: {
  id: string;
  userId: string;
  title: string;
  location: string;
  summary: string;
  thumbnailUrl: string | null;
  startDate: Date;
  endDate: Date;
  mood: string;
  dayCount: number;
  createdAt: Date;
  updatedAt: Date;
}): ItineraryListItem {
  return {
    ...row,
    mood: moodSchema.parse(row.mood),
  };
}

@Injectable()
export class ItinerariesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async findByUserId(userId: string): Promise<ItineraryListItem[]> {
    const rows = await this.prisma.client.itinerary.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: listSelect,
    });

    return rows.map(_toListItem);
  }

  async findOne(id: string, userId: string): Promise<ItineraryDetail> {
    const row = await this.prisma.client.itinerary.findUnique({
      where: { id },
    });

    if (!row || row.userId !== userId) {
      throw new NotFoundException(`Itinerary ${id} not found`);
    }

    const plan = plannedTripSchema.parse(row.plan);
    const apiKey = this.configService.getOrThrow<string>('MAPTILER_API_KEY');

    return {
      ..._toListItem(row),
      plan,
      mapStyle: buildAquarelleStyle(apiKey),
    };
  }

  async create(
    userId: string,
    body: CreateItineraryBody,
  ): Promise<ItineraryListItem> {
    const row = await this.prisma.client.itinerary.create({
      data: {
        userId,
        title: body.plan.title,
        location: body.plan.location,
        summary: body.plan.summary,
        thumbnailUrl: _firstImageUrl(body.plan),
        startDate: body.plan.startDate,
        endDate: body.plan.endDate,
        mood: body.mood,
        dayCount: body.plan.days.length,
        plan: JSON.parse(JSON.stringify(body.plan)),
      },
      select: listSelect,
    });

    return _toListItem(row);
  }
}
