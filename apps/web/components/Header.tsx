'use client';

import { ButtonLink } from '@mood-trip/ui';
import { Input } from '@mood-trip/ui';
import { PlusIcon, UserIcon, SparklesIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useTripListContext } from '@/app/(main)/_hooks/trip-list-context';

const Header = () => {
  const { query, setQuery } = useTripListContext();
  const { logout } = useAuth();

  return (
    <header className="tokonoma-raised-panel w-full max-w-312 bg-surface shrink-0 py-4 mt-6 flex justify-between items-center fixed rounded-full p-4 z-10">
      <h1 className="flex-1">
        <ButtonLink href="/" variant="ghost">
          Mood-Trip
        </ButtonLink>
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
          href="/plan-my-trip"
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
