import { Controller, Get, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { buildAquarelleStyle } from './maptiler-map-style';

@Controller('maps')
export class MapsController {
  constructor(private readonly configService: ConfigService) {}

  @UseGuards(JwtAuthGuard)
  @Get('itinerary-config')
  itineraryConfig() {
    const apiKey = this.configService.getOrThrow<string>('MAPTILER_API_KEY');

    return {
      mapStyle: buildAquarelleStyle(apiKey),
    };
  }
}
