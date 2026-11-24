# Logic, state and storage

There is no server code. Everything runs in the browser and deploys as a Next.js app. The "backend" layer is `Project/frontend/src/lib/`, plus an optional Supabase project (`Project/frontend/supabase/schema.sql`). Without the two env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` the app runs in local mode (`localStorage`); with them it syncs through Supabase.

## Files

| File | Role |
| --- | --- |
| `lib/day.ts` | Types and pure functions: `today(state, now)` splits the day into done / open / later, `dagdeel`, `momentWord` ("dinsdagmiddag"), formatting. No React, no I/O. |
| `lib/day.test.ts` | Vitest tests for the day rules and the reducer. Add a test for every new rule. |
| `lib/store.ts` | `reducer` (all state changes), `seed` (empty start), `demo` (example day), `useDayStore(circleId)` (state; local mode: `localStorage` + sync between tabs, remote mode: Supabase), `useNow` (null until mounted). |
| `lib/weather.ts` | Open-Meteo fetch (`useWeather`) and the pure `weatherTip(weather, dagdeel)`. |
| `lib/fontscale.ts` | Wall screen text size per device (`anker:fontscale`, local only). |
| `lib/supabase.ts` | `supabaseEnabled` (both env vars set) and the browser client (null in local mode). |
| `lib/remote.ts` | Pure mappers between database rows and `State` (tested in `remote.test.ts`), plus `fetchState`, `write` (one function per action) and `subscribe` (Realtime). |
| `lib/access.ts` | `useAccess` (signed out / no circle / member of a circle), login, sign up, `createCircle`, `pairTablet`. |

## Data model

```ts
type Kind = 'medicijn' | 'maaltijd' | 'bezoek' | 'taak';
type Item = {
  id: string; time: 'HH:MM'; title: string; kind: Kind; date?: 'YYYY-MM-DD'; photo?: string; important?: boolean;
  who?: string;       // visits: name for "Wie is dit?" ("Tom")
  relation?: string;  // visits: "je zoon", "thuisverpleging"
};
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
7. `overview(slots)`: moments done out of total, and what is left (open and later), with the important ones apart. `isEvening(now)` is true from 18:00.

## Demo clock

`state.offset` shifts the clock for the whole app (`useNow(offset)`), so the caregiver's demo buttons move both screens through the day. Ticks use the shifted time too. "Echte tijd" sets it back to 0.

## Sync

### Local mode (no env vars)

`useDayStore` writes to `localStorage` (key `anker:v3`) and listens to the `storage` event. A tick on the wall screen appears at once in the caregiver tab in the same browser. This only syncs within one browser.

### Supabase mode

Tables (see `supabase/schema.sql`):

| Table | Columns |
| --- | --- |
| `circle` | `id`, `name` (the person with dementia), `pair_code` (6 characters, unique), `demo_offset` (ms), `created_at` |
| `member` | `circle_id`, `user_id` (auth.users), `role` (`caregiver` or `tablet`), primary key (circle_id, user_id) |
| `item` | `id`, `circle_id`, `time` (HH:MM), `title`, `kind`, `date` (text, null = every day), `photo` (storage path), `important`, `who`, `relation` (nullable text, added with `add column if not exists`), `created_at` |
| `completion` | `circle_id`, `item_id` (cascade on delete), `date_key`, `done_at` (ms), primary key (item_id, date_key) |

Rules:

- Row Level Security is on for every table. `is_member(circle)` (security definer) decides: a user sees and changes only rows of circles they belong to. Nobody inserts into `circle` or `member` directly, only the RPCs do. Members can only update `circle.name` and `circle.demo_offset` (column grants).
- `create_circle(p_name)`: caregiver (not an anonymous session) makes a circle, or gets back the one they already have, gets a random pair code without look-alike characters (no 0, O, 1, I, L) and becomes `caregiver`.
- `pair_tablet(p_code)`: the tablet signs in anonymously (enable "Allow anonymous sign-ins" in the dashboard), calls this and becomes `tablet`. A wrong code returns null and is counted in `pair_attempt`; after 10 wrong codes in 15 minutes it raises `too_many`. The UI answers friendly, never blaming. A caregiver account on the device is signed out first, so it never becomes a tablet member. Supabase keeps the session in the browser, so the tablet stays paired.
- Photos live in the private bucket `photos` under `<circle_id>/<item_id>.jpg`. Policies use the first folder as the circle id (`is_member_folder`, compared as text). `item.photo` stores the path. On load the client asks for signed URLs (1 hour, cached and renewed by the 30 second reload).
- `item`, `completion` and `circle` are in the `supabase_realtime` publication.

Client flow (`useDayStore(circleId)`):

1. Load: `fetchState` reads the circle, its items and the last 8 days of completions, and builds the normal `State` (`buildState`). `day.ts` is unchanged.
2. Live: `subscribe` listens to changes of the three tables (filtered by circle; DELETE events cannot be filtered, so they come unfiltered) and reloads after a short delay. A reload also runs every 30 seconds and when the tab becomes visible, in case Realtime drops.
3. Write: an action runs through the reducer first (optimistic), then `write` mirrors it: `toggle` inserts or deletes a completion, `add` uploads the photo and inserts the item, `remove` deletes the item (and, best effort, its photo object in the bucket; a failure there is ignored), `setName` and `setOffset` update the circle, `loadDemo` replaces the items with the demo items (new UUIDs), `reset` deletes the items, completions and photos (the circle and its name stay). Writes go out in order. While a write is in flight a reload is postponed, so an optimistic change is not overwritten.
4. A failed write sets `saveError` (banner) and triggers a reload so the screen shows what the database has.
5. `invite` (care circle list) is still mocked and local only.

Screens (`components/Gate.tsx`, chosen in `components/Pages.tsx`): `/plan` shows the login when signed out (or when the session is a tablet), "Voor wie zorg je?" when there is no circle yet, and the koppelcode plus "Afmelden" under Instellingen. `/vandaag` shows the pairing screen until the device is a member. The wall screen asks for a name only when `circle.name` is empty.

## Rules for changes

- Keep `day.ts` pure. Time is always passed in (`now`), never read inside.
- Every state change goes through `reducer`. In Supabase mode it also needs a case in `toWrite` (`store.ts`) and `write` (`remote.ts`). Bump the storage key (`anker:v3`) when the shape of `State` changes.
- Storage errors must not crash the app: `useDayStore` returns `saveError` and the caregiver view shows a banner.
- Photos are resized to at most 240px JPEG before they are stored (local mode: as data URL in `localStorage`; Supabase mode: uploaded to the `photos` bucket).
- Keep `remote.ts` mappers pure and tested. Never put the `service_role` key in the app, and never commit `.env.local`.
