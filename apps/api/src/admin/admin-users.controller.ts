import {
  Controller,
  Get,
  UseGuards,
  Query,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { AdminUsersService } from './admin-users.service';
import {
  AdminUsers,
  AdminUserDetails,
  adminUsersQuerySchema,
} from '@mood-trip/validators';

@Controller('admin/users')
@UseGuards(AdminGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
  ): Promise<AdminUsers> {
    const parsed = adminUsersQuerySchema.safeParse({ page, limit, search });

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    return this.adminUsersService.findAll(
      parsed.data.page,
      parsed.data.limit,
      parsed.data.search,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AdminUserDetails> {
    return this.adminUsersService.findOne(id);
  }
}
