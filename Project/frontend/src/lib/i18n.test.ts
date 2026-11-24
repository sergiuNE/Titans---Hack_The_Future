import { describe, expect, it } from 'vitest';
import { DICTIONARIES, LANGS, parseLang, translate, type Key } from './i18n';

const keys = Object.keys(DICTIONARIES.nl).sort();

describe('dictionaries', () => {
  it.each(LANGS)('%s has exactly the keys of nl and no empty text', (lang) => {
    expect(Object.keys(DICTIONARIES[lang]).sort()).toEqual(keys);
    for (const key of keys) expect(DICTIONARIES[lang][key as Key].trim(), `${lang}:${key}`).not.toBe('');
  });

  it.each(LANGS)('%s uses the same {placeholders} as nl', (lang) => {
    const holes = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
    for (const key of keys) expect(holes(DICTIONARIES[lang][key as Key]), `${lang}:${key}`).toEqual(holes(DICTIONARIES.nl[key as Key]));
  });
});

describe('translate', () => {
  it('fills in placeholders', () => {
    expect(translate('en', 'wall.plannedAt', { time: '09:00' })).toBe('Planned for 09:00');
    expect(translate('fr', 'wall.pillNotYet')).toBe('Pas encore prises');
    expect(translate('nl', 'wall.pillNotYet')).toBe('Nog niet genomen');
  });

  it('falls back to Dutch for an unknown saved language', () => {
    expect(parseLang('de')).toBe('nl');
    expect(parseLang(null)).toBe('nl');
    expect(parseLang('fr')).toBe('fr');
  });
});
