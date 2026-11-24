'use client';

import Link from 'next/link';
import { useLang } from './LangProvider';

/** Site footer on the home and legal pages. No contact details, address, company number or social links. */
export function SiteFooter() {
  const { t } = useLang();
  return (
    <footer className="site-footer">
      <div className="foot-grid">
        <div className="foot-brand">
          <Link className="foot-logo" href="/" aria-label={t('foot.logoLabel')}>
            <span>Anker</span>
          </Link>
          <p>{t('foot.about')}</p>
        </div>

        <nav aria-labelledby="foot-pages">
          <h2 id="foot-pages">{t('foot.pages')}</h2>
          <ul>
            <li><Link href="/">{t('nav.home')}</Link></li>
            <li><Link href="/vandaag">{t('nav.wall')}</Link></li>
            <li><Link href="/plan">{t('nav.care')}</Link></li>
          </ul>
        </nav>

        <nav aria-labelledby="foot-legal">
          <h2 id="foot-legal">{t('foot.legal')}</h2>
          <ul>
            <li><Link href="/privacy">{t('foot.privacy')}</Link></li>
            <li><Link href="/voorwaarden">{t('foot.terms')}</Link></li>
            <li><Link href="/privacy">{t('foot.cookies')}</Link></li>
          </ul>
        </nav>

        <div>
          <h2>{t('foot.project')}</h2>
          <ul>
            <li>{t('foot.event')}</li>
            <li>{t('foot.challenge')}</li>
            <li>{t('foot.team')}</li>
            <li>{t('foot.authors')}</li>
          </ul>
        </div>
      </div>

      <div className="foot-bar">
        <span>{t('foot.copy')}</span>
        <span>{t('foot.credit')}</span>
      </div>
    </footer>
  );
}
