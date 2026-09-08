import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client, type TokenPayload } from 'google-auth-library';
import { UserService } from '../user/user.service';
import type {
  AuthUser,
  LoginResponse,
  SignupResponse,
} from '@mood-trip/validators';
import type { User } from '@mood-trip/database';
import type ms from 'ms';

type JwtPayload = {
  sub: string;
  email?: string;
};

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.userService.findByEmailForAuth(email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException(`Invalid email or password`);
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException(`Invalid email or password`);
    }

    return this.issueTokenPair(user);
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userService.findByIdForAuth(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
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

    return { accessToken };
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.userService.findByIdForAuth(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    };
  }

  async signup(
    name: string,
    email: string,
    password: string,
  ): Promise<SignupResponse> {
    const user = await this.userService.findByEmailForAuth(email);

    if (user) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await this.userService.create(name, email, passwordHash);

    return this.issueTokenPair(newUser);
  }

  async googleLogin(idToken: string): Promise<LoginResponse> {
    const payload = await this.verifyGoogleIdToken(idToken);

    if (!payload.emailVerified) {
      throw new UnauthorizedException('Google email is not verified');
    }

    let user = await this.userService.findByGoogleId(payload.sub);

    if (!user) {
      const existing = await this.userService.findByEmailForAuth(payload.email);

      if (existing) {
        throw new ConflictException(
          'An account with this email already exists. Log in with your password instead.',
        );
      }

      user = await this.userService.createWithGoogle(
        payload.name ?? payload.email,
        payload.email,
        payload.sub,
      );
    }

    return this.issueTokenPair(user);
  }

  private async verifyGoogleIdToken(idToken: string): Promise<{
    sub: string;
    email: string;
    emailVerified: boolean;
    name?: string;
  }> {
    let payload: TokenPayload | undefined;

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google ID token');
    }

    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Invalid Google ID token');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified ?? false,
      name: payload.name,
    };
  }

  private async issueTokenPair(user: User): Promise<LoginResponse> {
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
        isAdmin: user.isAdmin,
      },
    };
  }
}
