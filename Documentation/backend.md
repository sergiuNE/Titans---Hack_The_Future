# Logic, state and storage

The MVP has no server. Everything runs in the browser and deploys as static files. The "backend" layer is `Project/frontend/src/lib/`.

## Files

| File | Role |
| --- | --- |
| `lib/day.ts` | Types and pure functions: `today(state, now)` splits the day into done / open / later, `dagdeel`, `momentWord` ("dinsdagmiddag"), formatting. No React, no I/O. |
| `lib/day.test.ts` | Vitest tests for the day rules and the reducer. Add a test for every new rule. |
| `lib/store.ts` | `reducer` (all state changes), `seed` (demo day), `useDayStore` (state + `localStorage` + sync between tabs), `useNow`, `useRoute`. |

## Data model

```ts
type Kind = 'medicijn' | 'maaltijd' | 'bezoek' | 'taak';
type Item = { id: string; time: 'HH:MM'; title: string; kind: Kind; date?: 'YYYY-MM-DD'; photo?: string; important?: boolean };
type State = {
  name: string;                                   // shown on the wall screen
  items: Item[];                                  // without date = every day
  done: Record<dateKey, Record<itemId, number>>;  // when it was ticked off
  offset?: number;                                // demo only: clock shift in ms
};
```

Done state is stored per day, so daily routines (pills every morning) reset on their own at midnight. Only the last 7 days are kept.

## Day rules (`today`)

1. An item belongs to today if it has no `date`, or if its `date` is today.
2. Ticked off today: **done**, with the real time.
3. Visits (`bezoek`) become done on their own once their time has passed. The patient cannot confirm a visit.
4. Time passed and not ticked off: **open**. An `important` item open for more than 60 minutes (`LATE_MIN`) is `late`, which gives the caregiver a warning.
5. Otherwise: **later**.
6. The wall screen shows only the most recent open item. Older missed items are for the caregiver only.

## Demo clock

`state.offset` shifts the clock for the whole app (`useNow(offset)`), so the caregiver's demo buttons move both screens through the day. Ticks use the shifted time too. "Echte tijd" sets it back to 0.

## Sync

`useDayStore` writes to `localStorage` (key `anker:v2`) and listens to the `storage` event. A tick on the wall screen appears at once in the caregiver tab in the same browser.

shortcut: this only syncs within one browser. For tablet + phone, swap storage for Supabase (table `items`, table `done`, Realtime subscription) and keep `day.ts` unchanged.

## Rules for changes

- Keep `day.ts` pure. Time is always passed in (`now`), never read inside.
- Every state change goes through `reducer`. Bump the storage key (`anker:v2`) when the shape of `State` changes.
- Storage errors must not crash the app: `useDayStore` returns `saveError` and the caregiver view shows a banner.
- Photos are resized to at most 240px JPEG before they are stored.
