import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { listTripsQuerySchema } from '@mood-trip/validators';
import { TripsService } from './trips.service';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  findByUser(@Query('userId') userId: string | undefined) {
    const parsed = listTripsQuerySchema.safeParse({ userId });

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.tripsService.findByUserId(parsed.data.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }
}
