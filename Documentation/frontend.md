# Frontend

Stack: Vite + React 19 + TypeScript (strict). No UI library, no router: two views switched by the URL hash.

## Views

| URL | View | Device | User |
| --- | --- | --- | --- |
| `/` | `WallScreen` | tablet on the wall, landscape | person with dementia |
| `/#/zorg` | `CaregiverView` | phone | caregiver |

## Structure

```
Project/frontend/src/
├── App.tsx                 picks the view, sets data-dagdeel / data-view on <html>
├── components/
│   ├── WallScreen.tsx      moment sentence, clock, "Nu doen", pills, past / later
│   ├── CaregiverView.tsx   alerts, stats, day list, add form, settings
│   ├── AddItem.tsx         form to add a moment (+ photo resize, "important" flag)
│   ├── KindIcon.tsx        line icon per kind, or the visitor's photo / initial
│   └── SiteFooter.tsx      footer, caregiver view only
public/favicon.svg          anchor icon
├── lib/                    logic and state (see backend.md), no JSX
└── styles.css              all styling; tokens per dagdeel at the top
```

## Rules

- Components never touch `localStorage` or compute statuses. They get data from `today()` and call callbacks. Logic lives in `src/lib`.
- **Wall screen = zero learning curve.** One action at a time, one button. No menus, no scrolling needed for the main action, no small text (minimum 20px), no icons without words.
- The wall screen never says "te laat" or "vergeten". It says "Nog niet genomen". Warnings are for the caregiver only.
- The wall screen has no footer, no links in view except a small "Voor de mantelzorger" at the bottom. The site footer lives on the caregiver view.
- Words never break mid-word: when space runs out, buttons wrap to the next line (`overflow-wrap: break-word`, no `min-width: 0` on text that must stay whole).
- Every list has an empty state. Every form has a visible error message (`role="alert"`).
- Accessibility: real `<button>`/`<label>`, visible focus ring, `aria-label` on icon buttons, touch targets at least 44px (96px for "Gedaan"), `prefers-reduced-motion` respected.
- Copy is Dutch, short and kind.
- No new dependency without a reason that the standard library or React cannot cover.

## Commands

```bash
npm install
npm run dev      # http://localhost:5173 and http://localhost:5173/#/zorg
npm test
npm run build
```
