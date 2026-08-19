import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
  updateEntriesBatchBodySchema,
} from '@mood-trip/validators';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

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
  @Patch(':tripId/entries/batch')
  updateEntries(
    @Param('tripId') tripId: string,
    @Body() body: unknown,
    @Request() req: { user: { id: string } },
  ) {
    const parsed = updateEntriesBatchBodySchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return this.tripsService.updateEntries(
      tripId,
      req.user.id,
      parsed.data.entries,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':tripId/entries/:entryId')
  updateEntry(
    @Param('tripId') tripId: string,
    @Param('entryId') entryId: string,
    @Body() body: unknown,
    @Request() req: { user: { id: string } },
  ) {
    const parsed = createEntryBodySchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return this.tripsService.updateEntry(
      tripId,
      entryId,
      req.user.id,
      parsed.data,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.tripsService.findOne(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: unknown,
    @Request() req: { user: { id: string } },
  ) {
    const parsed = createTripBodySchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return this.tripsService.update(id, req.user.id, parsed.data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
  ): Promise<void> {
    await this.tripsService.remove(id, req.user.id);
  }
}
