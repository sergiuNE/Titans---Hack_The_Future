import { today, momentWord, formatClock, timeOnDay, type State, type Item } from '../lib/day';
import { KindIcon } from './KindIcon';
import { useState, type FormEvent } from 'react';
import { AddItem } from './AddItem';

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
  onReset: () => void;
};

/** Caregiver on the phone: plan the day, see what happened, act on what is late. */
export function CaregiverView({ state, now, saveError, onToggle, onAdd, onRemove, onName, onOffset, onInvite, onReset }: Props) {
  const t = today(state, now);
  const late = t.open.filter((s) => s.late);
  const ticked = state.done[t.key] ?? {};
  const name = state.name.trim() || 'je naaste';
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
        <a className="care-back" href="#/scherm">
          Wandscherm tonen
        </a>
        <h1>Vandaag bij {name}</h1>
        <p className="care-sub">
          Op het wandscherm staat nu: “Het is {momentWord(now)}”, {formatClock(now)}
        </p>
      </header>

      {saveError && (
        <p className="care-alert" role="alert">
          Deze browser bewaart niets. Wijzigingen verdwijnen bij herladen.
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
      </section>

      <div className="care-side">
      <section aria-labelledby="add-title">
        <h2 id="add-title">Moment toevoegen</h2>
        <AddItem onAdd={onAdd} today={t.key} />
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
          onClick={() => confirm('De voorbeelddag terugzetten? Je eigen planning en vinkjes gaan verloren.') && onReset()}
        >
          Voorbeelddag terugzetten
        </button>
      </section>

      <section aria-labelledby="demo-title" className="care-demo">
        <h2 id="demo-title">Demo: spring in de tijd</h2>
        <p className="care-sub">Het wandscherm springt mee. Alleen voor de presentatie.</p>
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
