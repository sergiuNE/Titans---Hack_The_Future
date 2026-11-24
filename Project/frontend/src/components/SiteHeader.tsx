'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Key } from '../lib/i18n';
import { LangSwitch, useLang } from './LangProvider';

const LINKS: { href: string; label: Key }[] = [
  { href: '/', label: 'nav.home' },
  { href: '/vandaag', label: 'nav.wall' },
  { href: '/plan', label: 'nav.care' },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { t } = useLang();
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <img src="/favicon.svg" alt="" width={32} height={32} />
        Anker
      </Link>
      <nav aria-label={t('nav.main')}>
        <ul>
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} aria-current={pathname === l.href ? 'page' : undefined}>
                {t(l.label)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <LangSwitch />
    </header>
  );
}
