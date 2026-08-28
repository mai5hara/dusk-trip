import { Module } from '@nestjs/common';
import { GeocodingController } from './geocoding.controller';
import { MapTilerGeocodingService } from './maptiler-geocoding.service';
import { OpenMeteoGeocodingService } from './open-meteo-geocoding.service';

@Module({
  controllers: [GeocodingController],
  providers: [MapTilerGeocodingService, OpenMeteoGeocodingService],
  exports: [MapTilerGeocodingService],
})
export class GeocodingModule {}
