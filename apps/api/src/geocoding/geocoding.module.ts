import { Module } from '@nestjs/common';
import { MapTilerGeocodingService } from './maptiler-geocoding.service';

@Module({
  providers: [MapTilerGeocodingService],
  exports: [MapTilerGeocodingService],
})
export class GeocodingModule {}
