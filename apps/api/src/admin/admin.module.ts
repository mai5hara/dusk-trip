import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminTripsController } from './admin-trips.controller';
import { AdminTripsService } from './admin-trips.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminUsersController, AdminTripsController],
  providers: [AdminUsersService, AdminTripsService],
})
export class AdminModule {}
