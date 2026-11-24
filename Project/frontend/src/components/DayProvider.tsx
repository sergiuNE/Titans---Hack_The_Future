'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { dagdeel, dateKey, type Item, type State } from '../lib/day';
import { useDayStore, useNow, type Action } from '../lib/store';
import { useAccess, type Access } from '../lib/access';

type Day = {
  state: State;
  now: number;
  saveError: boolean;
  /** Who is signed in. Phase 'local' when Supabase is not set up. */
  access: Access;
  refreshAccess: () => Promise<void>;
  signOut: () => Promise<void>;
  dispatch: (action: Action) => void;
  toggle: (id: string) => void;
  setName: (name: string) => void;
  add: (item: Omit<Item, 'id'>) => void;
};

const DayContext = createContext<Day | null>(null);

/** Page name for CSS (`data-view`): "/" is home, "/plan" is plan, and so on. */
function viewOf(pathname: string) {
  return pathname.split('/')[1] || 'home';
}

/** Holds the day state for every page and colours the page by part of the day. */
export function DayProvider({ children }: { children: ReactNode }) {
  const { access, refresh, signOut } = useAccess();
  const circleId = access.phase === 'ready' ? access.circle.id : null;
  const store = useDayStore(circleId);
  const { state, dispatch, saveError } = store;
  const ready = store.ready && access.phase !== 'loading';
  const offset = state.offset ?? 0;
  const now = useNow(offset);
  const pathname = usePathname();

  // The whole page takes the colour of the part of the day: a cue that works without reading.
  useEffect(() => {
    if (now !== null) document.documentElement.dataset.dagdeel = dagdeel(now);
  }, [now]);
  useEffect(() => {
    document.documentElement.dataset.view = viewOf(pathname);
  }, [pathname]);

  // Every page starts at the top; a "#section" link on the home page scrolls itself.
  useEffect(() => {
    if (!location.hash) scrollTo(0, 0);
  }, [pathname]);

  const value: Day | null =
    ready && now !== null
      ? {
          state,
          now,
          saveError,
          access,
          refreshAccess: refresh,
          signOut,
          dispatch,
          toggle: (id) => {
            const at = Date.now() + offset;
            dispatch({ type: 'toggle', id, key: dateKey(at), at });
          },
          setName: (name) => dispatch({ type: 'setName', name }),
          add: (item) => dispatch({ type: 'add', item }),
        }
      : null;

  return <DayContext.Provider value={value}>{children}</DayContext.Provider>;
}

/** The day state, or null while the saved state and the clock are still loading. */
export function useDay() {
  return useContext(DayContext);
}
