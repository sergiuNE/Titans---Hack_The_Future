'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/vandaag', label: 'Wandscherm' },
  { href: '/plan', label: 'Mantelzorger' },
];

export function SiteHeader() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <img src="/favicon.svg" alt="" width={32} height={32} />
        Anker
      </Link>
      <nav aria-label="Hoofdmenu">
        <ul>
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={pathname === l.href ? 'page' : undefined}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
