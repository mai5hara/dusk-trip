'use client';

import { ButtonLink } from '@mood-trip/ui';
import { Input } from '@mood-trip/ui';
import { PlusIcon, UserIcon, SparklesIcon } from 'lucide-react';
import { useTripListContext } from '@/features/trips/trip-list-context';

const Header = () => {
  const { query, setQuery } = useTripListContext();

  return (
    <header className="shrink-0 py-4 flex justify-between items-center">
      <h1 className="flex-1">Mood-Trip</h1>
      <div className="flex-1 flex justify-center">
        <Input
          mode="search"
          rounded="full"
          variant="inset"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          placeholder="Search trips"
          className="max-w-xs"
        />
      </div>
      <div className="flex-1 flex gap-4 justify-end">
        <ButtonLink href="#" variant="accent" size="sm" rounded="full">
          <PlusIcon className="size-5" />
          Add Trip
        </ButtonLink>
        <ButtonLink href="/plan-my-trip" variant="accent" size="sm" rounded="full">
          <SparklesIcon className="size-4" />
          Plan My Trip
        </ButtonLink>
        <ButtonLink href="#" variant="outline" size="icon" rounded="full">
          <UserIcon className="size-5" />
        </ButtonLink>
      </div>
    </header>
  );
};

export default Header;
