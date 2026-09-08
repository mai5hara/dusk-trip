import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { UsersService } from '../users/users.service';
import { User } from '@mood-trip/database';

@Controller('admin/users')
@UseGuards(AdminGuard)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<Omit<User, 'passwordHash' | 'googleId'>[]> {
    return this.usersService.findAll();
  }
}
