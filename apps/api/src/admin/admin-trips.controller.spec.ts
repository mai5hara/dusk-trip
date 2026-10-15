import { Test } from '@nestjs/testing';
import { AdminTripsController } from './admin-trips.controller';
import { BadRequestException } from '@nestjs/common';
import { AdminTripsService } from './admin-trips.service';

describe('AdminTripsController', () => {
  let controller: AdminTripsController;

  const adminTripsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    adminTripsService.findAll.mockReset();
    adminTripsService.findOne.mockReset();
    adminTripsService.remove.mockReset();
    const module = await Test.createTestingModule({
      controllers: [AdminTripsController],
      providers: [
        {
          provide: AdminTripsService,
          useValue: adminTripsService,
        },
      ],
    }).compile();

    controller = module.get<AdminTripsController>(AdminTripsController);
  });

  it('findAll returns paginated trips', async () => {
    adminTripsService.findAll.mockResolvedValue({
      trips: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });

    await controller.findAll(1, 10, 'paris');
    expect(adminTripsService.findAll).toHaveBeenCalledWith(1, 10, 'paris');
  });

  it('findAll returns BadRequestException if page is not a positive number', async () => {
    expect(() => controller.findAll(0, 10, 'paris')).toThrow(
      BadRequestException,
    );
    expect(adminTripsService.findAll).not.toHaveBeenCalled();
  });

  it('findOne returns trip details', async () => {
    adminTripsService.findOne.mockResolvedValue({
      id: '1',
      title: 'Test Trip',
      description: 'Test Description',
    });

    const result = await controller.findOne('1');
    expect(result).toEqual({
      id: '1',
      title: 'Test Trip',
      description: 'Test Description',
    });
    expect(adminTripsService.findOne).toHaveBeenCalledWith('1');
  });

  it('remove returns void', async () => {
    await controller.remove('1');
    expect(adminTripsService.remove).toHaveBeenCalledWith('1');
  });
});
