import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminGuard } from '../auth/admin.guard';
import { UserModule } from '../user/user.module';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [AdminUsersController],
  providers: [AdminUsersService, AdminGuard],
})
export class AdminModule {}
