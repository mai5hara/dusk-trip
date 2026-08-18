import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TripsService } from './trips.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  createTripBodySchema,
  createEntryBodySchema,
  createEntriesBatchBodySchema,
  planTripBodySchema,
} from '@mood-trip/validators';
import { TripPlanService } from '../ai/trip-plan.service';
@Controller('trips')
export class TripsController {
  constructor(
    private readonly tripsService: TripsService,
    private readonly tripPlanService: TripPlanService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findByUser(@Request() req: { user: { id: string } }) {
    return this.tripsService.findByUserId(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: unknown, @Request() req: { user: { id: string } }) {
    const parsed = createTripBodySchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return this.tripsService.create(req.user.id, parsed.data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('plan')
  plan(@Body() body: unknown) {
    const parsed = planTripBodySchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return this.tripPlanService.generateTripPlan(parsed.data);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':tripId/entries/batch')
  createEntries(
    @Param('tripId') tripId: string,
    @Body() body: unknown,
    @Request() req: { user: { id: string } },
  ) {
    const parsed = createEntriesBatchBodySchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return this.tripsService.createEntries(
      tripId,
      req.user.id,
      parsed.data.entries,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':tripId/entries')
  createEntry(
    @Param('tripId') tripId: string,
    @Body() body: unknown,
    @Request() req: { user: { id: string } },
  ) {
    const parsed = createEntryBodySchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return this.tripsService.createEntry(tripId, req.user.id, parsed.data);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.tripsService.findOne(id, req.user.id);
  }
}
