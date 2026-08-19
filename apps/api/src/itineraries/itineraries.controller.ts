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
  generateItineraryBodySchema,
} from '@mood-trip/validators';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ItinerariesService } from './itineraries.service';
import { ItineraryPlanService } from '../ai/itinerary-plan.service';

@Controller('itineraries')
export class ItinerariesController {
  constructor(
    private readonly itinerariesService: ItinerariesService,
    private readonly itineraryPlanService: ItineraryPlanService,
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
  generate(@Body() body: unknown) {
    const parsed = generateItineraryBodySchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return this.itineraryPlanService.generateItinerary(parsed.data);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.itinerariesService.findOne(id, req.user.id);
  }
}
