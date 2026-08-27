import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TripsService } from './trips.service';
import { NotFoundException } from '@nestjs/common';

describe('TripsService', () => {
  let service: TripsService;
  let prismaService: {
    client: {
      trip: {
        findMany: jest.Mock;
        findUnique: jest.Mock;
        create: jest.Mock;
        update: jest.Mock;
      };
      entry: {
        create: jest.Mock;
        findMany: jest.Mock;
        update: jest.Mock;
      };
      $transaction: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaService = {
      client: {
        trip: {
          findMany: jest.fn(),
          findUnique: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
        },
        entry: {
          create: jest.fn(),
          findMany: jest.fn(),
          update: jest.fn(),
        },
        $transaction: jest.fn(),
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        TripsService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get(TripsService);
  });

  it('createEntry: throws NotFoundException if trip not foundt', async () => {
    prismaService.client.trip.findUnique.mockResolvedValue(null);

    await expect(
      service.createEntry('trip-1', 'user-1', {
        photoUrl: 'https://example.com/photo.jpg',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(prismaService.client.entry.create).not.toHaveBeenCalled();
  });

  it('createEntry: throw NotFoundException if trip is not owned by user', async () => {
    prismaService.client.trip.findUnique.mockResolvedValue({
      id: 'trip-1',
      userId: 'user-2',
      title: 'Trip 1',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      location: 'Location 1',
      startDate: new Date(),
      endDate: new Date(),
    });

    await expect(
      service.createEntry('trip-1', 'user-1', {
        photoUrl: 'https://example.com/photo.jpg',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(prismaService.client.entry.create).not.toHaveBeenCalled();
  });

  it('createEntry: creates entry', async () => {
    prismaService.client.trip.findUnique.mockResolvedValue({
      id: 'trip-1',
      userId: 'user-1',
      title: 'Trip 1',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      location: 'Location 1',
      startDate: new Date(),
      endDate: new Date(),
    });

    prismaService.client.entry.create.mockResolvedValue({
      id: 'entry-1',
      tripId: 'trip-1',
      photoUrl: 'https://example.com/photo.jpg',
      caption: null,
      location: null,
      dayLabel: null,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createEntry('trip-1', 'user-1', {
      photoUrl: 'https://example.com/photo.jpg',
      caption: 'Test Caption',
      location: 'Test Location',
      dayLabel: 'Test Day Label',
      sortOrder: 1,
    });

    expect(result.id).toBe('entry-1');
    expect(result.photoUrl).toBe('https://example.com/photo.jpg');
  });

  it('createEntry: optional inputs are set to null', async () => {
    prismaService.client.trip.findUnique.mockResolvedValue({
      id: 'trip-1',
      userId: 'user-1',
      title: 'Trip 1',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      location: 'Location 1',
      startDate: new Date(),
      endDate: new Date(),
    });

    prismaService.client.entry.create.mockResolvedValue({
      id: 'entry-1',
      tripId: 'trip-1',
      photoUrl: 'https://example.com/photo.jpg',
      caption: null,
      location: null,
      dayLabel: null,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createEntry('trip-1', 'user-1', {
      photoUrl: 'https://example.com/photo.jpg',
    });

    expect(result.id).toBe('entry-1');
    expect(result.caption).toBe(null);
    expect(result.location).toBe(null);
    expect(result.dayLabel).toBe(null);
    expect(result.sortOrder).toBe(0);
  });

  it('createEntry: persists timeOfDay', async () => {
    prismaService.client.trip.findUnique.mockResolvedValue({
      id: 'trip-1',
      userId: 'user-1',
      title: 'Trip 1',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      location: 'Location 1',
      startDate: new Date(),
      endDate: new Date(),
    });

    prismaService.client.entry.create.mockResolvedValue({
      id: 'entry-1',
      tripId: 'trip-1',
      photoUrl: 'https://example.com/photo.jpg',
      caption: null,
      location: null,
      dayLabel: null,
      timeOfDay: 'evening',
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createEntry('trip-1', 'user-1', {
      photoUrl: 'https://example.com/photo.jpg',
      timeOfDay: 'evening',
    });

    expect(prismaService.client.entry.create).toHaveBeenCalledWith({
      data: {
        tripId: 'trip-1',
        photoUrl: 'https://example.com/photo.jpg',
        caption: null,
        location: null,
        dayLabel: null,
        timeOfDay: 'evening',
        sortOrder: 0,
      },
    });
    expect(result.timeOfDay).toBe('evening');
  });

  it('createEntries: throws NotFoundException if trip not found', async () => {
    prismaService.client.trip.findUnique.mockResolvedValue(null);

    await expect(
      service.createEntries('trip-1', 'user-1', [
        { photoUrl: 'https://example.com/photo.jpg' },
      ]),
    ).rejects.toThrow(NotFoundException);

    expect(prismaService.client.$transaction).not.toHaveBeenCalled();
  });

  it('createEntries: creates entries in a transaction', async () => {
    prismaService.client.trip.findUnique.mockResolvedValue({
      id: 'trip-1',
      userId: 'user-1',
    });

    const created = [
      {
        id: 'entry-1',
        tripId: 'trip-1',
        photoUrl: 'https://example.com/a.jpg',
        caption: null,
        location: null,
        dayLabel: '2026-06-01',
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'entry-2',
        tripId: 'trip-1',
        photoUrl: 'https://example.com/b.jpg',
        caption: null,
        location: null,
        dayLabel: '2026-06-02',
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    prismaService.client.$transaction.mockResolvedValue(created);

    const result = await service.createEntries('trip-1', 'user-1', [
      {
        photoUrl: 'https://example.com/a.jpg',
        dayLabel: '2026-06-01',
        sortOrder: 0,
      },
      {
        photoUrl: 'https://example.com/b.jpg',
        dayLabel: '2026-06-02',
        sortOrder: 1,
      },
    ]);

    expect(prismaService.client.$transaction).toHaveBeenCalled();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('entry-1');
  });

  it('findOne: throws NotFoundException if trip not found', async () => {
    prismaService.client.trip.findUnique.mockResolvedValue(null);

    await expect(service.findOne('trip-1', 'user-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('findOne: throws NotFoundException if trip is not owned by user', async () => {
    prismaService.client.trip.findUnique.mockResolvedValue({
      id: 'trip-1',
      userId: 'user-2',
      title: 'Trip 1',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      location: 'Location 1',
      startDate: new Date(),
      endDate: new Date(),
    });

    await expect(service.findOne('trip-1', 'user-1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('findOne: returns trip with entries', async () => {
    prismaService.client.trip.findUnique.mockResolvedValue({
      id: 'trip-1',
      userId: 'user-1',
      title: 'Trip 1',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      location: 'Location 1',
      startDate: new Date(),
      endDate: new Date(),
      entries: [
        {
          id: 'entry-1',
          tripId: 'trip-1',
          photoUrl: 'https://example.com/photo.jpg',
          caption: null,
          location: null,
          dayLabel: null,
          sortOrder: 0,
        },
      ],
    });

    const result = await service.findOne('trip-1', 'user-1');

    expect(result.id).toBe('trip-1');
    expect(result.userId).toBe('user-1');
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].id).toBe('entry-1');
    expect(prismaService.client.trip.findUnique).toHaveBeenCalledWith({
      where: { id: 'trip-1' },
      include: {
        entries: {
          orderBy: [
            { timeOfDay: 'asc' },
            { sortOrder: 'asc' },
            { createdAt: 'asc' },
          ],
        },
      },
    });
  });

  it('create: returns TripListItem with entryCount 0', async () => {
    prismaService.client.trip.create.mockResolvedValue({
      id: 'trip-1',
      userId: 'user-1',
      title: 'Trip 1',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      location: 'Location 1',
      startDate: new Date(),
      endDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { entries: 0 },
    });

    const result = await service.create('user-1', {
      title: 'Trip 1',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      location: 'Location 1',
      startDate: new Date(),
      endDate: new Date(),
    });

    expect(result.id).toBe('trip-1');
    expect(result.entryCount).toBe(0);
  });

  it('update: throws NotFoundException if trip is not owned by user', async () => {
    prismaService.client.trip.findUnique.mockResolvedValue({
      id: 'trip-1',
      userId: 'user-2',
    });

    await expect(
      service.update('trip-1', 'user-1', {
        title: 'Updated',
        thumbnailUrl: 'https://example.com/thumbnail.jpg',
        location: 'Kyoto',
        startDate: new Date(),
        endDate: new Date(),
      }),
    ).rejects.toThrow(NotFoundException);

    expect(prismaService.client.trip.update).not.toHaveBeenCalled();
  });

  it('update: updates album fields', async () => {
    prismaService.client.trip.findUnique.mockResolvedValue({
      id: 'trip-1',
      userId: 'user-1',
    });
    prismaService.client.trip.update.mockResolvedValue({
      id: 'trip-1',
      userId: 'user-1',
      title: 'Updated',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      location: 'Kyoto',
      startDate: new Date(),
      endDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { entries: 2 },
    });

    const result = await service.update('trip-1', 'user-1', {
      title: 'Updated',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      location: 'Kyoto',
      startDate: new Date(),
      endDate: new Date(),
    });

    expect(result.title).toBe('Updated');
    expect(result.entryCount).toBe(2);
  });

  it('update: writes only the fields in a partial payload', async () => {
    prismaService.client.trip.findUnique.mockResolvedValue({
      id: 'trip-1',
      userId: 'user-1',
    });
    prismaService.client.trip.update.mockResolvedValue({
      id: 'trip-1',
      userId: 'user-1',
      title: 'Updated',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      location: 'Kyoto',
      startDate: new Date(),
      endDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      _count: { entries: 2 },
    });

    await service.update('trip-1', 'user-1', { title: 'Updated' });

    expect(prismaService.client.trip.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { title: 'Updated' },
      }),
    );
  });

  it('updateEntries: throws NotFoundException if an entry is missing', async () => {
    prismaService.client.trip.findUnique.mockResolvedValue({
      id: 'trip-1',
      userId: 'user-1',
    });
    prismaService.client.entry.findMany.mockResolvedValue([{ id: 'entry-1' }]);

    await expect(
      service.updateEntries('trip-1', 'user-1', [
        { id: 'entry-1', photoUrl: 'https://example.com/a.jpg' },
        { id: 'entry-2', photoUrl: 'https://example.com/b.jpg' },
      ]),
    ).rejects.toThrow(NotFoundException);

    expect(prismaService.client.$transaction).not.toHaveBeenCalled();
  });

  it('updateEntries: updates entries in a transaction', async () => {
    prismaService.client.trip.findUnique.mockResolvedValue({
      id: 'trip-1',
      userId: 'user-1',
    });
    prismaService.client.entry.findMany.mockResolvedValue([
      { id: 'entry-1' },
      { id: 'entry-2' },
    ]);
    prismaService.client.$transaction.mockResolvedValue([
      {
        id: 'entry-1',
        tripId: 'trip-1',
        photoUrl: 'https://example.com/a.jpg',
        caption: 'Updated',
        location: 'Kyoto',
        dayLabel: '2026-06-01',
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await service.updateEntries('trip-1', 'user-1', [
      {
        id: 'entry-1',
        photoUrl: 'https://example.com/a.jpg',
        caption: 'Updated',
        location: 'Kyoto',
        dayLabel: '2026-06-01',
        sortOrder: 0,
      },
      {
        id: 'entry-2',
        photoUrl: 'https://example.com/b.jpg',
      },
    ]);

    expect(prismaService.client.$transaction).toHaveBeenCalled();
    expect(result[0].caption).toBe('Updated');
  });
});
