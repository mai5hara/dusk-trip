import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { destinationSuggestionsQuerySchema } from '@mood-trip/validators';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OpenMeteoGeocodingService } from './open-meteo-geocoding.service';

@Controller('geocoding')
export class GeocodingController {
  constructor(private readonly geocodingService: OpenMeteoGeocodingService) {}

  @UseGuards(JwtAuthGuard)
  @Get('suggestions')
  async suggestions(@Query('q') q?: string) {
    const parsed = destinationSuggestionsQuerySchema.safeParse({ q });
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const suggestions = await this.geocodingService.suggestDestinations(
      parsed.data.q,
    );

    return { suggestions };
  }
}
