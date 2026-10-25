const Footer = () => {
  return (
    <footer className="flex h-(--footer-h) w-full shrink-0 items-center justify-between">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-bold">Dusk Trip</p>
        <small>© 2026 Dusk Trip. All rights reserved.</small>
      </div>
      {/* Footer links — hidden for v1 demo (#65); restore with #66 routes.
          Uncomment `import Link from 'next/link'` (and `'use client'` if needed).
          Skip Contact in footer for v1 (#65); use README / GitHub instead.
      <ul className="flex gap-6 text-sm">
        <li>
          <Link href="/privacy">Privacy Policy</Link>
        </li>
        <li>
          <Link href="/terms-of-service">Terms of Service</Link>
        </li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
      </ul>
      */}
    </footer>
  );
};

export default Footer;
