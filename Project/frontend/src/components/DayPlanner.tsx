'use client';

import { useState, type FormEvent } from 'react';
import type { Item, Kind } from '../lib/day';
import { useLang } from './LangProvider';

const KINDS: Kind[] = ['taak', 'medicijn', 'maaltijd', 'afspraak', 'bezoek'];

type Row = { title: string; time: string; kind: Kind };
const emptyRow = (time = '09:00'): Row => ({ title: '', time, kind: 'taak' });

type Props = {
  today: string;
  /** Titles already planned per date, so the user sees what is there. */
  plannedOn: (date: string) => string[];
  onSave: (items: Omit<Item, 'id'>[]) => void;
  onCancel: () => void;
  cancelLabel: string;
};

/** "Plan je dag": pick a date, then add the tasks for that day. Big fields, plain words. */
export function DayPlanner({ today, plannedOn, onSave, onCancel, cancelLabel }: Props) {
  const { t } = useLang();
  const [date, setDate] = useState(today);
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [error, setError] = useState('');
  const planned = plannedOn(date);

  const update = (i: number, patch: Partial<Row>) => setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));

  function addRow() {
    const last = rows.at(-1)?.time ?? '09:00';
    const h = Math.min(23, Number(last.slice(0, 2)) + 1);
    setRows((r) => [...r, emptyRow(`${String(h).padStart(2, '0')}:00`)]);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return setError(t('plan.errDate'));
    if (date < today) return setError(t('plan.errPast'));
    const filled = rows.filter((r) => r.title.trim());
    if (filled.length === 0) return setError(t('plan.errNone'));
    if (filled.some((r) => !/^\d{2}:\d{2}$/.test(r.time))) return setError(t('plan.errTime'));
    onSave(
      filled.map((r) => ({
        title: r.title.trim(),
        time: r.time,
        kind: r.kind,
        date,
        ...(r.kind === 'medicijn' ? { important: true } : {}),
      })),
    );
  }

  return (
    <form className="big-form planner" onSubmit={submit} noValidate>
      <label className="big-label">
        {t('plan.date')}
        <input className="big-input big-date" type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} required />
      </label>
      {planned.length > 0 && (
        <p className="planner-note">
          {t('plan.planned', { list: planned.join(', ') })}
        </p>
      )}

      <fieldset className="planner-rows">
        <legend className="big-label">{t('plan.tasks')}</legend>
        {rows.map((row, i) => (
          <div className="planner-row" key={i}>
            <label className="sr-only" htmlFor={`pt-${i}`}>
              {t('plan.taskN', { n: i + 1 })}
            </label>
            <input
              id={`pt-${i}`}
              className="big-input"
              value={row.title}
              onChange={(e) => update(i, { title: e.target.value })}
              placeholder={i === 0 ? t('plan.placeholderFirst') : t('plan.placeholderMore')}
              maxLength={60}
              autoFocus={i === rows.length - 1}
            />
            <label className="sr-only" htmlFor={`ph-${i}`}>
              {t('plan.hourN', { n: i + 1 })}
            </label>
            <input id={`ph-${i}`} className="big-input big-time" type="time" value={row.time} onChange={(e) => update(i, { time: e.target.value })} />
            <label className="sr-only" htmlFor={`pk-${i}`}>
              {t('plan.kindN', { n: i + 1 })}
            </label>
            <select id={`pk-${i}`} className="big-input big-select" value={row.kind} onChange={(e) => update(i, { kind: e.target.value as Kind })}>
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {t(`kind.${k}`)}
                </option>
              ))}
            </select>
            {rows.length > 1 && (
              <button type="button" className="row-remove" aria-label={t('plan.removeN', { n: i + 1 })} onClick={() => setRows((r) => r.filter((_, j) => j !== i))}>
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" className="wall-add" onClick={addRow}>
          <span aria-hidden="true">+</span> {t('plan.addRow')}
        </button>
      </fieldset>

      {error && (
        <p className="big-error" role="alert">
          {error}
        </p>
      )}
      <div className="confirm-actions">
        <button className="confirm-keep">{t('common.save')}</button>
        <button type="button" className="confirm-undo" onClick={onCancel}>
          {cancelLabel}
        </button>
      </div>
    </form>
  );
}
