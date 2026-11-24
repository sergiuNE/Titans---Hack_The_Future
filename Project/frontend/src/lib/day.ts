// Pure day logic: no React, no storage. Time is always passed in.

export type Kind = 'medicijn' | 'maaltijd' | 'bezoek' | 'taak';

export type Item = {
  id: string;
  /** "HH:MM" */
  time: string;
  title: string;
  kind: Kind;
  /** "YYYY-MM-DD" for a one-off item. Without date the item repeats every day. */
  date?: string;
  /** Small data URL, used for visitors. */
  photo?: string;
  /** The caregiver gets a warning when it is still open LATE_MIN minutes after its time. */
  important?: boolean;
};

export type State = {
  name: string;
  items: Item[];
  /** done[dateKey][itemId] = timestamp it was ticked off */
  done: Record<string, Record<string, number>>;
  /** Demo only: shift the clock (ms) so a whole day can be shown in a few minutes. */
  offset?: number;
};

export type SlotState = 'done' | 'open' | 'later';

export type Slot = Item & {
  at: number;
  state: SlotState;
  doneAt?: number;
  /** Important and open for more than LATE_MIN minutes: the caregiver gets a warning. */
  late: boolean;
};

export type Dagdeel = 'ochtend' | 'middag' | 'avond' | 'nacht';

export const LATE_MIN = 60;
const MIN = 60_000;

export function dateKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function timeOnDay(hhmm: string, now: number): number {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

export function dagdeel(now: number): Dagdeel {
  const h = new Date(now).getHours();
  if (h >= 6 && h < 12) return 'ochtend';
  if (h >= 12 && h < 18) return 'middag';
  if (h >= 18 && h < 23) return 'avond';
  return 'nacht';
}

/** "dinsdagmiddag" */
export function momentWord(now: number): string {
  const day = new Date(now).toLocaleDateString('nl-BE', { weekday: 'long' });
  return `${day}${dagdeel(now)}`;
}

export function formatClock(ts: number): string {
  return new Date(ts).toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Today's items as past / now / later.
 * Visits move to "done" by themselves once their time has passed: the patient cannot confirm those.
 * Medicine, meals and tasks stay open until someone ticks them off.
 */
export function today(state: State, now: number) {
  const key = dateKey(now);
  const doneToday = state.done[key] ?? {};
  const slots: Slot[] = state.items
    .filter((i) => !i.date || i.date === key)
    .map((i) => {
      const at = timeOnDay(i.time, now);
      const doneAt = doneToday[i.id] ?? (i.kind === 'bezoek' && at <= now ? at : undefined);
      const state: SlotState = doneAt !== undefined ? 'done' : at <= now ? 'open' : 'later';
      return { ...i, at, doneAt, state, late: !!i.important && state === 'open' && now - at > LATE_MIN * MIN };
    })
    .sort((a, b) => a.at - b.at);

  const meds = slots.filter((s) => s.kind === 'medicijn');
  return {
    key,
    slots,
    done: slots.filter((s) => s.state === 'done'),
    open: slots.filter((s) => s.state === 'open'),
    later: slots.filter((s) => s.state === 'later'),
    meds,
    medsTaken: meds.filter((s) => s.state === 'done').length,
  };
}
