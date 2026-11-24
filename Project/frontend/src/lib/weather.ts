// Current weather from Open-Meteo (free, no key, no personal data sent).
import { useEffect, useState } from 'react';
import type { Dagdeel } from './day';
import { translate, type Lang } from './i18n';

// shortcut: fixed location (Mortsel, where the persona lives); move to a per-circle setting with a real backend.
const URL =
  'https://api.open-meteo.com/v1/forecast?latitude=51.17&longitude=4.46&current=temperature_2m,weather_code,precipitation&timezone=Europe%2FBrussels';

export type Sky = 'zon' | 'wolk' | 'mist' | 'regen' | 'sneeuw' | 'onweer';
/** `precip` is the rain falling right now, in mm. */
export type Weather = { temp: number; sky: Sky; precip: number };

const COLD_BELOW = 8;
const HOT_ABOVE = 25;

/** One short, warm tip from the weather. Null when there is nothing to say, and always at night and in the evening. */
export function weatherTip(w: Weather | null, part: Dagdeel, lang: Lang = 'nl'): string | null {
  if (!w || (part !== 'ochtend' && part !== 'middag')) return null;
  if (w.sky === 'regen' || w.sky === 'onweer' || w.precip > 0) return translate(lang, 'tip.rain');
  if (w.temp < COLD_BELOW) return translate(lang, 'tip.cold');
  if (w.temp > HOT_ABOVE) return translate(lang, 'tip.hot');
  return null;
}

/** WMO weather code to a sky. The word for it is `sky.<sky>` in the dictionaries. */
export function describe(code: number): { sky: Sky } {
  if (code <= 1) return { sky: 'zon' };
  if (code <= 3) return { sky: 'wolk' };
  if (code === 45 || code === 48) return { sky: 'mist' };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { sky: 'sneeuw' };
  if (code >= 95) return { sky: 'onweer' };
  return { sky: 'regen' };
}

/** Refreshes every 30 minutes. Returns null while loading or when offline: the screen then simply shows no weather. */
export function useWeather(): Weather | null {
  const [w, setW] = useState<Weather | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch(URL)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((d) => {
          const t = d?.current?.temperature_2m;
          const c = d?.current?.weather_code;
          const p = d?.current?.precipitation;
          if (alive && typeof t === 'number' && typeof c === 'number') setW({ temp: Math.round(t), precip: typeof p === 'number' ? p : 0, ...describe(c) });
        })
        .catch(() => {}); // weather is a nice-to-have; never break the wall screen over it
    load();
    const id = setInterval(load, 30 * 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);
  return w;
}
