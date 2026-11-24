# Frontend

Stack: Vite + React 19 + TypeScript (strict). No UI library, no router: three views switched by the URL hash (`useRoute` in `lib/store.ts`).

## Views

| URL | View | Device | User |
| --- | --- | --- | --- |
| `/` (and `#/waarom`, `#/hoe` …) | `Home` | any | visitors, jury |
| `/#/scherm` | `WallScreen` | tablet on the wall | person with dementia |
| `/#/zorg` | `CaregiverView` | phone | caregiver |

`SiteHeader` shows on Home and Caregiver, not on the wall screen. `SiteFooter` shows on every view.

## Structure

```
Project/frontend/src/
├── App.tsx                 picks the view, sets data-dagdeel / data-view on <html>
├── components/
│   ├── Home.tsx            landing page with live mini wall screen
│   ├── WallScreen.tsx      name on first start, moment, weather, "Nu doen", pills, past / later, add, undo
│   ├── CaregiverView.tsx   alerts, stats, day list, add form, care circle, settings, demo clock
│   ├── AddItem.tsx         form to add a moment (+ photo resize, "important" flag)
│   ├── Modal.tsx           native <dialog> wrapper
│   ├── ConfirmDialog.tsx   yes/no on top of Modal, safe choice first and focused
│   ├── KindIcon.tsx        line icon per kind, or the visitor's photo / initial
│   ├── SiteHeader.tsx      logo + menu
│   └── SiteFooter.tsx      footer on every page
├── lib/                    logic and state (see backend.md), no JSX
└── styles.css              all styling; tokens per dagdeel at the top
public/favicon.svg          anchor icon
```

## Rules

- Components never touch `localStorage` or compute statuses. They get data from `today()` and call callbacks. Logic lives in `src/lib`.
- **Wall screen = zero learning curve.** One action at a time, one button. No menus, no scrolling needed for the main action, no small text (minimum 20px), no icons without words.
- The wall screen never says "te laat" or "vergeten". It says "Nog niet genomen". Warnings are for the caregiver only.
- The wall screen has no footer, no links in view except a small "Voor de mantelzorger" at the bottom. The site footer lives on the caregiver view.
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
npm run dev      # http://localhost:5173 (home), /#/scherm (wall screen), /#/zorg (caregiver)
npm test
npm run build
```
