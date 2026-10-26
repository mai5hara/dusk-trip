import { Test } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;

  const userService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    userService.findOne.mockReset();
    const module = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('findOne returns the signed-in user', async () => {
    userService.findOne.mockResolvedValue({ id: 'user-1' });

    await controller.findOne('user-1', { user: { id: 'user-1' } });
    expect(userService.findOne).toHaveBeenCalledWith('user-1');
  });

  it('findOne throws ForbiddenException for another user', () => {
    expect(() =>
      controller.findOne('user-2', { user: { id: 'user-1' } }),
    ).toThrow(ForbiddenException);
    expect(userService.findOne).not.toHaveBeenCalled();
  });
});
