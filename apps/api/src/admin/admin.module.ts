import { Module } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { UsersModule } from '../users/users.module';
import { AdminUsersController } from './admin-users.controller';

@Module({
  imports: [AuthModule, UserModule, UsersModule],
  controllers: [AdminUsersController],
  providers: [AdminGuard],
})
export class AdminModule {}
