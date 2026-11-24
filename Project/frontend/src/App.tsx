import { useEffect } from 'react';
import { dagdeel, dateKey } from './lib/day';
import { useDayStore, useNow, useRoute } from './lib/store';
import { WallScreen } from './components/WallScreen';
import { CaregiverView } from './components/CaregiverView';

export default function App() {
  const { state, dispatch, saveError } = useDayStore();
  const offset = state.offset ?? 0;
  const now = useNow(offset);
  const route = useRoute();
  const toggle = (id: string) => {
    const at = Date.now() + offset;
    dispatch({ type: 'toggle', id, key: dateKey(at), at });
  };

  // The whole page takes the colour of the part of the day: a cue that works without reading.
  useEffect(() => {
    document.documentElement.dataset.dagdeel = dagdeel(now);
    document.documentElement.dataset.view = route;
  }, [now, route]);

  return route === 'zorg' ? (
    <CaregiverView
      state={state}
      now={now}
      saveError={saveError}
      onToggle={toggle}
      onAdd={(item) => dispatch({ type: 'add', item })}
      onRemove={(id) => dispatch({ type: 'remove', id })}
      onName={(name) => dispatch({ type: 'setName', name })}
      onOffset={(o) => dispatch({ type: 'setOffset', offset: o })}
      onReset={() => dispatch({ type: 'reset' })}
    />
  ) : (
    <WallScreen state={state} now={now} onToggle={toggle} />
  );
}
