// Who is using this device: signed out, signed in without a circle, or a member of a circle.
// Local mode (no Supabase env vars) has no accounts: the phase is always 'local'.
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase, supabaseEnabled } from './supabase';
import type { CircleRow } from './remote';

export type Role = 'caregiver' | 'tablet';

export type Access =
  | { phase: 'local' }
  | { phase: 'loading' }
  | { phase: 'error' } // could not reach the server; retried on its own
  | { phase: 'signedOut' }
  | { phase: 'noCircle'; anonymous: boolean } // anonymous: a tablet whose pairing did not work
  | { phase: 'ready'; circle: CircleRow; role: Role };

const RETRY_MS = 10_000;

/** Reads the session and the user's circle, and follows sign in and sign out. */
export function useAccess() {
  const [access, setAccess] = useState<Access>({ phase: supabaseEnabled ? 'loading' : 'local' });
  const calls = useRef(0); // only the newest check may set the phase (sign in fires one, the pairing screen another)

  const refresh = useCallback(async (): Promise<void> => {
    if (!supabase) return;
    const call = ++calls.current;
    const set = (a: Access) => {
      if (call === calls.current) setAccess(a);
    };
    try {
      const { data: auth } = await supabase.auth.getSession();
      if (!auth.session) return set({ phase: 'signedOut' });
      // 'caregiver' sorts before 'tablet': an account that is both opens as caregiver.
      const { data, error } = await supabase
        .from('member')
        .select('role, circle(id,name,pair_code,demo_offset)')
        .eq('user_id', auth.session.user.id)
        .order('role')
        .limit(1);
      if (error) throw error;
      const row = data?.[0] as unknown as { role: Role; circle: CircleRow | null } | undefined;
      set(row?.circle ? { phase: 'ready', circle: row.circle, role: row.role } : { phase: 'noCircle', anonymous: !!auth.session.user.is_anonymous });
    } catch {
      set({ phase: 'error' });
    }
  }, []);

  useEffect(() => {
    if (!supabase) return;
    void refresh();
    // Do not call Supabase inside this callback (it can deadlock): hop out of it first.
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') setTimeout(() => void refresh(), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  useEffect(() => {
    if (access.phase !== 'error') return;
    const id = setTimeout(() => void refresh(), RETRY_MS);
    return () => clearTimeout(id);
  }, [access.phase, refresh]);

  const signOut = useCallback(async () => {
    calls.current++; // a check still running must not undo the sign out
    await supabase?.auth.signOut();
    setAccess({ phase: 'signedOut' });
  }, []);

  return { access, refresh, signOut };
}

// ---------- Actions used by the login and pairing screens ----------

export type AuthResult = 'ok' | 'confirm' | 'wrong' | 'exists' | 'error';

export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return 'error';
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error) return 'ok';
  if (error.code === 'email_not_confirmed') return 'confirm';
  return error.status === 400 ? 'wrong' : 'error';
}

/** 'confirm' means the account exists but the e-mail must be confirmed first. */
export async function signUpWithPassword(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return 'error';
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return /registered|exists/i.test(error.message) ? 'exists' : 'error';
  // Supabase hides an existing address behind an empty identities list.
  if (data.user && data.user.identities?.length === 0) return 'exists';
  return data.session ? 'ok' : 'confirm';
}

/** Makes the circle for the person the caregiver cares for (or gives back the one they already have). */
export async function createCircle(name: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.rpc('create_circle', { p_name: name });
  return !error;
}

/** Ignores spaces and dashes, so "ab3 k9x" and "AB3-K9X" both work. */
export function normalizeCode(raw: string): string {
  return raw.replace(/[\s-]/g, '').toUpperCase();
}

/**
 * Signs the tablet in anonymously (once) and joins the circle with the code.
 * A caregiver account on this device is signed out first: the tablet must never turn that account into a tablet.
 * 'wait': too many wrong codes, try again in 15 minutes.
 */
export async function pairTablet(code: string): Promise<'ok' | 'wrong' | 'wait' | 'error'> {
  if (!supabase) return 'error';
  const { data } = await supabase.auth.getSession();
  if (data.session && !data.session.user.is_anonymous) await supabase.auth.signOut();
  if (!data.session || !data.session.user.is_anonymous) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) return 'error';
  }
  const { data: circleId, error } = await supabase.rpc('pair_tablet', { p_code: normalizeCode(code) });
  if (error) return error.message.includes('too_many') ? 'wait' : 'error';
  return circleId ? 'ok' : 'wrong';
}
