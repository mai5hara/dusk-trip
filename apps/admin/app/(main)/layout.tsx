import { AuthGate } from './_components/AuthGate';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthGate>{children}</AuthGate>;
}
