# Design

Tone: calm, warm, certain. The wall screen is a friendly neighbour who tells you what time it is, never an alarm.

## Principles

1. **The light tells the time.** The whole wall screen takes the colour of the part of the day. Someone who can no longer read a clock still sees "it is evening".
2. **Say it in words.** "Het is dinsdagmiddag." comes before the digits. Words orient better than numbers.
3. **One thing at a time.** One "Nu doen", one button. The rest is for looking, not for tapping.
4. **The past is proof.** A filled circle with "Genomen om 08:41" answers "did I take my pills?" without anyone having to answer.
5. **No blame on the wall.** The patient sees "Nog niet genomen". Only the caregiver sees "Te laat".

## Wall screen tokens (per `data-dagdeel`)

| Dagdeel | Hours | `--sky` (background) | `--ink` (text) | `--mark` (button, done) |
| --- | --- | --- | --- | --- |
| ochtend | 06–12 | `#d6e7f2` | `#0f2c44` | `#1c6aa3` |
| middag | 12–18 | `#f5dd96` | `#2b1f04` | `#2b1f04` |
| avond | 18–23 | `#e8c3b4` | `#3a161d` | `#8e2f43` |
| nacht | 23–06 | `#13213b` | `#f2ecda` | `#f2c66d` |

Also per dagdeel: `--soft` (secondary text) and `--panel` (the "Nu doen" block). The background fades over 3 seconds when the dagdeel changes.

## Caregiver tokens

Neutral and calm, independent of the dagdeel: background `#eef1f4`, white cards, ink `#16202b`, action blue `#1c6aa3`, warning `#a8261c` on `#fbe4e1`.

## Type

Lexend (400/500/700/800), designed for reading ease. It has a plain zero, which matters for a clock. Atkinson's slashed zero reads like "Ø".

| Role | Size |
| --- | --- |
| Moment sentence | 44–92px, 700 |
| Clock | 56–128px, 400, tabular |
| "Nu doen" title | 36–64px, 800 |
| Wall body text | 20–30px |
| Caregiver body | 17px |

## Footer and favicon

The home and legal pages end with a dark footer (`#17191e`): an outlined square logo with "Anker", a short description, and three columns (Pagina's, Juridisch, Project). No contact details or social links.

Favicon: a gold anchor (`#f5dd96`) on the morning ink colour (`#0f2c44`), `public/favicon.svg`.

## Presentation

`Documentation/Anker-pitch.pptx` uses the same four dagdeel palettes as layouts (OCHTEND, MIDDAG, AVOND, NACHT), Calibri, and real screenshots of the app.

## Shape and motion

"Nu doen" panel radius 28px. Buttons are pills. Lists use dividers, not cards.

Motion: the background fade, and the "Gedaan" button scaling to 0.96 on press. Nothing else moves, because motion on a dementia screen distracts. All motion is off with `prefers-reduced-motion`.
