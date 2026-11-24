// Current weather from Open-Meteo (free, no key, no personal data sent).
import { useEffect, useState } from 'react';

// shortcut: fixed location (Mortsel, where the persona lives); move to a per-circle setting with a real backend.
const URL =
  'https://api.open-meteo.com/v1/forecast?latitude=51.17&longitude=4.46&current=temperature_2m,weather_code&timezone=Europe%2FBrussels';

export type Sky = 'zon' | 'wolk' | 'mist' | 'regen' | 'sneeuw' | 'onweer';
export type Weather = { temp: number; sky: Sky; label: string };

/** WMO weather code to a plain Dutch word. */
export function describe(code: number): { sky: Sky; label: string } {
  if (code <= 1) return { sky: 'zon', label: 'Zonnig' };
  if (code <= 3) return { sky: 'wolk', label: 'Bewolkt' };
  if (code === 45 || code === 48) return { sky: 'mist', label: 'Mistig' };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { sky: 'sneeuw', label: 'Sneeuw' };
  if (code >= 95) return { sky: 'onweer', label: 'Onweer' };
  return { sky: 'regen', label: 'Regen' };
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
          if (alive && typeof t === 'number' && typeof c === 'number') setW({ temp: Math.round(t), ...describe(c) });
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
