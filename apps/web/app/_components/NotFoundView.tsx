'use client';

import type { ReactElement } from 'react';
import { ButtonLink } from '@mood-trip/ui';
import { ArrowLeftIcon, SparklesIcon } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { TripListProvider } from '@/app/(main)/_hooks/trip-list-context';
import LostRouteMap from './LostRouteMap';

const NotFoundView = (): ReactElement => {
  return (
    <TripListProvider>
      <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-surface">
        <Header fullWidth />
        <div className="h-36 shrink-0" />
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden lg:block">
          <section className="flex shrink-0 flex-col justify-center px-4 py-6 sm:px-8 lg:absolute lg:inset-y-0 lg:left-0 lg:z-10 lg:w-[min(40rem,46%)] lg:px-16">
            <div className="flex max-w-[36rem] flex-col gap-6 lg:gap-8">
              <p
                aria-hidden="true"
                className="not-found-enter font-mono text-6xl leading-none tracking-tighter text-accent/35 md:text-8xl [--index:0]"
              >
                404
              </p>
              <div className="not-found-enter flex flex-col gap-4 [--index:1]">
                <h1 className="font-mono text-3xl font-medium tracking-tight md:text-5xl md:leading-none">
                  This route is off the map
                </h1>
                <p className="max-w-[65ch] text-base leading-relaxed text-text-muted">
                  The page you asked for is not on any itinerary. It may have
                  been moved, or it never existed.
                </p>
              </div>
              <div className="not-found-enter flex flex-wrap gap-3 [--index:2]">
                <ButtonLink href="/" variant="accent" rounded="full">
                  <ArrowLeftIcon className="size-4" />
                  Back to albums
                </ButtonLink>
                <ButtonLink
                  href="/itineraries"
                  variant="outline"
                  rounded="full"
                >
                  <SparklesIcon className="size-4" />
                  Plan a trip
                </ButtonLink>
              </div>
            </div>
          </section>
          <div className="relative min-h-0 flex-1 overflow-hidden bg-accent lg:absolute lg:inset-y-0 lg:right-0 lg:left-[38%]">
            <LostRouteMap />
            <div className="not-found-blend pointer-events-none absolute inset-x-0 top-0 h-28 lg:inset-y-0 lg:left-0 lg:h-auto lg:w-[42%]" />
          </div>
        </main>
        <div className="shrink-0 px-6">
          <Footer />
        </div>
      </div>
    </TripListProvider>
  );
};

export default NotFoundView;
