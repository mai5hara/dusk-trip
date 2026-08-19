'use client';

import type { ReactElement } from 'react';
import { ButtonLink } from '@mood-trip/ui';
import { Input } from '@mood-trip/ui';
import { PlusIcon, UserIcon, SparklesIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useTripListContext } from '@/app/(main)/_hooks/trip-list-context';

type HeaderProps = {
  fullWidth?: boolean;
};

const Header = ({ fullWidth = false }: HeaderProps): ReactElement => {
  const { query, setQuery } = useTripListContext();
  const { logout } = useAuth();

  return (
    <header
      className={`tokonoma-raised-panel bg-surface shrink-0 py-4 mt-6 flex justify-between items-center fixed rounded-full p-4 z-10 ${
        fullWidth ? 'inset-x-6 w-auto max-w-none' : 'w-full max-w-312'
      }`}
    >
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
          Create Album
        </ButtonLink>
        <ButtonLink
          href="/itineraries"
          variant="accent"
          size="sm"
          rounded="full"
        >
          <SparklesIcon className="size-4" />
          Trip Planner
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
