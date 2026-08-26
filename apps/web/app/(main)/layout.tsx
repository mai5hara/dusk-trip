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
      <div className="mx-auto flex w-full max-w-324 flex-1 flex-col overflow-x-clip">
        <div className="px-6">
          <Header />
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-x-clip px-6 pt-36 pb-40 lg:overflow-y-auto">
          <AuthGate>{children}</AuthGate>
        </div>
        <div className="px-6">
          <Footer />
        </div>
      </div>
    </TripListProvider>
  );
}
