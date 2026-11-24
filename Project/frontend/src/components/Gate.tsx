'use client';

// Screens shown before the real app when Supabase is on: login, first circle, tablet pairing, no connection.
import { useState, type FormEvent } from 'react';
import { createCircle, normalizeCode, pairTablet, signInWithPassword, signUpWithPassword } from '../lib/access';

/** Caregiver: sign in, or make an account. After a sign in the session provider takes over. */
export function LoginScreen() {
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const signUp = mode === 'up';

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return setMessage('Vul je e-mailadres en wachtwoord in.');
    if (signUp && password.length < 6) return setMessage('Kies een wachtwoord van minstens 6 tekens.');
    setBusy(true);
    setMessage('');
    const result = signUp ? await signUpWithPassword(email.trim(), password) : await signInWithPassword(email.trim(), password);
    setBusy(false);
    if (result === 'confirm') setMessage('We stuurden je een e-mail. Bevestig je adres en meld je daarna aan.');
    else if (result === 'wrong') setMessage('Dat e-mailadres of wachtwoord klopt niet. Probeer het nog eens.');
    else if (result === 'exists') setMessage('Dit e-mailadres heeft al een account. Meld je aan.');
    else if (result === 'error') setMessage('Dat lukt nu niet. Probeer het zo meteen opnieuw.');
    // 'ok': the session change moves on to the next screen by itself.
  }

  return (
    <main className="care">
      <header className="care-head">
        <h1>{signUp ? 'Account maken' : 'Aanmelden'}</h1>
        <p className="care-sub">Voor de mantelzorger. Zo zie je wat er op het wandscherm gebeurt, ook als je er niet bent.</p>
      </header>
      <form className="add" onSubmit={submit} noValidate>
        <label>
          E-mailadres
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </label>
        <label>
          Wachtwoord
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
          {signUp ? 'Account maken' : 'Aanmelden'}
        </button>
        <button
          type="button"
          className="link-btn"
          onClick={() => {
            setMode(signUp ? 'in' : 'up');
            setMessage('');
          }}
        >
          {signUp ? 'Ik heb al een account' : 'Account maken'}
        </button>
      </form>
    </main>
  );
}

/** Signed in, but no circle yet: ask who the caregiver cares for. */
export function CreateCircleScreen({ onDone, onSignOut }: { onDone: () => Promise<void>; onSignOut: () => void }) {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return setMessage('Schrijf de voornaam van je naaste.');
    setBusy(true);
    setMessage('');
    const ok = await createCircle(n);
    if (ok) await onDone();
    else setMessage('Dat lukt nu niet. Probeer het zo meteen opnieuw.');
    setBusy(false);
  }

  return (
    <main className="care">
      <header className="care-head">
        <h1>Voor wie zorg je?</h1>
        <p className="care-sub">Deze naam staat in de begroeting op het wandscherm.</p>
      </header>
      <form className="add" onSubmit={submit} noValidate>
        <label>
          Voornaam van je naaste
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="bv. Maria" maxLength={30} autoComplete="off" autoFocus />
        </label>
        {message && (
          <p className="add-error" role="alert">
            {message}
          </p>
        )}
        <button className="primary" disabled={busy}>
          Verder
        </button>
        <button type="button" className="link-btn" onClick={onSignOut}>
          Afmelden
        </button>
      </form>
    </main>
  );
}

/** Tablet: type the code from the family. Calm, one input, one button. */
export function PairScreen({ onDone }: { onDone: () => Promise<void> }) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (normalizeCode(code).length !== 6) return setMessage('De code heeft 6 tekens. Kijk nog even bij je familie.');
    setBusy(true);
    setMessage('');
    const result = await pairTablet(code);
    if (result === 'ok') await onDone();
    else if (result === 'wrong') setMessage('Die code ken ik nog niet. Kijk de code nog eens na en probeer opnieuw.');
    else if (result === 'wait') setMessage('Even rusten. Probeer het over een kwartier opnieuw.');
    else setMessage('Het koppelen lukt nu even niet. Probeer het zo meteen opnieuw.');
    setBusy(false);
  }

  return (
    <main className="wall pair">
      <section className="focus welcome" aria-labelledby="pair-title">
        <div className="focus-text">
          <h1 id="pair-title" className="focus-title">
            Typ de koppelcode van je familie
          </h1>
          <p className="focus-sub">Je familie vindt de code in de Anker-app, onder Instellingen.</p>
          <form className="big-form" onSubmit={submit} noValidate>
            <label htmlFor="pair-code" className="sr-only">
              Koppelcode
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
              Koppelen
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

/** No connection to the server yet. It tries again on its own. */
export function OfflineScreen() {
  return (
    <main className="care">
      <header className="care-head">
        <h1>Even geen verbinding</h1>
        <p className="care-sub">Anker probeert het zo meteen opnieuw. Er gaat niets verloren.</p>
      </header>
    </main>
  );
}
