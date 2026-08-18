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
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4">
        <Header />
        <div className="flex min-h-0 pt-36 pb-40 flex-1 flex-col lg:overflow-y-auto">
          <AuthGate>{children}</AuthGate>
        </div>
        <Footer />
      </div>
    </TripListProvider>
  );
}
