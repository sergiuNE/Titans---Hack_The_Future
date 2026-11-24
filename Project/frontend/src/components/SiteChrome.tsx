'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';

/** Header and footer around every page. The wall screen stays calm: no menu bar, the footer sits below the fold. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const wall = usePathname() === '/vandaag';
  return (
    <>
      {!wall && <SiteHeader />}
      {children}
      <SiteFooter />
    </>
  );
}
