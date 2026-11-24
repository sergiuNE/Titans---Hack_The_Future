'use client';

import { createContext, Fragment, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LANGS, LANG_NAMES, readLang, storeLang, translate, DICTIONARIES, type Key, type Lang, type Vars } from '../lib/i18n';

type Ctx = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Plain text with {placeholders}. */
  t: (key: Key, vars?: Vars) => string;
  /** Text where a placeholder is an element, e.g. a <strong> around a time. */
  tr: (key: Key, vars: Record<string, ReactNode>) => ReactNode;
};

const LangContext = createContext<Ctx | null>(null);

/** Holds the language of this device. Dutch until mounted, so server and browser agree; then the saved choice. */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('nl');

  useEffect(() => {
    setLangState(readLang());
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    storeLang(next);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: (key, vars) => translate(lang, key, vars),
      tr: (key, vars) =>
        DICTIONARIES[lang][key].split(/(\{\w+\})/).map((part, i) => {
          const name = /^\{(\w+)\}$/.exec(part)?.[1];
          return name && name in vars ? <Fragment key={i}>{vars[name]}</Fragment> : part;
        }),
    }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang needs a LangProvider');
  return ctx;
}

/** "NL · FR · EN" in the header (compact) or full names on the wall screen. The current language has aria-current. */
export function LangSwitch({ wall = false }: { wall?: boolean }) {
  const { lang, setLang, t } = useLang();
  const buttons = LANGS.map((l) => (
    <button
      key={l}
      type="button"
      className={wall ? 'wall-link' : 'lang-btn'}
      lang={l}
      aria-label={wall ? undefined : LANG_NAMES[l]}
      aria-current={lang === l ? 'true' : undefined}
      onClick={() => setLang(l)}
    >
      {wall ? LANG_NAMES[l] : l.toUpperCase()}
    </button>
  ));
  if (wall)
    return (
      <div className="wall-size" role="group" aria-label={t('lang.label')}>
        <span>{t('lang.wallLabel')}</span>
        {buttons}
      </div>
    );
  return (
    <div className="lang-switch" role="group" aria-label={t('lang.label')}>
      {buttons}
    </div>
  );
}
