import { Module } from '@nestjs/common';
import { GeocodingModule } from '../geocoding/geocoding.module';
import { ImagesModule } from '../images/images.module';
import { GeminiItineraryPlannerService } from './gemini-itinerary-planner.service';
import { ItineraryPlanService } from './itinerary-plan.service';

@Module({
  imports: [GeocodingModule, ImagesModule],
  providers: [GeminiItineraryPlannerService, ItineraryPlanService],
  exports: [ItineraryPlanService],
})
export class AiModule {}
