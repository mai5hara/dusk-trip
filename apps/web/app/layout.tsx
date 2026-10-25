import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth/auth-context';
import { QueryProvider } from '@/lib/query/query-provider';
import { AppToaster } from '@/components/AppToaster';
import { ApiWarmup } from '@/components/ApiWarmup';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dusk Trip',
  description:
    'Keep every trip as a photo album, day by day, and plan the next one with an AI itinerary built around your mood.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="moss"
      className="h-full overflow-x-clip antialiased"
    >
      <body className="flex min-h-screen w-full flex-col overflow-x-clip">
        <ApiWarmup />
        <AuthProvider>
          <QueryProvider>
            {children}
            <AppToaster />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
