'use client';

import { useState, type FormEvent, type ReactNode } from 'react';
import { today, dagdeel, momentSentence, formatClock, formatDate, type State, type Slot, type Item } from '../lib/day';
import type { Key } from '../lib/i18n';
import { useWeather, weatherTip, type Sky } from '../lib/weather';
import { FONT_SCALES, useFontScale } from '../lib/fontscale';
import { KindIcon } from './KindIcon';
import { ConfirmDialog } from './ConfirmDialog';
import { Modal } from './Modal';
import { DayPlanner } from './DayPlanner';
import { LangSwitch, useLang } from './LangProvider';

// Say what you did, in your own words: easier to recognise than a generic "OK".
const doneLabel = {
  medicijn: 'wall.done.medicijn',
  maaltijd: 'wall.done.maaltijd',
  afspraak: 'wall.done.other',
  taak: 'wall.done.other',
  bezoek: 'wall.done.other',
} as const satisfies Record<Slot['kind'], Key>;

type Props = {
  state: State;
  now: number;
  onToggle: (id: string) => void;
  onName: (name: string) => void;
  onAdd: (item: Omit<Item, 'id'>) => void;
};

/** The wall tablet: read at a glance, one big action at a time. */
export function WallScreen({ state, now, onToggle, onName, onAdd }: Props) {
  const { t: tx, tr, lang } = useLang();
  const t = today(state, now);
  const weather = useWeather();
  const tip = weatherTip(weather, dagdeel(now), lang);
  const [fontScale, setFontScale] = useFontScale();
  const name = state.name.trim();
  // Only the most recent open moment: "Ontbijt" at 23:30 would only confuse. The caregiver sees what was missed.
  const focus = t.open.at(-1);
  const next = t.later[0];
  const ticked = state.done[t.key] ?? {};
  // Visits pass by themselves; only what someone ticked off can be undone.
  const canUndo = (s: Slot) => ticked[s.id] !== undefined;
  const [undo, setUndo] = useState<Slot | null>(null);
  const [adding, setAdding] = useState(false);
  const [visitor, setVisitor] = useState<Slot | null>(null);

  return (
    <main className="wall" data-fontscale={fontScale}>
      <header className="wall-head">
        <div>
          <p className="wall-greet">
            {tx(`greet.${dagdeel(now)}`)}
            {name ? `, ${name}` : ''}.
          </p>
          <h1 className="wall-moment">{momentSentence(now, lang)}</h1>
          <p className="wall-date">
            {formatDate(now, lang)}
            {weather && (
              <span className="wall-weather">
                <WeatherIcon sky={weather.sky} />
                {weather.temp}° {tx(`sky.${weather.sky}`)}
              </span>
            )}
          </p>
          {tip && <p className="wall-tip">{tip}</p>}
        </div>
        <time className="wall-clock" dateTime={new Date(now).toISOString()}>
          {formatClock(now, lang)}
        </time>
      </header>

      {!name ? (
        <section className="focus welcome" aria-labelledby="welcome-title">
          <div className="focus-text">
            <p id="welcome-title" className="focus-title">
              {tx('wall.welcome')}
            </p>
            <p className="focus-sub">{tx('wall.welcomeSub')}</p>
            <NameForm
              initial=""
              submitLabel={tx('wall.saveName')}
              onSave={(n) => {
                onName(n);
                setAdding(true); // next step: plan the day
              }}
            />
          </div>
        </section>
      ) : (
        <section className="focus" aria-live="polite">
          {focus ? (
            <>
              <KindIcon item={focus} size={88} />
              <div className="focus-text">
                <p className="focus-label">{tx('wall.now')}</p>
                <p className="focus-title">{focus.title}</p>
                <p className="focus-sub">{tx('wall.plannedAt', { time: focus.time })}</p>
              </div>
              <button className="done-btn" onClick={() => onToggle(focus.id)}>
                <CheckIcon />
                {tx(doneLabel[focus.kind])}
              </button>
            </>
          ) : t.slots.length === 0 ? (
            <>
              <div className="focus-text">
                <p className="focus-title">{tx('wall.noneToday')}</p>
                <p className="focus-sub">{tx('wall.noneTodaySub')}</p>
              </div>
              <button className="done-btn" onClick={() => setAdding(true)}>
                <span aria-hidden="true">+</span> {tx('wall.planDay')}
              </button>
            </>
          ) : dagdeel(now) === 'nacht' ? (
            <div className="focus-text">
              <p className="focus-title">{tx('wall.nightTitle')}</p>
              <p className="focus-sub">{tx('wall.nightSub')}</p>
            </div>
          ) : next ? (
            <>
              <Visitor item={next} size={88} onOpen={setVisitor} />
              <div className="focus-text">
                <p className="focus-label">{tx('wall.later', { time: next.time })}</p>
                <p className="focus-title">{next.title}</p>
                <p className="focus-sub">{tx('wall.nothingNow')}</p>
              </div>
            </>
          ) : (
            <div className="focus-text">
              <p className="focus-title">{tx('wall.allDone')}</p>
              <p className="focus-sub">{tx('wall.allDoneSub')}</p>
            </div>
          )}
        </section>
      )}

      {t.meds.length > 0 && (
        <section className="pills" aria-labelledby="pills-title">
          <h2 id="pills-title">{tx('wall.pillsTitle')}</h2>
          <ul>
            {t.meds.map((m) => (
              <li key={m.id} className={m.state === 'done' ? 'taken' : ''}>
                <span className="pill-dot" aria-hidden="true">
                  {m.state === 'done' && <CheckIcon size={28} />}
                </span>
                <span>
                  <strong>{m.title}</strong>
                  <span className="pill-when">
                    {m.state === 'done'
                      ? tx('wall.pillTaken', { time: formatClock(m.doneAt!, lang) })
                      : m.state === 'open'
                        ? tx('wall.pillNotYet')
                        : tx('wall.pillAt', { time: m.time })}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="wall-cols">
        <section aria-labelledby="done-title">
          <h2 id="done-title">{tx('wall.doneTitle')}</h2>
          {t.done.length === 0 ? (
            <p className="quiet">{tx('wall.nothingYet')}</p>
          ) : (
            <ul className="wall-list">
              {t.done.map((s) => (
                <li key={s.id} className="past">
                  <span className="t">{s.time}</span>
                  <Visitor item={s} size={36} onOpen={setVisitor} />
                  <span className="what">
                    {s.title}
                    {canUndo(s) && <span className="when">{tx('wall.doneAt', { time: formatClock(ticked[s.id], lang) })}</span>}
                  </span>
                  {canUndo(s) && (
                    <button className="undo" onClick={() => setUndo(s)} aria-label={tx('wall.undoAria', { title: s.title })}>
                      {tx('wall.undo')}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section aria-labelledby="later-title">
          <h2 id="later-title">{tx('wall.laterTitle')}</h2>
          {t.later.length === 0 ? (
            <p className="quiet">{tx('wall.nothingLeft')}</p>
          ) : (
            <ul className="wall-list">
              {t.later.map((s) => (
                <li key={s.id}>
                  <span className="t">{s.time}</span>
                  <Visitor item={s} size={36} onOpen={setVisitor} />
                  <span className="what">{s.title}</span>
                </li>
              ))}
            </ul>
          )}
          <button className="wall-add" onClick={() => setAdding(true)}>
            <span aria-hidden="true">+</span> {tx('wall.addDay')}
          </button>
        </section>
      </div>

      <nav className="wall-foot" aria-label={tx('wall.settings')}>
        <div className="wall-size" role="group" aria-label={tx('wall.sizeGroup')}>
          <span>{tx('wall.sizeLabel')}</span>
          {FONT_SCALES.map((f) => (
            <button key={f} className="wall-link" aria-pressed={fontScale === f} onClick={() => setFontScale(f)}>
              {tx(`wall.size.${f}`)}
            </button>
          ))}
        </div>
        <LangSwitch wall />
      </nav>

      <ConfirmDialog
        open={!!undo}
        title={
          undo && (
            <>
              {tr('wall.undoText', { time: <strong>{formatClock(ticked[undo.id] ?? now, lang)}</strong>, title: undo.title })}
              <br />
              {tx('wall.undoAsk')}
            </>
          )
        }
        cancelLabel={tx('wall.undoNo')}
        confirmLabel={tx('wall.undoYes')}
        onCancel={() => setUndo(null)}
        onConfirm={() => {
          if (undo) onToggle(undo.id);
          setUndo(null);
        }}
      />

      <Modal open={!!visitor} labelledBy="who-title" onClose={() => setVisitor(null)}>
        {visitor && (
          <div className="who">
            <p className="who-label">{tx('wall.whoLabel')}</p>
            {visitor.photo ? (
              <img className="avatar who-photo" src={visitor.photo} alt="" />
            ) : (
              <span className="avatar initial who-photo" aria-hidden="true">
                {(visitor.who || visitor.title).trim().charAt(0).toUpperCase()}
              </span>
            )}
            <p id="who-title" className="who-name">
              {visitor.who || visitor.title}
            </p>
            {visitor.relation && <p className="who-relation">{visitor.relation}</p>}
            <p className="who-time">{tx('wall.whoComes', { time: visitor.time })}</p>
            <div className="confirm-actions">
              <button className="confirm-keep" onClick={() => setVisitor(null)} autoFocus>
                {tx('common.close')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={adding} labelledBy="add-title" onClose={() => setAdding(false)}>
        <p id="add-title" className="confirm-title">
          {tx('wall.planDay')}
        </p>
        <DayPlanner
          today={t.key}
          plannedOn={(date) =>
            state.items.filter((i) => !i.date || i.date === date).sort((a, b) => a.time.localeCompare(b.time)).map((i) => `${i.time} ${i.title}`)
          }
          onSave={(items) => {
            items.forEach(onAdd);
            setAdding(false);
          }}
          onCancel={() => setAdding(false)}
          cancelLabel={t.slots.length === 0 ? tx('plan.later') : tx('common.cancel')}
        />
      </Modal>
    </main>
  );
}

/** A visitor can be tapped for "Wie is dit?". Everything else is just its icon. */
function Visitor({ item, size, onOpen }: { item: Slot; size: number; onOpen: (s: Slot) => void }) {
  const { t: tx } = useLang();
  if (item.kind !== 'bezoek') return <KindIcon item={item} size={size} />;
  return (
    <button className="who-btn" onClick={() => onOpen(item)} aria-label={tx('wall.whoAria', { name: item.who || item.title })}>
      <KindIcon item={item} size={size} />
    </button>
  );
}

function NameForm({ initial, submitLabel, onSave, onCancel }: { initial: string; submitLabel: string; onSave: (n: string) => void; onCancel?: () => void }) {
  const { t: tx } = useLang();
  const [value, setValue] = useState(initial);
  const [error, setError] = useState('');
  function submit(e: FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (!v) return setError(tx('wall.nameError'));
    onSave(v);
  }
  return (
    <form className="big-form" onSubmit={submit} noValidate>
      <label htmlFor="big-name" className="sr-only">
        {tx('wall.nameLabel')}
      </label>
      <input
        id="big-name"
        className="big-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={tx('wall.namePlaceholder')}
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
            {tx('common.cancel')}
          </button>
        )}
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
