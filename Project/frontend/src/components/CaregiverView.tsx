'use client';

import Link from 'next/link';
import { today, overview, isEvening, momentWord, formatClock, timeOnDay, type State, type Item } from '../lib/day';
import { KindIcon } from './KindIcon';
import { useState, type FormEvent } from 'react';
import { AddItem } from './AddItem';

/** "2026-11-25" -> "woensdag 25 november" */
const formatDay = (key: string) =>
  new Date(key + 'T12:00').toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' });

// Demo only: jump through the day so the jury sees "Straks" become "Nu" become "Al gebeurd".
const JUMPS = ['08:35', '15:00', '20:00', '23:30'];

type Props = {
  state: State;
  now: number;
  saveError: boolean;
  onToggle: (id: string) => void;
  onAdd: (item: Omit<Item, 'id'>) => void;
  onRemove: (id: string) => void;
  onName: (name: string) => void;
  onOffset: (offset: number) => void;
  onInvite: (member: string) => void;
  onDemo: () => void;
  onReset: () => void;
  /** Only with an account (Supabase on): the code that links the tablet, and sign out. */
  pairCode?: string;
  onSignOut?: () => void;
};

/** Caregiver on the phone: plan the day, see what happened, act on what is late. */
export function CaregiverView({ state, now, saveError, onToggle, onAdd, onRemove, onName, onOffset, onInvite, onDemo, onReset, pairCode, onSignOut }: Props) {
  const t = today(state, now);
  const late = t.open.filter((s) => s.late);
  const ticked = state.done[t.key] ?? {};
  const sum = overview(t.slots);
  const evening = isEvening(now);
  const remote = !!pairCode; // a pair code only exists with Supabase
  const name = state.name.trim() || 'je naaste';
  const upcoming = state.items
    .filter((i) => i.date && i.date > t.key)
    .sort((a, b) => (a.date! + a.time).localeCompare(b.date! + b.time));
  const [invite, setInvite] = useState('');
  const [invited, setInvited] = useState('');

  function sendInvite(e: FormEvent) {
    e.preventDefault();
    const m = invite.trim();
    if (!m) return;
    onInvite(m);
    setInvited(m);
    setInvite('');
  }

  return (
    <>
    <main className="care">
      <header className="care-head">
        <Link className="care-back" href="/vandaag">
          Wandscherm tonen
        </Link>
        <h1>Plan van {name}</h1>
        <p className="care-sub">
          Op het wandscherm staat nu: “Het is {momentWord(now)}”, {formatClock(now)}
        </p>
      </header>

      {saveError && (
        <p className="care-alert" role="alert">
          Opslaan is niet gelukt. Wijzigingen kunnen verdwijnen bij herladen.
        </p>
      )}

      {late.length > 0 && (
        <div className="care-alert" role="alert">
          {late.map((s) => (
            <p key={s.id}>
              <strong>{s.title}</strong> staat sinds {s.time} open.
            </p>
          ))}
          <p className="care-hint">Al meer dan een uur open. Bel even, of vink af als het toch gebeurd is.</p>
        </div>
      )}

      {sum.total > 0 && (
        <section className={`care-summary ${evening ? 'evening' : ''}`} aria-labelledby="sum-title">
          <h2 id="sum-title">Vandaag bij {name}</h2>
          <p className="sum-count">
            <strong>
              {sum.done} van {sum.total}
            </strong>{' '}
            momenten gedaan
          </p>
          {sum.left.length === 0 ? (
            <p className="sum-ok">Alles is gedaan voor vandaag.</p>
          ) : evening ? (
            <>
              <p className="sum-head">Nog open</p>
              <ul className="sum-list">
                {sum.left.map((s) => (
                  <li key={s.id}>
                    <span className="t">{s.time}</span>
                    <span>{s.title}</span>
                    {s.important && <span className="sum-flag">Belangrijk</span>}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="sum-small">
              Nog open: {sum.left.map((s) => `${s.title} (${s.time})${s.important ? ', belangrijk' : ''}`).join(' · ')}
            </p>
          )}
        </section>
      )}

      <dl className="care-stats">
        <div>
          <dt>Pillen genomen</dt>
          <dd>
            {t.medsTaken} van {t.meds.length}
          </dd>
        </div>
        <div>
          <dt>Gebeurd vandaag</dt>
          <dd>
            {t.done.length} van {t.slots.length}
          </dd>
        </div>
      </dl>

      <div className="care-cols">
      <section aria-labelledby="day-title">
        <h2 id="day-title">Dagplanning</h2>
        {t.slots.length === 0 ? (
          <p className="care-empty">Nog niets gepland. Voeg het eerste moment toe bij “Moment toevoegen”.</p>
        ) : (
          <ul className="care-list">
            {t.slots.map((s) => {
              const auto = s.kind === 'bezoek';
              const status =
                s.state === 'done'
                  ? auto
                    ? 'Voorbij'
                    : `Afgevinkt om ${formatClock(ticked[s.id])}`
                  : s.state === 'open'
                    ? s.late
                      ? 'Te laat'
                      : 'Nu'
                    : 'Gepland';
              return (
                <li key={s.id} className={`care-row ${s.state} ${s.late ? 'late' : ''}`}>
                  <span className="t">{s.time}</span>
                  <KindIcon item={s} size={32} />
                  <span className="what">
                    {s.title}
                    <span className="status">
                      {status}
                      {!s.date && ', elke dag'}
                    </span>
                  </span>
                  <span className="row-tools">
                    {!auto && s.state !== 'later' && (
                      <button className="chip-btn" onClick={() => onToggle(s.id)}>
                        {s.state === 'done' ? 'Ongedaan' : 'Afvinken'}
                      </button>
                    )}
                    <button className="x-btn" aria-label={`${s.title} verwijderen`} onClick={() => onRemove(s.id)}>
                      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {upcoming.length > 0 && (
          <>
            <h2 className="care-subhead">Komende dagen</h2>
            <ul className="care-list">
              {upcoming.map((s) => (
                <li key={s.id} className="care-row later">
                  <span className="t">{s.time}</span>
                  <KindIcon item={s} size={32} />
                  <span className="what">
                    {s.title}
                    <span className="status">{formatDay(s.date!)}</span>
                  </span>
                  <span className="row-tools">
                    <button className="x-btn" aria-label={`${s.title} verwijderen`} onClick={() => onRemove(s.id)}>
                      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <div className="care-side">
      <section aria-labelledby="add-title">
        <h2 id="add-title">Moment toevoegen</h2>
        <AddItem onAdd={onAdd} today={t.key} name={name} />
      </section>

      <section aria-labelledby="circle-title" className="care-settings">
        <h2 id="circle-title">Zorgkring</h2>
        <p className="care-hint-small">Iedereen in de kring ziet hetzelfde overzicht.</p>
        <ul className="circle">
          {(state.circle ?? []).map((m) => (
            <li key={m}>
              <span className="avatar initial" aria-hidden="true">
                {m.charAt(0).toUpperCase()}
              </span>
              {m}
            </li>
          ))}
        </ul>
        <form className="invite" onSubmit={sendInvite}>
          <label htmlFor="invite" className="sr-only">
            Naam van wie je wilt uitnodigen
          </label>
          <input id="invite" value={invite} onChange={(e) => setInvite(e.target.value)} placeholder="bv. Tom" maxLength={30} />
          <button className="chip-btn">Uitnodigen</button>
        </form>
        {invited && (
          <p className="care-hint-small" role="status">
            {invited} staat in de zorgkring. In deze demo wordt nog geen uitnodiging verstuurd.
          </p>
        )}
      </section>

      <section aria-labelledby="set-title" className="care-settings">
        <h2 id="set-title">Instellingen</h2>
        {pairCode && (
          <div className="pair-box">
            <p className="care-hint-small">Koppelcode</p>
            <p className="pair-code" aria-label={`Koppelcode ${pairCode.split('').join(' ')}`}>
              {pairCode}
            </p>
            <p className="care-hint-small">Typ deze code op de tablet van {name === 'je naaste' ? 'je naaste' : name}.</p>
          </div>
        )}
        <label htmlFor="name">Naam van je naaste</label>
        <input
          id="name"
          value={state.name}
          maxLength={30}
          autoComplete="off"
          placeholder="bv. Maria"
          aria-describedby="name-hint"
          onChange={(e) => onName(e.target.value)}
        />
        <p id="name-hint" className="care-hint-small">
          Staat bovenaan het wandscherm in de begroeting. Wordt meteen bewaard.
        </p>
        <button
          className="link-btn"
          onClick={() =>
            confirm(
              remote
                ? `Alles wissen? De planning en de vinkjes van ${name} worden voor iedereen gewist.`
                : 'Alles wissen? De naam, de planning, de vinkjes en de zorgkring verdwijnen van dit toestel.',
            ) && onReset()
          }
        >
          Alles wissen
        </button>
        {onSignOut && (
          <button className="link-btn" onClick={onSignOut}>
            Afmelden
          </button>
        )}
      </section>

      <section aria-labelledby="demo-title" className="care-demo">
        <h2 id="demo-title">Demo</h2>
        <p className="care-sub">Alleen voor de presentatie. Het wandscherm springt mee.</p>
        <div className="demo-jumps">
          <button
            className="chip-btn"
            onClick={() => (t.slots.length === 0 || confirm('De voorbeelddag laden? Je eigen planning en vinkjes worden vervangen.')) && onDemo()}
          >
            Voorbeelddag laden
          </button>
        </div>
        <div className="demo-jumps">
          {JUMPS.map((hhmm) => (
            <button key={hhmm} className="chip-btn" onClick={() => onOffset(timeOnDay(hhmm, Date.now()) - Date.now())}>
              {hhmm}
            </button>
          ))}
          <button className="chip-btn" onClick={() => onOffset((state.offset ?? 0) + 3600_000)}>
            +1 uur
          </button>
          {!!state.offset && (
            <button className="chip-btn" onClick={() => onOffset(0)}>
              Echte tijd
            </button>
          )}
        </div>
      </section>
      </div>
      </div>
    </main>
    </>
  );
}
