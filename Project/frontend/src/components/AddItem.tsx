'use client';

import { useState, type FormEvent } from 'react';
import type { Item, Kind } from '../lib/day';

const KINDS: { value: Kind; label: string }[] = [
  { value: 'medicijn', label: 'Medicijn' },
  { value: 'maaltijd', label: 'Maaltijd' },
  { value: 'bezoek', label: 'Bezoek' },
  { value: 'afspraak', label: 'Afspraak' },
  { value: 'taak', label: 'Taak' },
];

/** Shrink a photo to a small JPEG data URL so it fits in localStorage. */
async function toThumb(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const s = Math.min(1, 240 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * s);
  c.height = Math.round(bmp.height * s);
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.8);
}

export function AddItem({ onAdd, today, name }: { onAdd: (item: Omit<Item, 'id'>) => void; today: string; name: string }) {
  const [kind, setKind] = useState<Kind>('medicijn');
  const [time, setTime] = useState('09:00');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today);
  const [daily, setDaily] = useState(false);
  const [important, setImportant] = useState(true);
  const [photo, setPhoto] = useState<string>();
  const [who, setWho] = useState('');
  const [relation, setRelation] = useState('');
  const [error, setError] = useState('');

  function pickKind(k: Kind) {
    setKind(k);
    setImportant(k === 'medicijn');
    if (k !== 'bezoek') setPhoto(undefined);
  }

  async function pickPhoto(file?: File) {
    if (!file) return;
    try {
      setPhoto(await toThumb(file));
      setError('');
    } catch {
      setError('Deze foto kan niet gelezen worden. Kies een JPG of PNG.');
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return setError(kind === 'bezoek' ? 'Schrijf wie er komt, bv. “Lisa komt op bezoek”.' : 'Schrijf wat er moet gebeuren.');
    if (!/^\d{2}:\d{2}$/.test(time)) return setError('Kies een uur.');
    if (!daily && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today)) return setError('Kies vandaag of een dag later.');
    const w = who.trim();
    const r = relation.trim();
    onAdd({
      kind,
      time,
      title: t,
      ...(daily ? {} : { date }),
      ...(photo ? { photo } : {}),
      ...(kind === 'bezoek' && w ? { who: w } : {}),
      ...(kind === 'bezoek' && r ? { relation: r } : {}),
      ...(important && kind !== 'bezoek' ? { important } : {}),
    });
    setTitle('');
    setPhoto(undefined);
    setWho('');
    setRelation('');
    setError('');
  }

  return (
    <form className="add" onSubmit={submit} noValidate>
      <fieldset className="kinds">
        <legend>Soort</legend>
        {KINDS.map((k) => (
          <label key={k.value} className={kind === k.value ? 'on' : ''}>
            <input type="radio" name="kind" value={k.value} checked={kind === k.value} onChange={() => pickKind(k.value)} />
            {k.label}
          </label>
        ))}
      </fieldset>

      <div className="add-row">
        {!daily && (
          <label className="add-date">
            Datum
            <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} required />
          </label>
        )}
        <label className="add-time">
          Uur
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </label>
        <label className="add-title">
          {kind === 'bezoek' ? 'Wie komt er?' : 'Wat moet er gebeuren?'}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              { bezoek: 'Tom komt koffie drinken', medicijn: 'Middagpillen', afspraak: 'Kapper', maaltijd: 'Avondeten', taak: 'Planten water geven' }[kind]
            }
            maxLength={60}
            aria-invalid={!!error && !title.trim()}
            aria-describedby={error ? 'add-error' : undefined}
          />
        </label>
      </div>

      {kind === 'bezoek' && (
        <div className="add-row">
          <label className="add-title">
            Naam (voor “Wie is dit?”, mag leeg)
            <input value={who} onChange={(e) => setWho(e.target.value)} placeholder="Tom" maxLength={30} autoComplete="off" />
          </label>
          <label className="add-title">
            Wie is dit voor {name}? (mag leeg)
            <input value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="je zoon" maxLength={40} autoComplete="off" />
          </label>
        </div>
      )}

      {kind === 'bezoek' && (
        <label className="add-photo">
          {photo ? <img src={photo} alt="Gekozen foto" width={56} height={56} /> : <span className="ph" aria-hidden="true" />}
          <span>{photo ? 'Andere foto kiezen' : 'Foto toevoegen (zo herkent je naaste wie er komt)'}</span>
          <input type="file" accept="image/*" onChange={(e) => pickPhoto(e.target.files?.[0])} className="sr-only" />
        </label>
      )}

      <label className="add-daily">
        <input type="checkbox" checked={daily} onChange={(e) => setDaily(e.target.checked)} />
        Elke dag herhalen
      </label>

      {kind !== 'bezoek' && (
        <label className="add-daily">
          <input type="checkbox" checked={important} onChange={(e) => setImportant(e.target.checked)} />
          Belangrijk: waarschuw me als het een uur later nog openstaat
        </label>
      )}

      {error && (
        <p id="add-error" className="add-error" role="alert">
          {error}
        </p>
      )}
      <button className="primary">Toevoegen</button>
    </form>
  );
}
