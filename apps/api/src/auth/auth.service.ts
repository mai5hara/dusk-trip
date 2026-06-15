import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import type { LoginResponse } from '@mood-trip/validators';
import type ms from 'ms';

type JwtPayload = {
  sub: string;
  email?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.userService.findByEmailForAuth(email);

    if (!user) {
      throw new UnauthorizedException(`Invalid email or password`);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException(`Invalid email or password`);
    }

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email } satisfies JwtPayload,
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.getOrThrow<ms.StringValue>(
          'JWT_ACCESS_EXPIRES_IN',
        ),
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id } satisfies JwtPayload,
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.getOrThrow<ms.StringValue>(
          'JWT_REFRESH_EXPIRES_IN',
        ),
      },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
