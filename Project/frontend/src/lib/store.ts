// App state: reducer + localStorage persistence + live sync between tabs.
// Components only dispatch actions.
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { dateKey, type Item, type State } from './day';
import { translate, type Lang } from './i18n';
import { supabase, supabaseEnabled } from './supabase';
import { fetchState, subscribe, write, type Write } from './remote';

export type Action =
  | { type: 'toggle'; id: string; key: string; at: number }
  | { type: 'add'; item: Omit<Item, 'id'>; id?: string }
  | { type: 'remove'; id: string }
  | { type: 'setName'; name: string }
  | { type: 'setOffset'; offset: number }
  | { type: 'invite'; member: string }
  | { type: 'replace'; state: State }
  | { type: 'loadDemo'; lang?: Lang }
  | { type: 'reset' };

// v3: the app starts empty. Name first, then the day is planned by the user.
const KEY = 'anker:v3';
const KEEP_DAYS = 7;

/** Fresh start: no name, no tasks. */
export function seed(): State {
  return { name: '', circle: [], items: [], done: {} };
}

/** Demo day for Maria (78), planned by her daughter Els. Only loaded on request (demo button). Titles use `lang`. */
export function demo(now = Date.now(), lang: Lang = 'nl'): State {
  const today = dateKey(now);
  const t = (k: 's1' | 's2' | 's3' | 's3rel' | 's4' | 's5' | 's10' | 's6' | 's6rel' | 's7' | 's8' | 's9') => translate(lang, `demo.${k}` as const);
  return {
    name: 'Maria',
    circle: ['Els', 'Tom'],
    items: [
      { id: 's1', time: '08:00', title: t('s1'), kind: 'maaltijd' },
      { id: 's2', time: '08:30', title: t('s2'), kind: 'medicijn', important: true },
      { id: 's3', time: '10:00', title: t('s3'), kind: 'bezoek', date: today, who: 'Tom', relation: t('s3rel') },
      { id: 's4', time: '10:30', title: t('s4'), kind: 'taak' },
      { id: 's5', time: '12:30', title: t('s5'), kind: 'maaltijd' },
      { id: 's10', time: '13:30', title: t('s10'), kind: 'afspraak', date: today },
      { id: 's6', time: '15:00', title: t('s6'), kind: 'bezoek', date: today, who: 'Lisa', relation: t('s6rel') },
      { id: 's7', time: '18:00', title: t('s7'), kind: 'maaltijd' },
      { id: 's8', time: '20:00', title: t('s8'), kind: 'medicijn', important: true },
      { id: 's9', time: '21:00', title: t('s9'), kind: 'taak', important: true },
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
      return { ...state, items: [...state.items, { ...action.item, id: action.id ?? crypto.randomUUID() }] };
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
      const d = demo(Date.now(), action.lang);
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

/** Safety net next to Realtime: reload now and then, also to renew the signed photo URLs. */
const POLL_MS = 30_000;
/** Many events in a row (a demo day is a dozen inserts) become one reload. */
const RELOAD_DELAY_MS = 250;

/** The demo day with real UUIDs, because the database needs them. */
function remoteDemo(prev: State, lang?: Lang): State {
  const d = demo(Date.now(), lang);
  return {
    ...d,
    items: d.items.map((i) => ({ ...i, id: crypto.randomUUID() })),
    name: prev.name.trim() || d.name,
    offset: prev.offset,
    circle: prev.circle,
  };
}

/** What an action means for the database. Null when it only changes this device (invite, replace). */
function toWrite(a: Action, prev: State): Write | null {
  switch (a.type) {
    case 'toggle':
      return { type: 'toggle', id: a.id, key: a.key, at: a.at, wasDone: prev.done[a.key]?.[a.id] !== undefined };
    case 'add':
      return a.id ? { type: 'add', item: { ...a.item, id: a.id } } : null;
    case 'remove':
      return { type: 'remove', id: a.id, hadPhoto: !!prev.items.find((i) => i.id === a.id)?.photo };
    case 'setName':
      return { type: 'setName', name: a.name };
    case 'setOffset':
      return { type: 'setOffset', offset: a.offset };
    case 'reset':
      return { type: 'reset' };
    default:
      return null;
  }
}

/**
 * The day state, with two storage modes.
 * Local (no Supabase env vars): survives a refresh in localStorage and syncs between tabs of one browser.
 * Remote (`circleId` given): loaded from Supabase, kept fresh by Realtime, and every action is written to the database.
 * Either way the UI is optimistic: the reducer runs first, the write follows, and a failed write sets `saveError`.
 * The first render is always the empty seed (same on server and client); `ready` turns true once real data is in.
 */
export function useDayStore(circleId: string | null = null) {
  const [state, rawDispatch] = useReducer(reducer, undefined, seed);
  const [localReady, setLocalReady] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [saveError, setSaveError] = useState(false);

  const stateRef = useRef(state); // always the latest state, also between two renders
  const circleRef = useRef(circleId);
  const pending = useRef(0); // writes in flight: do not load over an optimistic change
  const dirty = useRef(false); // a load was skipped because of that
  const queue = useRef<Promise<unknown>>(Promise.resolve()); // writes go out in order
  const writes = useRef(0); // counts every write ever started: a load that saw a write start is stale
  const loads = useRef(0); // counts loads: only the newest one may replace the state

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ----- local mode -----
  useEffect(() => {
    if (supabaseEnabled) return;
    const saved = load();
    stateRef.current = saved;
    rawDispatch({ type: 'replace', state: saved });
    setLocalReady(true);
  }, []);

  useEffect(() => {
    if (supabaseEnabled || !localReady) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [state, localReady]);

  useEffect(() => {
    if (supabaseEnabled) return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return;
      const next = parse(e.newValue);
      if (next) rawDispatch({ type: 'replace', state: next });
    };
    addEventListener('storage', onStorage);
    return () => removeEventListener('storage', onStorage);
  }, []);

  // ----- remote mode -----
  const reload = useCallback(async (id: string) => {
    if (!supabase) return;
    if (pending.current > 0) {
      dirty.current = true;
      return;
    }
    const load = ++loads.current;
    const seenWrites = writes.current;
    try {
      const fresh = await fetchState(supabase, id);
      // Skip when the circle changed, or a newer load started, while we were loading.
      if (circleRef.current !== id || load !== loads.current) return;
      // A write started while we were loading: this data may miss it. Load again once the writes are done.
      if (writes.current !== seenWrites) {
        if (pending.current > 0) dirty.current = true;
        else void reload(id);
        return;
      }
      const next: State = { ...fresh, circle: stateRef.current.circle }; // the invite list is local only
      stateRef.current = next;
      rawDispatch({ type: 'replace', state: next });
      setLoadedFor(id);
    } catch {
      // Keep showing what we have. The next poll or event tries again.
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    circleRef.current = circleId;
    if (!circleId) {
      const empty = seed();
      stateRef.current = empty;
      rawDispatch({ type: 'replace', state: empty });
      setLoadedFor(null);
      return;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const soon = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void reload(circleId), RELOAD_DELAY_MS);
    };
    void reload(circleId);
    const unsubscribe = subscribe(supabase, circleId, soon, (itemId) => stateRef.current.items.some((i) => i.id === itemId));
    const poll = setInterval(() => void reload(circleId), POLL_MS);
    const onVisible = () => document.visibilityState === 'visible' && void reload(circleId);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(timer);
      clearInterval(poll);
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [circleId, reload]);

  const dispatch = useCallback(
    (action: Action) => {
      const prev = stateRef.current;
      const id = circleRef.current;
      let a = action;
      let w: Write | null = null;
      if (supabaseEnabled && id) {
        if (a.type === 'add') a = { ...a, id: crypto.randomUUID() };
        if (a.type === 'loadDemo') {
          const d = remoteDemo(prev, a.lang);
          a = { type: 'replace', state: d };
          w = { type: 'demo', items: d.items, name: d.name };
        } else {
          w = toWrite(a, prev);
          // Reset empties the plan but keeps the circle: its name and koppelcode stay.
          if (a.type === 'reset') a = { type: 'replace', state: { ...seed(), name: prev.name, circle: prev.circle, offset: prev.offset } };
        }
      }
      stateRef.current = reducer(prev, a);
      rawDispatch(a);

      if (!w || !supabase) return;
      const sb = supabase;
      const job = w;
      pending.current++;
      writes.current++;
      queue.current = queue.current
        .then(() => write(sb, id!, job))
        .then(
          () => setSaveError(false),
          () => {
            setSaveError(true);
            dirty.current = true; // load again so the screen shows what the database really has
          },
        )
        .finally(() => {
          pending.current--;
          if (pending.current === 0 && dirty.current) {
            dirty.current = false;
            void reload(id!);
          }
        });
    },
    [reload],
  );

  const ready = supabaseEnabled ? circleId === null || loadedFor === circleId : localReady;
  return { state, dispatch, saveError, ready };
}

/** Current time plus the demo shift, refreshed every `ms`. Null until mounted (the server has no useful clock). */
export function useNow(offset = 0, ms = 10_000): number | null {
  const [real, setReal] = useState<number | null>(null);
  useEffect(() => {
    setReal(Date.now()); // pick up a new offset at once
    const id = setInterval(() => setReal(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms, offset]);
  return real === null ? null : real + offset;
}
