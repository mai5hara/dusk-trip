import { TripListProvider } from './_hooks/trip-list-context';
import { AuthGate } from './_components/AuthGate';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TripListProvider>
      {/* Desktop: lock to a definite viewport height so the itinerary explorer
          stays within 100vh and only the day list scrolls. Mobile: natural
          document height. `flex-none` + `min-h-0` override the flex default
          min-height:auto, which would otherwise stretch the shell with content. */}
      <div className="mx-auto flex w-full max-w-324 flex-1 flex-col overflow-x-clip lg:h-screen lg:min-h-0 lg:flex-none lg:overflow-hidden">
        <div className="px-6">
          <Header />
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-x-clip px-6 pt-44 pb-10 md:pt-36 lg:overflow-y-auto lg:pb-4">
          <AuthGate>{children}</AuthGate>
        </div>
        <div className="px-6">
          <Footer />
        </div>
      </div>
    </TripListProvider>
  );
}
