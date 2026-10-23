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

const NAV_LINK_BASE = 'border-l-[3px] px-3 py-3 text-sm';

function _isActivePath(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function _navLinkClassName(isActive: boolean): string {
  if (isActive) {
    return `${NAV_LINK_BASE} border-text-primary bg-accent/20 font-medium text-text-primary`;
  }
  return `${NAV_LINK_BASE} border-transparent text-text-muted transition-colors hover:bg-accent/10 hover:text-text-primary`;
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
              className={_navLinkClassName(isActive)}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
