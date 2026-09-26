import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { AdminTripsService } from './admin-trips.service';
import { AdminTrips, adminTripsQuerySchema } from '@mood-trip/validators';

@Controller('admin/trips')
@UseGuards(AdminGuard)
export class AdminTripsController {
  constructor(private readonly adminTripsService: AdminTripsService) {}

  @Get()
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ): Promise<AdminTrips> {
    const parsed = adminTripsQuerySchema.safeParse({ page, limit, search });

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.adminTripsService.findAll(
      parsed.data.page,
      parsed.data.limit,
      parsed.data.search,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminTripsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminTripsService.remove(id);
  }
}
