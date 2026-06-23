import { TripListProvider } from '@/features/trips/trip-list-context';
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
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </TripListProvider>
  );
}
