import bcrypt from 'bcrypt';
import { createPrismaClient } from '../src';

const DEV_EMAIL = 'test@test.com';
const DEV_PASSWORD = 'password';
const DEV_NAME = 'Test User';

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error('DATABASE_URL is not set');
}

const prisma = createPrismaClient(url);

async function main() {
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: {
      email: DEV_EMAIL,
    },
    update: {
      name: DEV_NAME,
      passwordHash,
    },
    create: {
      email: DEV_EMAIL,
      name: DEV_NAME,
      passwordHash,
    },
  });

  await prisma.entry.deleteMany({
    where: { trip: { userId: user.id } },
  });
  await prisma.trip.deleteMany({
    where: { userId: user.id },
  });

  const trip1 = await prisma.trip.create({
    data: {
      userId: user.id,
      title: 'New York Trip',
      thumbnailUrl:
        'https://fastly.picsum.photos/id/611/400/300.jpg?hmac=FIqzk_EUUapLnwbIlggz6eiEp5XDhMejt_Ch1P72KmI',
      location: 'New York',
      startDate: new Date(new Date().setDate(new Date().getDate() - 3)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 3)),
      entries: {
        create: [
          {
            photoUrl:
              'https://fastly.picsum.photos/id/611/400/300.jpg?hmac=FIqzk_EUUapLnwbIlggz6eiEp5XDhMejt_Ch1P72KmI',
            caption: 'Caption 1',
            location: 'Location 1',
            dayLabel: 'Day 1',
            sortOrder: 0,
          },
          {
            photoUrl:
              'https://fastly.picsum.photos/id/611/400/300.jpg?hmac=FIqzk_EUUapLnwbIlggz6eiEp5XDhMejt_Ch1P72KmI',
            caption: 'Caption 1',
            location: 'Location 1',
            dayLabel: 'Day 2',
            sortOrder: 1,
          },
        ],
      },
    },
  });

  const trip2 = await prisma.trip.create({
    data: {
      userId: user.id,
      title: 'Paris Trip',
      thumbnailUrl:
        'https://fastly.picsum.photos/id/611/400/300.jpg?hmac=FIqzk_EUUapLnwbIlggz6eiEp5XDhMejt_Ch1P72KmI',
      location: 'Paris',
      startDate: new Date(new Date().setDate(new Date().getDate() - 6)),
      endDate: new Date(new Date().setDate(new Date().getDate() + 6)),
      entries: {
        create: [
          {
            photoUrl:
              'https://fastly.picsum.photos/id/611/400/300.jpg?hmac=FIqzk_EUUapLnwbIlggz6eiEp5XDhMejt_Ch1P72KmI',
            caption: 'Caption 1',
            location: 'Location 1',
            dayLabel: 'Day 1',
            sortOrder: 0,
          },
          {
            photoUrl:
              'https://fastly.picsum.photos/id/611/400/300.jpg?hmac=FIqzk_EUUapLnwbIlggz6eiEp5XDhMejt_Ch1P72KmI',
            caption: 'Caption 1',
            location: 'Location 1',
            dayLabel: 'Day 2',
            sortOrder: 1,
          },
        ],
      },
    },
  });

  console.log('Seed done:', {
    userId: user.id,
    trip1Id: trip1.id,
    trip2Id: trip2.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
