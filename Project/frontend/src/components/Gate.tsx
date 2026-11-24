'use client';

// Screens shown before the real app when Supabase is on: login, first circle, tablet pairing, no connection.
import { useState, type FormEvent } from 'react';
import { LangSwitch, useLang } from './LangProvider';
import { createCircle, normalizeCode, pairTablet, signInWithPassword, signUpWithPassword } from '../lib/access';

/** Caregiver: sign in, or make an account. After a sign in the session provider takes over. */
export function LoginScreen() {
  const { t } = useLang();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const signUp = mode === 'up';

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return setMessage(t('gate.errFill'));
    if (signUp && password.length < 6) return setMessage(t('gate.errShort'));
    setBusy(true);
    setMessage('');
    const result = signUp ? await signUpWithPassword(email.trim(), password) : await signInWithPassword(email.trim(), password);
    setBusy(false);
    if (result === 'confirm') setMessage(t('gate.confirm'));
    else if (result === 'wrong') setMessage(t('gate.wrong'));
    else if (result === 'exists') setMessage(t('gate.exists'));
    else if (result === 'error') setMessage(t('gate.error'));
    // 'ok': the session change moves on to the next screen by itself.
  }

  return (
    <main className="care">
      <header className="care-head">
        <h1>{signUp ? t('gate.signUp') : t('gate.signIn')}</h1>
        <p className="care-sub">{t('gate.loginSub')}</p>
      </header>
      <form className="add" onSubmit={submit} noValidate>
        <label>
          {t('gate.email')}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>
        <label>
          {t('gate.password')}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={signUp ? 'new-password' : 'current-password'}
            required
          />
        </label>
        {message && (
          <p className="add-error" role="alert">
            {message}
          </p>
        )}
        <button className="primary" disabled={busy}>
          {signUp ? t('gate.signUp') : t('gate.signIn')}
        </button>
        <button
          type="button"
          className="link-btn"
          onClick={() => {
            setMode(signUp ? 'in' : 'up');
            setMessage('');
          }}
        >
          {signUp ? t('gate.haveAccount') : t('gate.signUp')}
        </button>
      </form>
    </main>
  );
}

/** Signed in, but no circle yet: ask who the caregiver cares for. */
export function CreateCircleScreen({ onDone, onSignOut }: { onDone: () => Promise<void>; onSignOut: () => void }) {
  const { t } = useLang();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return setMessage(t('gate.circleErr'));
    setBusy(true);
    setMessage('');
    const ok = await createCircle(n);
    if (ok) await onDone();
    else setMessage(t('gate.error'));
    setBusy(false);
  }

  return (
    <main className="care">
      <header className="care-head">
        <h1>{t('gate.circleTitle')}</h1>
        <p className="care-sub">{t('gate.circleSub')}</p>
      </header>
      <form className="add" onSubmit={submit} noValidate>
        <label>
          {t('gate.circleName')}
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('care.namePlaceholder')} maxLength={30} autoComplete="off" autoFocus />
        </label>
        {message && (
          <p className="add-error" role="alert">
            {message}
          </p>
        )}
        <button className="primary" disabled={busy}>
          {t('gate.next')}
        </button>
        <button type="button" className="link-btn" onClick={onSignOut}>
          {t('common.signOut')}
        </button>
      </form>
    </main>
  );
}

/** Tablet: type the code from the family. Calm, one input, one button. */
export function PairScreen({ onDone }: { onDone: () => Promise<void> }) {
  const { t } = useLang();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (normalizeCode(code).length !== 6) return setMessage(t('gate.pairErrLength'));
    setBusy(true);
    setMessage('');
    const result = await pairTablet(code);
    if (result === 'ok') await onDone();
    else if (result === 'wrong') setMessage(t('gate.pairWrong'));
    else if (result === 'wait') setMessage(t('gate.pairWait'));
    else setMessage(t('gate.pairError'));
    setBusy(false);
  }

  return (
    <main className="wall pair">
      <section className="focus welcome" aria-labelledby="pair-title">
        <div className="focus-text">
          <h1 id="pair-title" className="focus-title">
            {t('gate.pairTitle')}
          </h1>
          <p className="focus-sub">{t('gate.pairSub')}</p>
          <form className="big-form" onSubmit={submit} noValidate>
            <label htmlFor="pair-code" className="sr-only">
              {t('gate.pairLabel')}
            </label>
            <input
              id="pair-code"
              className="big-input pair-input"
              value={code}
              onChange={(e) => setCode(normalizeCode(e.target.value).slice(0, 6))}
              maxLength={6}
              autoComplete="off"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              autoFocus
              placeholder="______"
              aria-describedby={message ? 'pair-msg' : undefined}
            />
            {message && (
              <p id="pair-msg" className="big-error" role="alert">
                {message}
              </p>
            )}
            <button className="done-btn" disabled={busy}>
              {t('gate.pairSubmit')}
            </button>
          </form>
        </div>
      </section>
      <nav className="wall-foot" aria-label={t('wall.settings')}>
        <LangSwitch wall />
      </nav>
    </main>
  );
}

/** No connection to the server yet. It tries again on its own. */
export function OfflineScreen() {
  const { t } = useLang();
  return (
    <main className="care">
      <header className="care-head">
        <h1>{t('gate.offlineTitle')}</h1>
        <p className="care-sub">{t('gate.offlineSub')}</p>
      </header>
    </main>
  );
}
