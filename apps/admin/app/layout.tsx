import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/auth-context';
import { AppToaster } from '@/components/AppToaster';

export const metadata: Metadata = {
  title: 'Dusk Trip Admin',
  description: 'Dusk Trip Admin',
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
          {children}
          <AppToaster />
        </AuthProvider>
      </body>
    </html>
  );
}
