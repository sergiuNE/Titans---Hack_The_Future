import { today, dagdeel, momentWord, formatClock, formatDate, type State, type Slot } from '../lib/day';
import { KindIcon } from './KindIcon';

const UNDO_MS = 5 * 60_000;

const greeting = { ochtend: 'Goedemorgen', middag: 'Goedemiddag', avond: 'Goedenavond', nacht: 'Goedenacht' };

// Say what you did, in your own words: easier to recognise than a generic "OK".
const doneLabel: Record<Slot['kind'], string> = {
  medicijn: 'Ik heb ze genomen',
  maaltijd: 'Ik heb gegeten',
  taak: 'Gedaan',
  bezoek: 'Gedaan',
};

type Props = { state: State; now: number; onToggle: (id: string) => void };

/** The wall tablet: read at a glance, one big action at a time. */
export function WallScreen({ state, now, onToggle }: Props) {
  const t = today(state, now);
  // Only the most recent open moment: "Ontbijt" at 23:30 would only confuse. The caregiver sees what was missed.
  const focus = t.open.at(-1);
  const next = t.later[0];
  const ticked = state.done[t.key] ?? {};
  const canUndo = (s: Slot) => ticked[s.id] !== undefined && now - ticked[s.id] < UNDO_MS;

  return (
    <main className="wall">
      <header className="wall-head">
        <div>
          <p className="wall-greet">
            {greeting[dagdeel(now)]}, {state.name}.
          </p>
          <h1 className="wall-moment">Het is {momentWord(now)}.</h1>
          <p className="wall-date">{formatDate(now)}</p>
        </div>
        <time className="wall-clock" dateTime={new Date(now).toISOString()}>
          {formatClock(now)}
        </time>
      </header>

      <section className="focus" aria-live="polite">
        {focus ? (
          <>
            <KindIcon item={focus} size={88} />
            <div className="focus-text">
              <p className="focus-label">Nu doen</p>
              <p className="focus-title">{focus.title}</p>
              <p className="focus-sub">Gepland om {focus.time}</p>
            </div>
            <button className="done-btn" onClick={() => onToggle(focus.id)}>
              <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">
                <path d="M4.5 12.5l5 5 10-11" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {doneLabel[focus.kind]}
            </button>
          </>
        ) : dagdeel(now) === 'nacht' ? (
          <div className="focus-text">
            <p className="focus-title">Het is nacht. Slaap zacht.</p>
            <p className="focus-sub">Morgen staat alles hier weer klaar.</p>
          </div>
        ) : next ? (
          <>
            <KindIcon item={next} size={88} />
            <div className="focus-text">
              <p className="focus-label">Straks, om {next.time}</p>
              <p className="focus-title">{next.title}</p>
              <p className="focus-sub">Je hoeft nu niets te doen.</p>
            </div>
          </>
        ) : (
          <div className="focus-text">
            <p className="focus-title">Alles is gedaan voor vandaag.</p>
            <p className="focus-sub">Je hoeft niets meer te doen. Rustig aan.</p>
          </div>
        )}
      </section>

      {t.meds.length > 0 && (
        <section className="pills" aria-labelledby="pills-title">
          <h2 id="pills-title">Je pillen van vandaag</h2>
          <ul>
            {t.meds.map((m) => (
              <li key={m.id} className={m.state === 'done' ? 'taken' : ''}>
                <span className="pill-dot" aria-hidden="true">
                  {m.state === 'done' && (
                    <svg viewBox="0 0 24 24" width="28" height="28">
                      <path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span>
                  <strong>{m.title}</strong>
                  <span className="pill-when">
                    {m.state === 'done' ? `Genomen om ${formatClock(m.doneAt!)}` : m.state === 'open' ? 'Nog niet genomen' : `Om ${m.time}`}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="wall-cols">
        <section aria-labelledby="done-title">
          <h2 id="done-title">Al gebeurd vandaag</h2>
          {t.done.length === 0 ? (
            <p className="quiet">Nog niets.</p>
          ) : (
            <ul className="wall-list">
              {t.done.map((s) => (
                <li key={s.id} className="past">
                  <span className="t">{s.time}</span>
                  <KindIcon item={s} size={36} />
                  <span className="what">{s.title}</span>
                  {canUndo(s) && (
                    <button className="undo" onClick={() => onToggle(s.id)}>
                      Toch niet
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section aria-labelledby="later-title">
          <h2 id="later-title">Nog te komen</h2>
          {t.later.length === 0 ? (
            <p className="quiet">Niets meer gepland.</p>
          ) : (
            <ul className="wall-list">
              {t.later.map((s) => (
                <li key={s.id}>
                  <span className="t">{s.time}</span>
                  <KindIcon item={s} size={36} />
                  <span className="what">{s.title}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <a className="to-care" href="#/zorg">
        Voor de mantelzorger
      </a>
    </main>
  );
}
