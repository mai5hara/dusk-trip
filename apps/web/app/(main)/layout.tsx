import { TripListProvider } from './_hooks/trip-list-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TripListProvider>
      {/* Desktop: lock to a definite viewport height (app-shell) so pages like
          the trip explorer fit within 100vh and only the content region scrolls.
          Mobile: natural height, the page scrolls normally. */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 lg:h-screen lg:flex-none lg:overflow-hidden">
        <Header />
        <div className="flex min-h-0 flex-1 flex-col lg:overflow-y-auto">
          {children}
        </div>
        <Footer />
      </div>
    </TripListProvider>
  );
}
