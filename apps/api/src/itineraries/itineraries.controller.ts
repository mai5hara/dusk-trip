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
import {
  createItineraryBodySchema,
  planTripBodySchema,
} from '@mood-trip/validators';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ItinerariesService } from './itineraries.service';
import { TripPlanService } from '../ai/trip-plan.service';

@Controller('itineraries')
export class ItinerariesController {
  constructor(
    private readonly itinerariesService: ItinerariesService,
    private readonly tripPlanService: TripPlanService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findByUser(@Request() req: { user: { id: string } }) {
    return this.itinerariesService.findByUserId(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: unknown, @Request() req: { user: { id: string } }) {
    const parsed = createItineraryBodySchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return this.itinerariesService.create(req.user.id, parsed.data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('plan')
  plan(@Body() body: unknown) {
    const parsed = planTripBodySchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return this.tripPlanService.generateTripPlan(parsed.data);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.itinerariesService.findOne(id, req.user.id);
  }
}
