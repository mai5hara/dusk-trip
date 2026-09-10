import { Test } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserService } from '../user/user.service';

function _mockContext(userId: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: userId } }),
    }),
  } as ExecutionContext;
}

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let userService: { findByIdForAuth: jest.Mock };

  beforeEach(async () => {
    userService = {
      findByIdForAuth: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [AdminGuard, { provide: UserService, useValue: userService }],
    }).compile();

    guard = module.get(AdminGuard);
  });

  it('returns true when user is admin', async () => {
    jest.spyOn(JwtAuthGuard.prototype, 'canActivate').mockResolvedValue(true);
    userService.findByIdForAuth.mockResolvedValue({
      id: 'user-1',
      isAdmin: true,
    });

    await expect(guard.canActivate(_mockContext('user-1'))).resolves.toBe(true);
  });

  it('throws ForbiddenException when user is not admin', async () => {
    jest.spyOn(JwtAuthGuard.prototype, 'canActivate').mockResolvedValue(true);
    userService.findByIdForAuth.mockResolvedValue({
      id: 'user-1',
      isAdmin: false,
    });

    await expect(guard.canActivate(_mockContext('user-1'))).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('returns false when not authenticated', async () => {
    jest.spyOn(JwtAuthGuard.prototype, 'canActivate').mockResolvedValue(false);

    await expect(guard.canActivate(_mockContext('user-1'))).resolves.toBe(
      false,
    );
  });
});
