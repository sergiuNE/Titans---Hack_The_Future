import { useState, type FormEvent } from 'react';
import type { Item, Kind } from '../lib/day';

const KINDS: { value: Kind; label: string }[] = [
  { value: 'taak', label: 'Taak' },
  { value: 'medicijn', label: 'Medicijn' },
  { value: 'maaltijd', label: 'Maaltijd' },
  { value: 'afspraak', label: 'Afspraak' },
  { value: 'bezoek', label: 'Bezoek' },
];

type Row = { title: string; time: string; kind: Kind };
const emptyRow = (time = '09:00'): Row => ({ title: '', time, kind: 'taak' });

type Props = {
  today: string;
  /** Titles already planned per date, so the user sees what is there. */
  plannedOn: (date: string) => string[];
  onSave: (items: Omit<Item, 'id'>[]) => void;
  onCancel: () => void;
  cancelLabel?: string;
};

/** "Plan je dag": pick a date, then add the tasks for that day. Big fields, plain words. */
export function DayPlanner({ today, plannedOn, onSave, onCancel, cancelLabel = 'Annuleer' }: Props) {
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
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return setError('Kies een datum.');
    if (date < today) return setError('Kies vandaag of een dag later.');
    const filled = rows.filter((r) => r.title.trim());
    if (filled.length === 0) return setError('Schrijf minstens één taak.');
    if (filled.some((r) => !/^\d{2}:\d{2}$/.test(r.time))) return setError('Kies voor elke taak een uur.');
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
        Datum
        <input className="big-input big-date" type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} required />
      </label>
      {planned.length > 0 && (
        <p className="planner-note">
          Al gepland op die dag: {planned.join(', ')}.
        </p>
      )}

      <fieldset className="planner-rows">
        <legend className="big-label">Taken voor die dag</legend>
        {rows.map((row, i) => (
          <div className="planner-row" key={i}>
            <label className="sr-only" htmlFor={`pt-${i}`}>
              Taak {i + 1}
            </label>
            <input
              id={`pt-${i}`}
              className="big-input"
              value={row.title}
              onChange={(e) => update(i, { title: e.target.value })}
              placeholder={i === 0 ? 'bv. Pillen nemen' : 'Nog een taak'}
              maxLength={60}
              autoFocus={i === rows.length - 1}
            />
            <label className="sr-only" htmlFor={`ph-${i}`}>
              Uur voor taak {i + 1}
            </label>
            <input id={`ph-${i}`} className="big-input big-time" type="time" value={row.time} onChange={(e) => update(i, { time: e.target.value })} />
            <label className="sr-only" htmlFor={`pk-${i}`}>
              Soort voor taak {i + 1}
            </label>
            <select id={`pk-${i}`} className="big-input big-select" value={row.kind} onChange={(e) => update(i, { kind: e.target.value as Kind })}>
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
            {rows.length > 1 && (
              <button type="button" className="row-remove" aria-label={`Taak ${i + 1} weghalen`} onClick={() => setRows((r) => r.filter((_, j) => j !== i))}>
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" className="wall-add" onClick={addRow}>
          <span aria-hidden="true">+</span> Nog een taak
        </button>
      </fieldset>

      {error && (
        <p className="big-error" role="alert">
          {error}
        </p>
      )}
      <div className="confirm-actions">
        <button className="confirm-keep">Bewaar</button>
        <button type="button" className="confirm-undo" onClick={onCancel}>
          {cancelLabel}
        </button>
      </div>
    </form>
  );
}
