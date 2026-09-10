import { Injectable } from '@nestjs/common';
import type { User } from '@mood-trip/database';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Omit<User, 'passwordHash' | 'googleId'>[]> {
    return this.prisma.client.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      omit: {
        passwordHash: true,
        googleId: true,
      },
    });
  }
}
