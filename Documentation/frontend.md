# Frontend

Stack: Next.js (App Router) + React 19 + TypeScript (strict). No UI library. Every page is its own path route under `src/app/`.

## Views

| URL | View | Device | User |
| --- | --- | --- | --- |
| `/` | `Home` (hero only) | any | visitors, jury |
| `/vandaag` | `WallScreen` | tablet on the wall | person with dementia |
| `/plan` | `CaregiverView` | phone | caregiver |
| `/privacy`, `/voorwaarden` | `Privacy`, `Terms` | any | visitors |

`SiteHeader` shows on every page except the wall screen. `SiteFooter` shows on `/`, `/privacy` and `/voorwaarden`, not on the wall screen or the caregiver view.

## Structure

```
Project/frontend/src/
├── app/                    routes (server components that set the page title and render a client view)
│   ├── layout.tsx          html lang="nl", Lexend font, styles.css, DayProvider, header and footer
│   ├── page.tsx            /
│   ├── vandaag/page.tsx    /vandaag
│   ├── plan/page.tsx       /plan
│   ├── privacy/page.tsx    /privacy
│   └── voorwaarden/page.tsx /voorwaarden
├── components/
│   ├── DayProvider.tsx     client: loads the state and the clock after mount, sets data-dagdeel / data-view on <html>
│   ├── Pages.tsx           HomePage, WallPage, PlanPage: neutral loading state, then the view
│   ├── SiteChrome.tsx      header (not on /vandaag) and footer (not on /vandaag or /plan)
│   ├── Home.tsx            landing page: hero with live mini wall screen and buttons to both views
│   ├── WallScreen.tsx      name on first start, moment, weather + tip, "Nu doen", pills, past / later, "Wie is dit?", text size, add, undo
│   ├── CaregiverView.tsx   alerts, "Vandaag bij ..." overview card (full from 18:00), stats, day list, add form, care circle, settings, demo clock
│   ├── AddItem.tsx         form to add a moment (+ photo resize, "important" flag, name and relation for visits)
│   ├── Modal.tsx           native <dialog> wrapper
│   ├── ConfirmDialog.tsx   yes/no on top of Modal, safe choice first and focused
│   ├── KindIcon.tsx        line icon per kind, or the visitor's photo / initial
│   ├── Legal.tsx           privacy policy and terms
│   ├── SiteHeader.tsx      logo + menu
│   └── SiteFooter.tsx      footer on home and legal pages
├── lib/                    logic and state (see backend.md), no JSX
└── styles.css              all styling; tokens per dagdeel at the top
public/favicon.svg          anchor icon
```

Anything that uses state, effects, `localStorage`, the clock or `window` is a client component (`'use client'`). The saved state and the clock are read after mount; until then the pages render a neutral empty screen, so server and browser agree and the wall screen never flashes wrong content.

## Wall screen details

- **Wie is dit?** A visitor (`bezoek`) in "Straks", "Nog te komen" or "Al gebeurd" is a button around its photo or initial. It opens a calm modal with the big photo, `who` (falls back to the title) and `relation`.
- **Weather tip:** `weatherTip(weather, dagdeel)` in `lib/weather.ts` (pure, tested). Only in ochtend and middag. Rain first, then cold (< 8 C), then hot (> 25 C), else nothing.
- **Text size:** "Tekst: Normaal / Groter / Grootst" next to "Naam aanpassen". Stored per device in `localStorage` key `anker:fontscale` (`lib/fontscale.ts`), never synced, not in `State`. It sets `data-fontscale` on `.wall`, which sets `--fs` (body text, buttons: 1 / 1.25 / 1.5) and `--fs-t` (titles, half the rate). The moment sentence and the clock are not scaled. Check 375 and 768 wide at "Grootst".
- **Slow first load (Supabase):** `WallPage` shows a calm "Even geduld, Anker zoekt verbinding." after 5 seconds of loading. The access check (10 s) and the store (30 s poll) keep retrying.

## Caregiver details

- **Overview card** "Vandaag bij <name>": `overview(slots)` and `isEvening(now)` from `day.ts`. "5 van 6 momenten gedaan", plus what is still open (open and later), important ones flagged. From 18:00 (avond, nacht) it is large with a list, earlier it is a small summary.
- "Alles wissen" says "van dit toestel" in local mode; with Supabase it says the plan is cleared for everyone.

## Languages (i18n)

Dutch (default), French and English. No library: `lib/i18n.ts` holds the typed dictionaries `nl`, `fr`, `en` and `translate(lang, key, vars)`. `components/LangProvider.tsx` holds the language and gives `useLang()` → `{ lang, setLang, t, tr }` (`tr` takes elements as placeholder values, e.g. a `<strong>` around a time). The choice is stored per device in `localStorage` (`anker:lang`), never synced and not in `State`. It is read after mount (Dutch until then, no hydration mismatch) and sets `<html lang>`. `LangSwitch` sits in `SiteHeader` ("NL · FR · EN", `aria-current` on the active one) and at the bottom of the wall screen and the pairing screen (full names, 56px targets).

- **Every new text goes into all three dictionaries.** TypeScript errors when `fr` or `en` misses a key of `nl`, and `i18n.test.ts` checks the same keys, no empty text and the same `{placeholders}`.
- No visible text, `aria-label`, `alt` or error message in a component or in `lib` as a string literal: use `t('key')`.
- Dates and times go through Intl with the locale of the language (`nl-BE`, `fr-BE`, `en-GB`): pass `lang` to `momentWord`, `momentSentence`, `formatClock`, `formatDate`, `weatherTip`. `day.ts` stays pure: the language is an argument.
- French: "tu" on the wall screen, "vous" on the caregiver view, the marketing and legal pages. Never blaming: no "late" or "en retard" on the wall screen.
- User data (item titles, names) is not translated. The demo day (`loadDemo` carries `lang`) is stored with titles in the language it was loaded in.
- Page titles (`metadata` in `app/*/page.tsx`) and the meta description stay Dutch: they are set on the server and a client-side `document.title` update would fight Next's own title handling.

## Rules

- Components never touch `localStorage` or compute statuses. They get data from `today()` and call callbacks. Logic lives in `src/lib`.
- **Wall screen = zero learning curve.** One action at a time, one button. No menus, no scrolling needed for the main action, no small text (minimum 20px), no icons without words.
- The wall screen never says "te laat" or "vergeten". It says "Nog niet genomen". Warnings are for the caregiver only.
- The wall screen has no footer, no links in view except a small "Voor de mantelzorger" at the bottom. The site footer is only on `/`, `/privacy` and `/voorwaarden`.
- Words never break mid-word: when space runs out, buttons wrap to the next line (`overflow-wrap: break-word`, no `min-width: 0` on text that must stay whole).
- Every list has an empty state. Every form has a visible error message (`role="alert"`).
- Accessibility: real `<button>`/`<label>`, visible focus ring, `aria-label` on icon buttons, touch targets at least 44px (96px for "Gedaan"), `prefers-reduced-motion` respected.
- Responsive breakpoints: wall screen `≤600px` (phone, one column, full-width button), `≥820px` (two lists side by side), `≥1600px` (wider). Caregiver `≥1024px` (two columns). Check 375, 768, 1280, 1366 and 1920 wide before shipping.
- Undoing a tick on the wall screen always goes through `ConfirmDialog` and shows the time it was ticked.
- Copy is Dutch, short and kind.
- No new dependency without a reason that the standard library or React cannot cover.

## Commands

```bash
npm install
npm run dev      # http://localhost:3000 (home), /vandaag (wall screen), /plan (caregiver)
npm test
npm run build
npm start        # serve the build
```
