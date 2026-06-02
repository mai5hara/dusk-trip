import { Injectable } from '@nestjs/common';
import type { User } from '@mood-trip/database';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<User[]> {
    return this.prisma.client.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}