import { Controller, Get, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { buildAquarelleStyle } from './maptiler-map-style';
import { getMapTilerStyleApiKey } from './maptiler-style-key';

@Controller('maps')
export class MapsController {
  constructor(private readonly configService: ConfigService) {}

  @UseGuards(JwtAuthGuard)
  @Get('itinerary-config')
  itineraryConfig() {
    const apiKey = getMapTilerStyleApiKey(this.configService);

    return {
      mapStyle: buildAquarelleStyle(apiKey),
    };
  }
}
