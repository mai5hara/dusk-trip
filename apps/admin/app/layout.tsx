import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/auth-context';
import { AppToaster } from '@/components/AppToaster';
import { QueryProvider } from '@/lib/query/query-provider';

export const metadata: Metadata = {
  title: 'Mood Trip Admin',
  description: 'Mood Trip Admin',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className="h-full overflow-x-clip antialiased"
    >
      <body className="flex min-h-screen w-full flex-col overflow-x-clip">
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
