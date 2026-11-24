'use client';

import Link from 'next/link';
import { today, momentWord, formatClock, type State } from '../lib/day';
import { KindIcon } from './KindIcon';

/** Public home page: the hero with a live mini wall screen and the way into both screens. */
export function Home({ state, now }: { state: State; now: number }) {
  const t = today(state, now);
  const preview = t.open.at(-1) ?? t.later[0];

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-text">
          <h1>Houvast voor wie de tijd kwijt is.</h1>
          <p className="hero-lead">
            Anker is een rustig scherm aan de muur dat iemand met dementie op elk moment vertelt welke dag het is, wat al
            gebeurd is en wat nog komt. De familie plant de dag vanaf de gsm en ziet meteen wat er gedaan is.
          </p>
          <div className="hero-cta">
            <Link className="btn-primary" href="/vandaag">
              Open het wandscherm
            </Link>
            <Link className="btn-secondary" href="/plan">
              Ik ben mantelzorger
            </Link>
          </div>
        </div>

        <Link className="hero-preview" href="/vandaag" aria-label="Live voorbeeld van het wandscherm, openen">
          <span className="pv-moment">Het is {momentWord(now)}.</span>
          <span className="pv-clock">{formatClock(now)}</span>
          {preview && (
            <span className="pv-card">
              <KindIcon item={preview} size={44} />
              <span>
                <span className="pv-label">{preview.state === 'open' ? 'Nu doen' : `Straks, om ${preview.time}`}</span>
                <span className="pv-title">{preview.title}</span>
              </span>
            </span>
          )}
          <span className="pv-meds">
            {t.slots.length === 0
              ? 'Nog niets gepland. Open het wandscherm om je dag te plannen.'
              : `Pillen vandaag: ${t.medsTaken} van ${t.meds.length} genomen`}
          </span>
        </Link>
      </section>
    </main>
  );
}
