import type { Metadata, Viewport } from 'next';
import { Lexend } from 'next/font/google';
import type { ReactNode } from 'react';
import { LangProvider } from '../components/LangProvider';
import { DayProvider } from '../components/DayProvider';
import { SiteChrome } from '../components/SiteChrome';
import '../styles.css';

const lexend = Lexend({ subsets: ['latin'], weight: ['400', '500', '700', '800'], display: 'swap', variable: '--font-lexend' });

export const metadata: Metadata = {
  title: { default: 'Anker', template: '%s | Anker' },
  description: 'Anker geeft mensen met dementie houvast in hun dag, en hun mantelzorgers rust.',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = { themeColor: '#0f2c44' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="nl" className={lexend.variable}>
      <body>
        <LangProvider>
          <DayProvider>
            <SiteChrome>{children}</SiteChrome>
          </DayProvider>
        </LangProvider>
      </body>
    </html>
  );
}
