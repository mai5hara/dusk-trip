'use client';

import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="flex w-full shrink-0 items-center justify-between py-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-bold">Mood Trip</p>
        <small>© 2026 Mood Trip. All rights reserved.</small>
      </div>
      <ul className="flex gap-6 text-sm">
        <li>
          <Link href="/">Privacy Policy</Link>
        </li>
        <li>
          <Link href="/terms-of-service">Terms of Service</Link>
        </li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
      </ul>
    </footer>
  );
};

export default Footer;
