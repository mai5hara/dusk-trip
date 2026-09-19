import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'node:path';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { TripsModule } from './trips/trips.module';
import { ItinerariesModule } from './itineraries/itineraries.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MapsModule } from './maps/maps.module';
import { AdminModule } from './admin/admin.module';
import { GeocodingModule } from './geocoding/geocoding.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '../../.env'),
    }),
    HealthModule,
    PrismaModule,
    UserModule,
    TripsModule,
    ItinerariesModule,
    AuthModule,
    MapsModule,
    AdminModule,
    GeocodingModule,
  ],
})
export class AppModule {}
