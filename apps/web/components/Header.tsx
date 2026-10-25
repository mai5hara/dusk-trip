'use client';

import { Button, ButtonLink, Input } from '@mood-trip/ui';
import { LogOutIcon, PlusIcon, SparklesIcon } from 'lucide-react';
// import { UserIcon } from 'lucide-react'; // My Page (#73): uncomment with block below
import { useAuth } from '@/lib/auth/auth-context';
import { useTripListContext } from '@/app/(main)/_hooks/trip-list-context';

const Header = () => {
  const { query, setQuery } = useTripListContext();
  const { logout } = useAuth();

  return (
    // Mobile: logo + icon actions on row 1, full-width search on row 2.
    // Tablet/small desktop: single row, icon-only actions. xl: labeled actions.
    <header className="tokonoma-raised-panel fixed inset-x-6 z-50 mx-auto mt-6 flex max-w-312 flex-wrap items-center justify-between gap-x-4 gap-y-3 rounded-3xl bg-surface p-4 md:flex-nowrap md:rounded-full">
      <h1 className="shrink-0 xl:flex-1">
        <ButtonLink href="/" variant="ghost">
          Mood-Trip
        </ButtonLink>
      </h1>
      <div className="order-last flex w-full justify-center md:order-0 md:w-auto md:flex-1">
        <div className="w-full md:max-w-xs">
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
      <div className="flex shrink-0 justify-end gap-2 xl:flex-1 xl:gap-4">
        <ButtonLink
          href="/create-trip"
          variant="accent"
          size="sm"
          rounded="full"
          aria-label="Create Album"
        >
          <PlusIcon className="size-5" />
          <span className="hidden xl:inline">Create Album</span>
        </ButtonLink>
        <ButtonLink
          href="/itineraries"
          variant="accent"
          size="sm"
          rounded="full"
          aria-label="Trip Planner"
        >
          <SparklesIcon className="size-4" />
          <span className="hidden xl:inline">Trip Planner</span>
        </ButtonLink>
        {/* My Page — hidden for v1 demo (#73); link to /mypage/[id] when profile ships
        <ButtonLink href="#" variant="outline" size="icon" rounded="full">
          <UserIcon className="size-5" />
        </ButtonLink>
        */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          rounded="full"
          onClick={logout}
          aria-label="Logout"
        >
          <LogOutIcon className="size-4 xl:hidden" />
          <span className="hidden xl:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;
