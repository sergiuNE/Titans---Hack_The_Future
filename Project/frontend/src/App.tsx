import { useEffect } from 'react';
import { dagdeel, dateKey, type Item } from './lib/day';
import { useDayStore, useNow, useRoute } from './lib/store';
import { WallScreen } from './components/WallScreen';
import { CaregiverView } from './components/CaregiverView';
import { Home } from './components/Home';
import { SiteHeader } from './components/SiteHeader';
import { SiteFooter } from './components/SiteFooter';

export default function App() {
  const { state, dispatch, saveError } = useDayStore();
  const offset = state.offset ?? 0;
  const now = useNow(offset);
  const route = useRoute();
  const toggle = (id: string) => {
    const at = Date.now() + offset;
    dispatch({ type: 'toggle', id, key: dateKey(at), at });
  };
  const setName = (name: string) => dispatch({ type: 'setName', name });
  const add = (item: Omit<Item, 'id'>) => dispatch({ type: 'add', item });

  // The whole page takes the colour of the part of the day: a cue that works without reading.
  useEffect(() => {
    document.documentElement.dataset.dagdeel = dagdeel(now);
    document.documentElement.dataset.view = route;
  }, [now, route]);

  return (
    <>
      {/* The wall screen stays calm: no menu bar on top, the footer sits below the fold. */}
      {route !== 'scherm' && <SiteHeader route={route} />}
      {route === 'home' && <Home state={state} now={now} />}
      {route === 'scherm' && <WallScreen state={state} now={now} onToggle={toggle} onName={setName} onAdd={add} />}
      {route === 'zorg' && (
        <CaregiverView
          state={state}
          now={now}
          saveError={saveError}
          onToggle={toggle}
          onAdd={add}
          onRemove={(id) => dispatch({ type: 'remove', id })}
          onName={setName}
          onOffset={(o) => dispatch({ type: 'setOffset', offset: o })}
          onInvite={(member) => dispatch({ type: 'invite', member })}
          onReset={() => dispatch({ type: 'reset' })}
        />
      )}
      <SiteFooter />
    </>
  );
}
