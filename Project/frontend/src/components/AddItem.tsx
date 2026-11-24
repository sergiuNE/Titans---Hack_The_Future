'use client';

import { useState, type FormEvent } from 'react';
import type { Item, Kind } from '../lib/day';
import { useLang } from './LangProvider';

const KINDS: Kind[] = ['medicijn', 'maaltijd', 'bezoek', 'afspraak', 'taak'];

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
  const { t } = useLang();
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
      setError(t('add.errPhoto'));
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const text = title.trim();
    if (!text) return setError(kind === 'bezoek' ? t('add.errTitleVisit') : t('add.errTitle'));
    if (!/^\d{2}:\d{2}$/.test(time)) return setError(t('add.errTime'));
    if (!daily && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today)) return setError(t('add.errDate'));
    const w = who.trim();
    const r = relation.trim();
    onAdd({
      kind,
      time,
      title: text,
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
        <legend>{t('add.kind')}</legend>
        {KINDS.map((k) => (
          <label key={k} className={kind === k ? 'on' : ''}>
            <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => pickKind(k)} />
            {t(`kind.${k}`)}
          </label>
        ))}
      </fieldset>

      <div className="add-row">
        {!daily && (
          <label className="add-date">
            {t('add.date')}
            <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} required />
          </label>
        )}
        <label className="add-time">
          {t('add.time')}
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </label>
        <label className="add-title">
          {kind === 'bezoek' ? t('add.whoComes') : t('add.what')}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t(`add.ph.${kind}`)}
            maxLength={60}
            aria-invalid={!!error && !title.trim()}
            aria-describedby={error ? 'add-error' : undefined}
          />
        </label>
      </div>

      {kind === 'bezoek' && (
        <div className="add-row">
          <label className="add-title">
            {t('add.visitorName')}
            <input value={who} onChange={(e) => setWho(e.target.value)} placeholder={t('add.visitorNamePh')} maxLength={30} autoComplete="off" />
          </label>
          <label className="add-title">
            {t('add.relation', { name })}
            <input value={relation} onChange={(e) => setRelation(e.target.value)} placeholder={t('add.relationPh')} maxLength={40} autoComplete="off" />
          </label>
        </div>
      )}

      {kind === 'bezoek' && (
        <label className="add-photo">
          {photo ? <img src={photo} alt={t('add.photoAlt')} width={56} height={56} /> : <span className="ph" aria-hidden="true" />}
          <span>{photo ? t('add.photoOther') : t('add.photoAdd')}</span>
          <input type="file" accept="image/*" onChange={(e) => pickPhoto(e.target.files?.[0])} className="sr-only" />
        </label>
      )}

      <label className="add-daily">
        <input type="checkbox" checked={daily} onChange={(e) => setDaily(e.target.checked)} />
        {t('add.daily')}
      </label>

      {kind !== 'bezoek' && (
        <label className="add-daily">
          <input type="checkbox" checked={important} onChange={(e) => setImportant(e.target.checked)} />
          {t('add.important')}
        </label>
      )}

      {error && (
        <p id="add-error" className="add-error" role="alert">
          {error}
        </p>
      )}
      <button className="primary">{t('add.submit')}</button>
    </form>
  );
}
