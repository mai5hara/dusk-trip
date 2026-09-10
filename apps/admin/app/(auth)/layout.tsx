export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex w-full flex-1 flex-col">
      <div className="flex-1">{children}</div>
    </div>
  );
}
