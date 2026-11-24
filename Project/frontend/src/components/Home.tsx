'use client';

import Link from 'next/link';
import { today, momentSentence, formatClock, type State } from '../lib/day';
import { KindIcon } from './KindIcon';
import { useLang } from './LangProvider';

/** Public home page: the hero with a live mini wall screen and the way into both screens. */
export function Home({ state, now }: { state: State; now: number }) {
  const { t: tx, lang } = useLang();
  const t = today(state, now);
  const preview = t.open.at(-1) ?? t.later[0];

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-text">
          <h1>{tx('home.title')}</h1>
          <p className="hero-lead">{tx('home.lead')}</p>
          <div className="hero-cta">
            <Link className="btn-primary" href="/vandaag">
              {tx('home.openWall')}
            </Link>
            <Link className="btn-secondary" href="/plan">
              {tx('home.imCaregiver')}
            </Link>
          </div>
        </div>

        <Link className="hero-preview" href="/vandaag" aria-label={tx('home.previewLabel')}>
          <span className="pv-moment">{momentSentence(now, lang)}</span>
          <span className="pv-clock">{formatClock(now, lang)}</span>
          {preview && (
            <span className="pv-card">
              <KindIcon item={preview} size={44} />
              <span>
                <span className="pv-label">{preview.state === 'open' ? tx('wall.now') : tx('wall.later', { time: preview.time })}</span>
                <span className="pv-title">{preview.title}</span>
              </span>
            </span>
          )}
          <span className="pv-meds">
            {t.slots.length === 0
              ? tx('home.empty')
              : tx('home.pills', { done: t.medsTaken, total: t.meds.length })}
          </span>
        </Link>
      </section>
    </main>
  );
}
