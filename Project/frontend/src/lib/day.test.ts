import { describe, expect, it } from 'vitest';
import { today, dagdeel, momentWord, dateKey, overview, isEvening, type State } from './day';
import { reducer } from './store';
import { describe as describeWeather } from './weather';

describe('weather', () => {
  it('maps WMO codes to plain words', () => {
    expect(describeWeather(0).label).toBe('Zonnig');
    expect(describeWeather(3).label).toBe('Bewolkt');
    expect(describeWeather(61).label).toBe('Regen');
    expect(describeWeather(73).label).toBe('Sneeuw');
  });
});

const now = new Date(2026, 10, 24, 14, 0).getTime(); // dinsdag 24 nov 2026, 14:00
const key = dateKey(now);

const state: State = {
  name: 'Maria',
  items: [
    { id: 'pil1', time: '08:30', title: 'Ochtendpillen', kind: 'medicijn', important: true },
    { id: 'pil2', time: '12:45', title: 'Middagpillen', kind: 'medicijn', important: true },
    { id: 'pil3', time: '13:50', title: 'Vitamine', kind: 'medicijn', important: true },
    { id: 'plant', time: '10:00', title: 'Planten water geven', kind: 'taak' },
    { id: 'lisa', time: '11:00', title: 'Lisa komt', kind: 'bezoek', date: key },
    { id: 'jan', time: '11:00', title: 'Jan komt', kind: 'bezoek', date: '2026-11-25' },
    { id: 'eten', time: '18:00', title: 'Avondeten', kind: 'maaltijd' },
  ],
  done: { [key]: { pil1: now - 5 * 3600_000 } },
};

describe('today', () => {
  const t = today(state, now);

  it('splits items into done, open and later, sorted by time', () => {
    expect(t.done.map((s) => s.id)).toEqual(['pil1', 'lisa']);
    expect(t.open.map((s) => s.id)).toEqual(['plant', 'pil2', 'pil3']);
    expect(t.later.map((s) => s.id)).toEqual(['eten']);
  });

  it('skips one-off items of another day', () => {
    expect(t.slots.some((s) => s.id === 'jan')).toBe(false);
  });

  it('warns only for important items open for more than an hour', () => {
    const late = (id: string) => t.open.find((s) => s.id === id)?.late;
    expect(late('pil2')).toBe(true);
    expect(late('pil3')).toBe(false);
    expect(late('plant')).toBe(false);
  });

  it('counts medicine taken', () => {
    expect([t.medsTaken, t.meds.length]).toEqual([1, 3]);
  });
});

describe('moment', () => {
  it('names the part of the day', () => {
    expect(dagdeel(now)).toBe('middag');
    expect(dagdeel(new Date(2026, 10, 24, 2, 0).getTime())).toBe('nacht');
    expect(momentWord(now)).toBe('dinsdagmiddag');
  });
});

describe('reducer', () => {
  it('toggles an item done and back for one day only', () => {
    const on = reducer(state, { type: 'toggle', id: 'pil2', key, at: now });
    expect(on.done[key].pil2).toBe(now);
    const off = reducer(on, { type: 'toggle', id: 'pil2', key, at: now });
    expect(off.done[key].pil2).toBeUndefined();
  });

  it('starts empty and loads the demo day only on request, keeping the chosen name', () => {
    const fresh = reducer(state, { type: 'reset' });
    expect([fresh.name, fresh.items.length]).toEqual(['', 0]);
    const d = reducer({ ...fresh, name: 'Rosa' }, { type: 'loadDemo' });
    expect(d.name).toBe('Rosa');
    expect(d.items.length).toBeGreaterThan(0);
  });

  it('invites a family member once', () => {
    const once = reducer(state, { type: 'invite', member: 'Tom' });
    expect(reducer(once, { type: 'invite', member: 'Tom' }).circle).toEqual(['Tom']);
  });

  it('shifts the demo clock', () => {
    expect(reducer(state, { type: 'setOffset', offset: 3600_000 }).offset).toBe(3600_000);
  });
});

describe('overview', () => {
  it('counts done moments and lists what is left, important ones apart', () => {
    const o = overview(today(state, now).slots);
    expect([o.done, o.total]).toEqual([2, 6]);
    expect(o.left.map((s) => s.id)).toEqual(['plant', 'pil2', 'pil3', 'eten']);
    expect(o.leftImportant.map((s) => s.id)).toEqual(['pil2', 'pil3']);
  });

  it('is empty-safe', () => {
    expect(overview([])).toEqual({ total: 0, done: 0, left: [], leftImportant: [] });
  });

  it('is evening from 18:00', () => {
    expect(isEvening(new Date(2026, 10, 24, 17, 59).getTime())).toBe(false);
    expect(isEvening(new Date(2026, 10, 24, 18, 0).getTime())).toBe(true);
    expect(isEvening(new Date(2026, 10, 24, 23, 30).getTime())).toBe(true);
  });
});
