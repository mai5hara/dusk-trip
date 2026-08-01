import { Module } from '@nestjs/common';
import { GeocodingModule } from '../geocoding/geocoding.module';
import { ImagesModule } from '../images/images.module';
import { GeminiTripPlannerService } from './gemini-trip-planner.service';
import { TripPlanService } from './trip-plan.service';

@Module({
  imports: [GeocodingModule, ImagesModule],
  providers: [GeminiTripPlannerService, TripPlanService],
  exports: [TripPlanService],
})
export class AiModule {}
