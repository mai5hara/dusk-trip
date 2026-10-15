'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  href: string;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Dashboard' },
  { href: '/users', label: 'Users' },
  { href: '/trips', label: 'Trips' },
];

function _isActivePath(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border py-3">
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = _isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive
                  ? 'border-l-[3px] border-text-primary bg-accent/20 px-3 py-3 text-sm font-medium text-text-primary'
                  : 'border-l-[3px] border-transparent px-3 py-3 text-sm text-text-muted hover:bg-accent/10 hover:text-text-primary transition-colors'
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
