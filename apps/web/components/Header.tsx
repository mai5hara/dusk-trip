'use client';

import { ButtonLink } from '@mood-trip/ui';
import { Input } from '@mood-trip/ui';
import { PlusIcon, UserIcon, SparklesIcon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useTripListContext } from '@/app/(main)/_hooks/trip-list-context';

const Header = () => {
  const { query, setQuery } = useTripListContext();
  const { logout } = useAuth();

  return (
    <header className="shrink-0 py-4 flex justify-between items-center">
      <h1 className="flex-1">
        <Link href="/">Mood-Trip</Link>
      </h1>
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-xs">
          <Input
            mode="search"
            rounded="full"
            variant="inset"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            placeholder="Search trips"
          />
        </div>
      </div>
      <div className="flex-1 flex gap-4 justify-end">
        <ButtonLink
          href="/create-trip"
          variant="accent"
          size="sm"
          rounded="full"
        >
          <PlusIcon className="size-5" />
          Add Trip
        </ButtonLink>
        <ButtonLink
          href="/itineraries"
          variant="accent"
          size="sm"
          rounded="full"
        >
          <SparklesIcon className="size-4" />
          Plan My Trip
        </ButtonLink>
        <ButtonLink href="#" variant="outline" size="icon" rounded="full">
          <UserIcon className="size-5" />
        </ButtonLink>
        <button onClick={logout}>Logout</button>
      </div>
    </header>
  );
};

export default Header;
