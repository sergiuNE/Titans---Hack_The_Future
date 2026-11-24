'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

/** Header and footer around the pages. The wall screen stays calm: no menu bar. The footer is only for the public pages. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const wall = pathname === '/vandaag';
  const app = wall || pathname === '/plan';
  return (
    <>
      {!wall && <SiteHeader />}
      {children}
      {!app && <SiteFooter />}
    </>
  );
}
