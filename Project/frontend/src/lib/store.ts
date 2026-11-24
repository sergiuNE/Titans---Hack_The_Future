// App state: reducer + localStorage persistence + live sync between tabs.
// Components only dispatch actions.
import { useEffect, useReducer, useState } from 'react';
import { dateKey, type Item, type State } from './day';

export type Action =
  | { type: 'toggle'; id: string; key: string; at: number }
  | { type: 'add'; item: Omit<Item, 'id'> }
  | { type: 'remove'; id: string }
  | { type: 'setName'; name: string }
  | { type: 'setOffset'; offset: number }
  | { type: 'invite'; member: string }
  | { type: 'replace'; state: State }
  | { type: 'loadDemo' }
  | { type: 'reset' };

// v3: the app starts empty. Name first, then the day is planned by the user.
const KEY = 'anker:v3';
const KEEP_DAYS = 7;

/** Fresh start: no name, no tasks. */
export function seed(): State {
  return { name: '', circle: [], items: [], done: {} };
}

/** Demo day for Maria (78), planned by her daughter Els. Only loaded on request (demo button). */
export function demo(now = Date.now()): State {
  const today = dateKey(now);
  return {
    name: 'Maria',
    circle: ['Els', 'Tom'],
    items: [
      { id: 's1', time: '08:00', title: 'Ontbijt', kind: 'maaltijd' },
      { id: 's2', time: '08:30', title: 'Ochtendpillen', kind: 'medicijn', important: true },
      { id: 's3', time: '10:00', title: 'Tom belt even', kind: 'bezoek', date: today },
      { id: 's4', time: '10:30', title: 'Planten water geven', kind: 'taak' },
      { id: 's5', time: '12:30', title: 'Middageten', kind: 'maaltijd' },
      { id: 's10', time: '13:30', title: 'Kapper', kind: 'afspraak', date: today },
      { id: 's6', time: '15:00', title: 'Lisa komt (thuisverpleging)', kind: 'bezoek', date: today },
      { id: 's7', time: '18:00', title: 'Avondeten', kind: 'maaltijd' },
      { id: 's8', time: '20:00', title: 'Avondpillen', kind: 'medicijn', important: true },
      { id: 's9', time: '21:00', title: 'Voordeur op slot doen', kind: 'taak', important: true },
    ],
    done: {},
  };
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'toggle': {
      const day = { ...(state.done[action.key] ?? {}) };
      if (day[action.id] !== undefined) delete day[action.id];
      else day[action.id] = action.at;
      // Keep only the last week of history so storage stays small.
      const keys = Object.keys(state.done).filter((k) => k !== action.key).sort().slice(-(KEEP_DAYS - 1));
      const done = Object.fromEntries(keys.map((k) => [k, state.done[k]]));
      return { ...state, done: { ...done, [action.key]: day } };
    }
    case 'add':
      return { ...state, items: [...state.items, { ...action.item, id: crypto.randomUUID() }] };
    case 'remove':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case 'setName':
      return { ...state, name: action.name };
    case 'setOffset':
      return { ...state, offset: action.offset };
    case 'invite': {
      const circle = state.circle ?? [];
      return circle.includes(action.member) ? state : { ...state, circle: [...circle, action.member] };
    }
    case 'replace':
      return action.state;
    case 'loadDemo': {
      const d = demo();
      return { ...d, name: state.name.trim() || d.name, offset: state.offset };
    }
    case 'reset':
      return seed();
  }
}

function parse(raw: string | null): State | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Partial<State>;
    if (typeof s.name !== 'string' || !Array.isArray(s.items) || typeof s.done !== 'object' || !s.done) return null;
    return s as State;
  } catch {
    return null;
  }
}

function load(): State {
  try {
    return parse(localStorage.getItem(KEY)) ?? seed();
  } catch {
    return seed();
  }
}

/**
 * State that survives a refresh and syncs live between tabs on the same device
 * (wall screen + caregiver view in the demo).
 * shortcut: localStorage only syncs within one browser, swap for a realtime backend (Supabase) for real devices.
 */
export function useDayStore() {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [state]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return;
      const next = parse(e.newValue);
      if (next) dispatch({ type: 'replace', state: next });
    };
    addEventListener('storage', onStorage);
    return () => removeEventListener('storage', onStorage);
  }, []);

  return { state, dispatch, saveError };
}

/** Current time plus the demo shift, refreshed every `ms`. */
export function useNow(offset = 0, ms = 10_000) {
  const [real, setReal] = useState(() => Date.now());
  useEffect(() => {
    setReal(Date.now()); // pick up a new offset at once
    const id = setInterval(() => setReal(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms, offset]);
  return real + offset;
}

export type Route = 'home' | 'scherm' | 'zorg' | 'privacy' | 'voorwaarden';
const PAGES: Route[] = ['scherm', 'zorg', 'privacy', 'voorwaarden'];

/**
 * Hash routes: "#/scherm" = wall screen, "#/zorg" = caregiver, anything else = home.
 * "#/waarom" and friends open home and scroll to the section with that id.
 */
export function useRoute(): Route {
  const [hash, setHash] = useState(() => location.hash);
  useEffect(() => {
    const on = () => setHash(location.hash);
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  const route: Route = PAGES.find((p) => hash.startsWith('#/' + p)) ?? 'home';
  useEffect(() => {
    const id = hash.replace(/^#\/?/, '');
    const el = route === 'home' && id ? document.getElementById(id) : null;
    if (el) el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    else scrollTo(0, 0);
  }, [hash, route]);
  return route;
}
