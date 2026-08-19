import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { ItinerariesController } from './itineraries.controller';
import { ItinerariesService } from './itineraries.service';

@Module({
  imports: [AiModule],
  controllers: [ItinerariesController],
  providers: [ItinerariesService],
})
export class ItinerariesModule {}
