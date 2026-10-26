import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';

const SUCCESS_MESSAGE = 'If that email exists, a reset link has been sent.';
const RESET_SUCCESS_MESSAGE = 'Password has been reset.';

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.userService.findByEmailForAuth(email);

    // Even if the user doesn't exist send a success message
    if (!user) {
      return { message: SUCCESS_MESSAGE };
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(rawToken, 10);

    const expiresInMs = this.parseExpiresIn(
      this.configService.get<string>('PASSWORD_RESET_EXPIRES_IN') ?? '1h',
    );
    const expiresAt = new Date(Date.now() + expiresInMs);

    // Delete ald unused tokens
    await this.prisma.client.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });

    await this.prisma.client.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const webOrigin = this.configService
      .getOrThrow<string>('WEB_ORIGIN')
      .split(',')[0]
      ?.trim();
    if (!webOrigin) {
      throw new BadRequestException('WEB_ORIGIN is not configured');
    }
    // No mailer yet: the link is only logged locally, since logs would leak the token in production.
    if (process.env.NODE_ENV !== 'production') {
      const resetUrl = `${webOrigin}/reset-password?token=${rawToken}`;
      console.log('[dev] password reset link:', resetUrl);
    }

    return { message: SUCCESS_MESSAGE };
  }

  private parseExpiresIn(value: string): number {
    const match = /^(\d+)([smhd])$/.exec(value);

    if (!match) {
      return 60 * 60 * 1000;
    }

    const amount = Number(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return amount * 1000;
      case 'm':
        return amount * 60 * 1000;
      case 'h':
        return amount * 60 * 60 * 1000;
      case 'd':
        return amount * 24 * 60 * 60 * 1000;
      default:
        return 60 * 60 * 1000;
    }
  }

  async resetPassword(
    rawToken: string,
    password: string,
  ): Promise<{ message: string }> {
    const now = new Date();

    const candidates = await this.prisma.client.passwordResetToken.findMany({
      where: {
        usedAt: null,
        expiresAt: { gt: now },
      },
    });

    let matchedToken: (typeof candidates)[number] | null = null;

    for (const candidate of candidates) {
      const isMatch = await bcrypt.compare(rawToken, candidate.tokenHash);
      if (isMatch) {
        matchedToken = candidate;
        break;
      }
    }

    if (!matchedToken) {
      throw new BadRequestException('Invalid or expired token');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await this.prisma.client.$transaction([
      this.prisma.client.user.update({
        where: { id: matchedToken.userId },
        data: { passwordHash },
      }),
      this.prisma.client.passwordResetToken.update({
        where: { id: matchedToken.id },
        data: { usedAt: now },
      }),
    ]);

    return { message: RESET_SUCCESS_MESSAGE };
  }
}
