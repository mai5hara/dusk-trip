import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

const mockVerifyIdToken = jest.fn();

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: {
    findByEmailForAuth: jest.Mock;
    findByIdForAuth: jest.Mock;
    create: jest.Mock;
    findByGoogleId: jest.Mock;
    createWithGoogle: jest.Mock;
  };
  let jwtService: {
    signAsync: jest.Mock;
    verifyAsync: jest.Mock;
  };

  beforeEach(async () => {
    mockVerifyIdToken.mockReset();

    userService = {
      findByEmailForAuth: jest.fn(),
      findByIdForAuth: jest.fn(),
      create: jest.fn(),
      findByGoogleId: jest.fn(),
      createWithGoogle: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock-token'),
      verifyAsync: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const config: Record<string, string> = {
                JWT_ACCESS_SECRET: 'mock-access-secret',
                JWT_ACCESS_EXPIRES_IN: '1h',
                JWT_REFRESH_SECRET: 'mock-refresh-secret',
                JWT_REFRESH_EXPIRES_IN: '7d',
                GOOGLE_CLIENT_ID: 'mock-google-client-id',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('signup: throws ConflictException if user already exists', async () => {
    userService.findByEmailForAuth.mockResolvedValue({
      id: '1',
      name: 'Test User',
      email: 'test@test.com',
      passwordHash: 'hashed-password',
    });

    await expect(
      service.signup('Test User', 'test@test.com', 'password'),
    ).rejects.toThrow(ConflictException);
  });

  it('signup: creates user and returns tokens', async () => {
    userService.findByEmailForAuth.mockResolvedValue(null);
    userService.create.mockResolvedValue({
      id: 'new-id',
      email: 'new@test.com',
      passwordHash: 'hashed-password',
      name: 'New User',
    });

    const result = await service.signup('New User', 'new@test.com', 'password');
    expect(result.accessToken).toBe('mock-token');
    expect(result.user.email).toBe('new@test.com');
    expect(userService.create).toHaveBeenCalled();
  });

  it('login: throws UnauthorizedException if user not found', async () => {
    userService.findByEmailForAuth.mockResolvedValue(null);

    await expect(
      service.login('nonexistent@test.com', 'password'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('login: throws UnauthorizedException if password is incorrect', async () => {
    const passwordHash = await bcrypt.hash('password', 10);

    userService.findByEmailForAuth.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      passwordHash,
    });

    await expect(
      service.login('test@test.com', 'wrong-password'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('login: returns tokens and user if login is successful', async () => {
    const passwordHash = await bcrypt.hash('password', 10);

    userService.findByEmailForAuth.mockResolvedValue({
      id: '1',
      name: 'Test User',
      email: 'test@test.com',
      passwordHash,
    });

    const result = await service.login('test@test.com', 'password');
    expect(result.accessToken).toBe('mock-token');
    expect(result.refreshToken).toBe('mock-token');
    expect(result.user.email).toBe('test@test.com');
  });

  it('refresh: throws UnauthorizedException if refresh token is invalid', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

    await expect(service.refresh('invalid-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('refresh: throws UnauthorizedException if user not found', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: '1' });
    userService.findByIdForAuth.mockResolvedValue(null);

    await expect(service.refresh('valid-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('refresh: returns new access token if refresh is successful', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: '1' });
    userService.findByIdForAuth.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      passwordHash: 'hashed-password',
    });

    const result = await service.refresh('valid-token');
    expect(result.accessToken).toBe('mock-token');
  });

  it('getMe: throws UnauthorizedException if user not found', async () => {
    userService.findByIdForAuth.mockResolvedValue(null);

    await expect(service.getMe('1')).rejects.toThrow(UnauthorizedException);
  });

  it('getMe: returns user if getMe is successful', async () => {
    userService.findByIdForAuth.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      passwordHash: 'hashed-password',
    });

    const result = await service.getMe('1');
    expect(result.id).toBe('1');
    expect(result.email).toBe('test@test.com');
    expect(result).not.toHaveProperty('passwordHash');
  });

  describe('googleLogin', () => {
    it('throws UnauthorizedException if the ID token is invalid', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('bad token'));

      await expect(service.googleLogin('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException if the payload is missing sub or email', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({ email_verified: true }),
      });

      await expect(service.googleLogin('token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException if the Google email is not verified', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          sub: 'google-1',
          email: 'test@test.com',
          email_verified: false,
        }),
      });

      await expect(service.googleLogin('token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws ConflictException if the email already belongs to a password account', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          sub: 'google-1',
          email: 'test@test.com',
          email_verified: true,
          name: 'Test User',
        }),
      });
      userService.findByGoogleId.mockResolvedValue(null);
      userService.findByEmailForAuth.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        passwordHash: 'hashed-password',
      });

      await expect(service.googleLogin('token')).rejects.toThrow(
        ConflictException,
      );
      expect(userService.createWithGoogle).not.toHaveBeenCalled();
    });

    it('creates a new user and returns tokens for a brand-new Google account', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          sub: 'google-1',
          email: 'new@test.com',
          email_verified: true,
          name: 'New User',
        }),
      });
      userService.findByGoogleId.mockResolvedValue(null);
      userService.findByEmailForAuth.mockResolvedValue(null);
      userService.createWithGoogle.mockResolvedValue({
        id: 'new-id',
        email: 'new@test.com',
        name: 'New User',
      });

      const result = await service.googleLogin('token');

      expect(userService.createWithGoogle).toHaveBeenCalledWith(
        'New User',
        'new@test.com',
        'google-1',
      );
      expect(result.accessToken).toBe('mock-token');
      expect(result.user.email).toBe('new@test.com');
    });

    it('returns tokens for an existing Google account without creating a user', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          sub: 'google-1',
          email: 'test@test.com',
          email_verified: true,
          name: 'Test User',
        }),
      });
      userService.findByGoogleId.mockResolvedValue({
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
      });

      const result = await service.googleLogin('token');

      expect(userService.createWithGoogle).not.toHaveBeenCalled();
      expect(result.accessToken).toBe('mock-token');
      expect(result.user.email).toBe('test@test.com');
    });
  });
});
