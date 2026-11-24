'use client';

import { useEffect, useState } from 'react';
import { supabaseEnabled } from '../lib/supabase';
import { useDay } from './DayProvider';
import { useLang } from './LangProvider';
import { Home } from './Home';
import { WallScreen } from './WallScreen';
import { CaregiverView } from './CaregiverView';
import { CreateCircleScreen, LoginScreen, OfflineScreen, PairScreen } from './Gate';

/** Neutral screen while the saved state loads, so nothing wrong flashes. */
function Loading({ patient = false }: { patient?: boolean }) {
  const { t } = useLang();
  // Wall screen with Supabase: if the first load is still not there after a few seconds (no internet), say so calmly.
  // The store and the access check keep retrying on their own.
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!patient || !supabaseEnabled) return;
    const id = setTimeout(() => setSlow(true), SLOW_MS);
    return () => clearTimeout(id);
  }, [patient]);
  return (
    <main className="loading" aria-busy="true" aria-label={t('common.loading')}>
      {slow && (
        <p className="loading-note" role="status">
          {t('common.slowLoad')}
        </p>
      )}
    </main>
  );
}

const SLOW_MS = 5000;

export function HomePage() {
  const day = useDay();
  if (!day) return <Loading />;
  return <Home state={day.state} now={day.now} />;
}

export function WallPage() {
  const day = useDay();
  if (!day) return <Loading patient />;
  // Not paired yet: the tablet asks for the koppelcode. A signed-in caregiver can open the wall screen too.
  if (day.access.phase === 'error') return <OfflineScreen />;
  if (day.access.phase === 'signedOut' || day.access.phase === 'noCircle') return <PairScreen onDone={day.refreshAccess} />;
  return <WallScreen state={day.state} now={day.now} onToggle={day.toggle} onName={day.setName} onAdd={day.add} />;
}

export function PlanPage() {
  const day = useDay();
  const { lang } = useLang();
  if (!day) return <Loading />;
  const { dispatch, access } = day;
  if (access.phase === 'error') return <OfflineScreen />;
  // A tablet session cannot plan: ask the caregiver to sign in (that replaces the session).
  if (
    access.phase === 'signedOut' ||
    (access.phase === 'ready' && access.role !== 'caregiver') ||
    (access.phase === 'noCircle' && access.anonymous)
  )
    return <LoginScreen />;
  if (access.phase === 'noCircle') return <CreateCircleScreen onDone={day.refreshAccess} onSignOut={day.signOut} />;
  return (
    <CaregiverView
      state={day.state}
      now={day.now}
      saveError={day.saveError}
      onToggle={day.toggle}
      onAdd={day.add}
      onRemove={(id) => dispatch({ type: 'remove', id })}
      onName={day.setName}
      onOffset={(o) => dispatch({ type: 'setOffset', offset: o })}
      onInvite={(member) => dispatch({ type: 'invite', member })}
      onDemo={() => dispatch({ type: 'loadDemo', lang })}
      onReset={() => dispatch({ type: 'reset' })}
      pairCode={access.phase === 'ready' ? access.circle.pair_code : undefined}
      onSignOut={access.phase === 'ready' ? day.signOut : undefined}
    />
  );
}
