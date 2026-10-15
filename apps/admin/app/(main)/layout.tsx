import { Sidebar } from '@/components/Sidebar';
import { AuthGate } from './_components/AuthGate';
import { Header } from '@/components/Header';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGate>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AuthGate>
  );
}
