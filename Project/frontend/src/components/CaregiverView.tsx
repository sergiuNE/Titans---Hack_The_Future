'use client';

import Link from 'next/link';
import { today, overview, isEvening, momentSentence, formatClock, formatDayKey, timeOnDay, type State, type Item } from '../lib/day';
import { KindIcon } from './KindIcon';
import { useLang } from './LangProvider';
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
  onDemo: () => void;
  onReset: () => void;
  /** Only with an account (Supabase on): the code that links the tablet, and sign out. */
  pairCode?: string;
  onSignOut?: () => void;
};

/** Caregiver on the phone: plan the day, see what happened, act on what is late. */
export function CaregiverView({ state, now, saveError, onToggle, onAdd, onRemove, onName, onOffset, onInvite, onDemo, onReset, pairCode, onSignOut }: Props) {
  const { t: tx, tr, lang } = useLang();
  const t = today(state, now);
  const late = t.open.filter((s) => s.late);
  const ticked = state.done[t.key] ?? {};
  const sum = overview(t.slots);
  const evening = isEvening(now);
  const remote = !!pairCode; // a pair code only exists with Supabase
  const name = state.name.trim() || tx('care.fallbackName');
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
          {tx('care.showWall')}
        </Link>
        <h1>{tx('care.planOf', { name })}</h1>
        <p className="care-sub">
          {tx('care.screenNow', { sentence: momentSentence(now, lang), time: formatClock(now, lang) })}
        </p>
      </header>

      {saveError && (
        <p className="care-alert" role="alert">
          {tx('care.saveError')}
        </p>
      )}

      {late.length > 0 && (
        <div className="care-alert" role="alert">
          {late.map((s) => (
            <p key={s.id}>
              {tr('care.lateRow', { title: <strong>{s.title}</strong>, time: s.time })}
            </p>
          ))}
          <p className="care-hint">{tx('care.lateHint')}</p>
        </div>
      )}

      {sum.total > 0 && (
        <section className={`care-summary ${evening ? 'evening' : ''}`} aria-labelledby="sum-title">
          <h2 id="sum-title">{tx('care.summaryTitle', { name })}</h2>
          <p className="sum-count">
            {tr('care.count', { count: <strong>{tx('care.countOf', { done: sum.done, total: sum.total })}</strong> })}
          </p>
          {sum.left.length === 0 ? (
            <p className="sum-ok">{tx('wall.allDone')}</p>
          ) : evening ? (
            <>
              <p className="sum-head">{tx('care.stillOpen')}</p>
              <ul className="sum-list">
                {sum.left.map((s) => (
                  <li key={s.id}>
                    <span className="t">{s.time}</span>
                    <span>{s.title}</span>
                    {s.important && <span className="sum-flag">{tx('care.important')}</span>}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="sum-small">
              {tx('care.stillOpenInline', {
                list: sum.left.map((s) => `${s.title} (${s.time})${s.important ? tx('care.importantInline') : ''}`).join(' · '),
              })}
            </p>
          )}
        </section>
      )}

      <dl className="care-stats">
        <div>
          <dt>{tx('care.pillsTaken')}</dt>
          <dd>{tx('care.countOf', { done: t.medsTaken, total: t.meds.length })}</dd>
        </div>
        <div>
          <dt>{tx('care.doneToday')}</dt>
          <dd>{tx('care.countOf', { done: t.done.length, total: t.slots.length })}</dd>
        </div>
      </dl>

      <div className="care-cols">
      <section aria-labelledby="day-title">
        <h2 id="day-title">{tx('care.dayPlan')}</h2>
        {t.slots.length === 0 ? (
          <p className="care-empty">{tx('care.empty')}</p>
        ) : (
          <ul className="care-list">
            {t.slots.map((s) => {
              const auto = s.kind === 'bezoek';
              const status =
                s.state === 'done'
                  ? auto
                    ? tx('care.statusPast')
                    : tx('care.statusTicked', { time: formatClock(ticked[s.id], lang) })
                  : s.state === 'open'
                    ? s.late
                      ? tx('care.statusLate')
                      : tx('care.statusNow')
                    : tx('care.statusPlanned');
              return (
                <li key={s.id} className={`care-row ${s.state} ${s.late ? 'late' : ''}`}>
                  <span className="t">{s.time}</span>
                  <KindIcon item={s} size={32} />
                  <span className="what">
                    {s.title}
                    <span className="status">
                      {status}
                      {!s.date && tx('care.daily')}
                    </span>
                  </span>
                  <span className="row-tools">
                    {!auto && s.state !== 'later' && (
                      <button className="chip-btn" onClick={() => onToggle(s.id)}>
                        {s.state === 'done' ? tx('care.undo') : tx('care.tick')}
                      </button>
                    )}
                    <button className="x-btn" aria-label={tx('care.removeAria', { title: s.title })} onClick={() => onRemove(s.id)}>
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
            <h2 className="care-subhead">{tx('care.upcoming')}</h2>
            <ul className="care-list">
              {upcoming.map((s) => (
                <li key={s.id} className="care-row later">
                  <span className="t">{s.time}</span>
                  <KindIcon item={s} size={32} />
                  <span className="what">
                    {s.title}
                    <span className="status">{formatDayKey(s.date!, lang)}</span>
                  </span>
                  <span className="row-tools">
                    <button className="x-btn" aria-label={tx('care.removeAria', { title: s.title })} onClick={() => onRemove(s.id)}>
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
        <h2 id="add-title">{tx('care.addTitle')}</h2>
        <AddItem onAdd={onAdd} today={t.key} name={name} />
      </section>

      <section aria-labelledby="circle-title" className="care-settings">
        <h2 id="circle-title">{tx('care.circle')}</h2>
        <p className="care-hint-small">{tx('care.circleHint')}</p>
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
            {tx('care.inviteLabel')}
          </label>
          <input id="invite" value={invite} onChange={(e) => setInvite(e.target.value)} placeholder={tx('care.invitePlaceholder')} maxLength={30} />
          <button className="chip-btn">{tx('care.invite')}</button>
        </form>
        {invited && (
          <p className="care-hint-small" role="status">
            {tx('care.invited', { name: invited })}
          </p>
        )}
      </section>

      <section aria-labelledby="set-title" className="care-settings">
        <h2 id="set-title">{tx('care.settings')}</h2>
        {pairCode && (
          <div className="pair-box">
            <p className="care-hint-small">{tx('care.pairCode')}</p>
            <p className="pair-code" aria-label={tx('care.pairAria', { code: pairCode.split('').join(' ') })}>
              {pairCode}
            </p>
            <p className="care-hint-small">{tx('care.pairHint', { name })}</p>
          </div>
        )}
        <label htmlFor="name">{tx('care.nameLabel')}</label>
        <input
          id="name"
          value={state.name}
          maxLength={30}
          autoComplete="off"
          placeholder={tx('care.namePlaceholder')}
          aria-describedby="name-hint"
          onChange={(e) => onName(e.target.value)}
        />
        <p id="name-hint" className="care-hint-small">
          {tx('care.nameHint')}
        </p>
        <button
          className="link-btn"
          onClick={() =>
            confirm(
              remote
                ? tx('care.clearRemote', { name })
                : tx('care.clearLocal'),
            ) && onReset()
          }
        >
          {tx('care.clearAll')}
        </button>
        {onSignOut && (
          <button className="link-btn" onClick={onSignOut}>
            {tx('common.signOut')}
          </button>
        )}
      </section>

      <section aria-labelledby="demo-title" className="care-demo">
        <h2 id="demo-title">{tx('care.demo')}</h2>
        <p className="care-sub">{tx('care.demoNote')}</p>
        <div className="demo-jumps">
          <button
            className="chip-btn"
            onClick={() => (t.slots.length === 0 || confirm(tx('care.confirmDemo'))) && onDemo()}
          >
            {tx('care.loadDemo')}
          </button>
        </div>
        <div className="demo-jumps">
          {JUMPS.map((hhmm) => (
            <button key={hhmm} className="chip-btn" onClick={() => onOffset(timeOnDay(hhmm, Date.now()) - Date.now())}>
              {hhmm}
            </button>
          ))}
          <button className="chip-btn" onClick={() => onOffset((state.offset ?? 0) + 3600_000)}>
            {tx('care.plusHour')}
          </button>
          {!!state.offset && (
            <button className="chip-btn" onClick={() => onOffset(0)}>
              {tx('care.realTime')}
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
