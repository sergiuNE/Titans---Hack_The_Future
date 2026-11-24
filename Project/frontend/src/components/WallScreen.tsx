import { useState, type FormEvent, type ReactNode } from 'react';
import { today, dagdeel, momentWord, formatClock, formatDate, type State, type Slot, type Item } from '../lib/day';
import { useWeather, type Sky } from '../lib/weather';
import { KindIcon } from './KindIcon';
import { ConfirmDialog } from './ConfirmDialog';
import { Modal } from './Modal';

const greeting = { ochtend: 'Goedemorgen', middag: 'Goedemiddag', avond: 'Goedenavond', nacht: 'Goedenacht' };

// Say what you did, in your own words: easier to recognise than a generic "OK".
const doneLabel: Record<Slot['kind'], string> = {
  medicijn: 'Ik heb ze genomen',
  maaltijd: 'Ik heb gegeten',
  afspraak: 'Gedaan',
  taak: 'Gedaan',
  bezoek: 'Gedaan',
};

type Props = {
  state: State;
  now: number;
  onToggle: (id: string) => void;
  onName: (name: string) => void;
  onAdd: (item: Omit<Item, 'id'>) => void;
};

/** The wall tablet: read at a glance, one big action at a time. */
export function WallScreen({ state, now, onToggle, onName, onAdd }: Props) {
  const t = today(state, now);
  const weather = useWeather();
  const name = state.name.trim();
  // Only the most recent open moment: "Ontbijt" at 23:30 would only confuse. The caregiver sees what was missed.
  const focus = t.open.at(-1);
  const next = t.later[0];
  const ticked = state.done[t.key] ?? {};
  // Visits pass by themselves; only what someone ticked off can be undone.
  const canUndo = (s: Slot) => ticked[s.id] !== undefined;
  const [undo, setUndo] = useState<Slot | null>(null);
  const [editName, setEditName] = useState(false);
  const [adding, setAdding] = useState(false);

  return (
    <main className="wall">
      <header className="wall-head">
        <div>
          <p className="wall-greet">
            {greeting[dagdeel(now)]}
            {name ? `, ${name}` : ''}.
          </p>
          <h1 className="wall-moment">Het is {momentWord(now)}.</h1>
          <p className="wall-date">
            {formatDate(now)}
            {weather && (
              <span className="wall-weather">
                <WeatherIcon sky={weather.sky} />
                {weather.temp}° {weather.label}
              </span>
            )}
          </p>
        </div>
        <time className="wall-clock" dateTime={new Date(now).toISOString()}>
          {formatClock(now)}
        </time>
      </header>

      {!name ? (
        <section className="focus welcome" aria-labelledby="welcome-title">
          <div className="focus-text">
            <p id="welcome-title" className="focus-title">
              Welkom bij Anker. Hoe heet je?
            </p>
            <p className="focus-sub">Dan kan het scherm je elke dag bij naam begroeten.</p>
            <NameForm initial="" onSave={onName} submitLabel="Bewaar mijn naam" />
          </div>
        </section>
      ) : (
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
                <CheckIcon />
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
      )}

      {t.meds.length > 0 && (
        <section className="pills" aria-labelledby="pills-title">
          <h2 id="pills-title">Je pillen van vandaag</h2>
          <ul>
            {t.meds.map((m) => (
              <li key={m.id} className={m.state === 'done' ? 'taken' : ''}>
                <span className="pill-dot" aria-hidden="true">
                  {m.state === 'done' && <CheckIcon size={28} />}
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
                  <span className="what">
                    {s.title}
                    {canUndo(s) && <span className="when">Gedaan om {formatClock(ticked[s.id])}</span>}
                  </span>
                  {canUndo(s) && (
                    <button className="undo" onClick={() => setUndo(s)} aria-label={`${s.title}: toch niet gedaan`}>
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
          <button className="wall-add" onClick={() => setAdding(true)}>
            <span aria-hidden="true">+</span> Zelf iets toevoegen
          </button>
        </section>
      </div>

      <nav className="wall-foot" aria-label="Instellingen">
        {name && (
          <button className="wall-link" onClick={() => setEditName(true)}>
            Naam aanpassen
          </button>
        )}
        <a className="wall-link" href="#/zorg">
          Voor de mantelzorger
        </a>
        <a className="wall-link" href="#/">
          Over Anker
        </a>
      </nav>

      <ConfirmDialog
        open={!!undo}
        title={
          undo && (
            <>
              Je tikte om <strong>{formatClock(ticked[undo.id] ?? now)}</strong> dat “{undo.title}” gedaan was.
              <br />
              Is het toch nog niet gedaan?
            </>
          )
        }
        cancelLabel="Nee, het is gedaan"
        confirmLabel="Ja, nog niet gedaan"
        onCancel={() => setUndo(null)}
        onConfirm={() => {
          if (undo) onToggle(undo.id);
          setUndo(null);
        }}
      />

      <Modal open={editName} labelledBy="name-title" onClose={() => setEditName(false)}>
        <p id="name-title" className="confirm-title">
          Hoe heet je?
        </p>
        <NameForm
          initial={name}
          submitLabel="Bewaar"
          onSave={(n) => {
            onName(n);
            setEditName(false);
          }}
          onCancel={() => setEditName(false)}
        />
      </Modal>

      <Modal open={adding} labelledBy="add-title" onClose={() => setAdding(false)}>
        <p id="add-title" className="confirm-title">
          Wat wil je niet vergeten?
        </p>
        <QuickAdd
          now={now}
          onSave={(title, time) => {
            onAdd({ kind: 'taak', title, time, date: t.key });
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
        />
      </Modal>
    </main>
  );
}

function NameForm({ initial, submitLabel, onSave, onCancel }: { initial: string; submitLabel: string; onSave: (n: string) => void; onCancel?: () => void }) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState('');
  function submit(e: FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (!v) return setError('Schrijf je voornaam.');
    onSave(v);
  }
  return (
    <form className="big-form" onSubmit={submit} noValidate>
      <label htmlFor="big-name" className="sr-only">
        Je naam
      </label>
      <input
        id="big-name"
        className="big-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Je voornaam"
        maxLength={30}
        autoComplete="given-name"
        autoFocus
        aria-invalid={!!error}
        aria-describedby={error ? 'big-name-error' : undefined}
      />
      {error && (
        <p id="big-name-error" className="big-error" role="alert">
          {error}
        </p>
      )}
      <div className="confirm-actions">
        <button className="confirm-keep">{submitLabel}</button>
        {onCancel && (
          <button type="button" className="confirm-undo" onClick={onCancel}>
            Annuleer
          </button>
        )}
      </div>
    </form>
  );
}

function QuickAdd({ now, onSave, onCancel }: { now: number; onSave: (title: string, time: string) => void; onCancel: () => void }) {
  const d = new Date(now + 3600_000);
  const [title, setTitle] = useState('');
  const [time, setTime] = useState(`${String(d.getHours()).padStart(2, '0')}:00`);
  const [error, setError] = useState('');
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError('Schrijf wat je wilt doen.');
    if (!/^\d{2}:\d{2}$/.test(time)) return setError('Kies een uur.');
    onSave(title.trim(), time);
  }
  return (
    <form className="big-form" onSubmit={submit} noValidate>
      <label className="big-label">
        Wat?
        <input
          className="big-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="bv. Tom terugbellen"
          maxLength={60}
          autoFocus
          aria-invalid={!!error && !title.trim()}
        />
      </label>
      <label className="big-label">
        Hoe laat?
        <input className="big-input big-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </label>
      {error && (
        <p className="big-error" role="alert">
          {error}
        </p>
      )}
      <div className="confirm-actions">
        <button className="confirm-keep">Zet op mijn dag</button>
        <button type="button" className="confirm-undo" onClick={onCancel}>
          Annuleer
        </button>
      </div>
    </form>
  );
}

function CheckIcon({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path d="M4.5 12.5l5 5 10-11" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WeatherIcon({ sky }: { sky: Sky }) {
  const sun = <circle cx="12" cy="12" r="4.5" />;
  const cloud = <path d="M7 18h10a4 4 0 000-8 5.5 5.5 0 00-10.6 1.5A3.3 3.3 0 007 18z" />;
  const shapes: Record<Sky, ReactNode> = {
    zon: (
      <>
        {sun}
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
      </>
    ),
    wolk: cloud,
    mist: <path d="M4 9h16M2 13h20M5 17h14" />,
    regen: (
      <>
        {cloud}
        <path d="M9 21l1-2M14 21l1-2" />
      </>
    ),
    sneeuw: (
      <>
        {cloud}
        <path d="M9 21h.01M14 21h.01" />
      </>
    ),
    onweer: (
      <>
        {cloud}
        <path d="M12 18l-2 3h3l-1 2" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {shapes[sky]}
    </svg>
  );
}
