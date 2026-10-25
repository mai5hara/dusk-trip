import bcrypt from 'bcrypt';
import { createPrismaClient } from '../src';

// Local development sample data. The demo account exists only in local
// databases (see the host guard below), so its dummy credentials are safe to commit.
const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'password123';
const DEMO_NAME = 'Demo User';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error('DATABASE_URL is not set');
}

// Refuse to touch anything but a local database (e.g. a production URL left in .env).
const host = new URL(url).hostname;
if (!LOCAL_HOSTS.has(host)) {
  throw new Error(
    `Refusing to seed: DATABASE_URL host "${host}" is not local. The seed is for local development only.`,
  );
}

const prisma = createPrismaClient(url);

async function main() {
  // Create-only and idempotent: never overwrites or deletes existing data.
  // To start over, reset the local database (pnpm db:reset) and seed again.
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: {
      email: DEMO_EMAIL,
      name: DEMO_NAME,
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
      isAdmin: true,
    },
  });

  if ((await prisma.trip.count({ where: { userId: user.id } })) > 0) {
    console.log(`Seed skipped: ${DEMO_EMAIL} already has trips.`);
    return;
  }

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
