// Text size of the wall screen. Per tablet: kept in this browser only, never synced and not part of the State.
import { useCallback, useState } from 'react';

export type FontScale = 'normaal' | 'groter' | 'grootst';

export const FONT_SCALES: { value: FontScale; label: string }[] = [
  { value: 'normaal', label: 'Normaal' },
  { value: 'groter', label: 'Groter' },
  { value: 'grootst', label: 'Grootst' },
];

export const FONT_KEY = 'anker:fontscale';

export function parseFontScale(raw: string | null): FontScale {
  return raw === 'groter' || raw === 'grootst' ? raw : 'normaal';
}

function read(): FontScale {
  try {
    return parseFontScale(localStorage.getItem(FONT_KEY));
  } catch {
    return 'normaal';
  }
}

/** Only used by the wall screen, which is never rendered on the server, so reading storage at once is safe. */
export function useFontScale(): [FontScale, (s: FontScale) => void] {
  const [scale, setScale] = useState<FontScale>(read);
  const set = useCallback((s: FontScale) => {
    setScale(s);
    try {
      localStorage.setItem(FONT_KEY, s);
    } catch {
      // The size still applies until the page reloads.
    }
  }, []);
  return [scale, set];
}
