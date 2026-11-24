# Anker

Houvast voor wie de tijd kwijt is.

Gemaakt voor: Hack The Future 2026 · Little Miss Robot challenge "Claim de tijd terug!" · Team Titans

## Waarom wij dit bouwen

Ik ken mensen in mijn familie en vriendenkring die problemen hebben met hun geheugen. Ze vergeten vaak wat ze al gedaan hebben en wat ze nog moeten doen. Heb ik mijn medicijnen genomen? Heb ik de voordeur op slot gedaan? Heb ik die taak al gedaan, of moet het nog? Die kleine twijfels maken een hele dag onrustig, voor hen en voor de mensen die voor hen zorgen. Anker is gebouwd voor hen.

## Probleem

Bij dementie is de Desync geen verhaal maar dagelijkse realiteit: verleden, heden en toekomst lopen door elkaar.

- **Heden:** welke dag is het? Is het ochtend of avond?
- **Verleden:** heb ik gegeten, mijn pillen genomen, de deur op slot gedaan? Is er al iemand geweest?
- **Toekomst:** komt er vandaag iemand? Een vergeten afspraak of een onverwachte bel zorgt voor onrust.
- **De mantelzorger** beantwoordt dezelfde vragen tientallen keren per dag, belt om te controleren en weet niet zeker of het goed gaat.

Ruim 200.000 mensen in België leven met dementie, en tegen 2040 worden dat er meer dan 300.000 (Expertisecentrum Dementie Vlaanderen, 2025). In Vlaanderen woont ongeveer 70% van hen thuis (Vlaamse overheid, Dementieplan Vlaanderen). Thuis is de nood het grootst en de hulp het kleinst.

## Eindgebruikers

| | Persoon met dementie | Mantelzorger |
| --- | --- | --- |
| Wie | 70+, thuiswonend, beginnende tot matige dementie | meestal een werkende dochter of zoon, soms de partner |
| Toestel | tablet aan de muur, altijd aan | eigen smartphone |
| Kan | lezen, een grote knop aantikken | plannen, opvolgen |
| Nood | houvast, rust, herkenning | overzicht, geruststelling, minder telefoontjes |

## Concept

Anker is een webapp met twee kanten. De mantelzorger plant de dag op de gsm. De persoon met dementie ziet die dag rustig op een tablet. Wat op de tablet wordt afgevinkt, ziet de mantelzorger meteen. Anker zet verleden, heden en toekomst terug op hun plek: **Al gebeurd**, **Nu** en **Straks**.

### De website

| Pagina | URL | Inhoud |
| --- | --- | --- |
| Home | `/` | Wat Anker is, "Waarom wij dit bouwen", het probleem met cijfers, hoe het werkt, voor wie, knoppen naar beide schermen. Bovenaan een live mini-versie van het wandscherm |
| Privacybeleid | `/#/privacy` | Welke gegevens, waar ze staan (alleen op je toestel), cookies (geen), diensten van derden, je rechten |
| Gebruiksvoorwaarden | `/#/voorwaarden` | Prototype, geen medisch hulpmiddel, geen garanties, aansprakelijkheid, Belgisch recht |
| Wandscherm | `/#/scherm` | Het scherm voor de persoon met dementie (tablet aan de muur) |
| Mantelzorger | `/#/zorg` | De plan-app voor de mantelzorger (gsm) |

Elke pagina heeft onderaan dezelfde footer: logo, korte omschrijving, Pagina's, Juridisch en Project. Er staan geen contactgegevens, adres, ondernemingsnummer of sociale media in. Home en Mantelzorger hebben bovenaan een menubalk. Het wandscherm niet, want dat moet rustig blijven.

### Wandscherm (`/#/scherm`)

- **Leeg starten, geen voorbeelddata:** het scherm vraagt groot "Welkom bij Anker. Hoe heet je?" en bewaart de naam. Daarna begroet het de persoon bij naam ("Goedemorgen, …"). De naam is later aan te passen via "Naam aanpassen" onderaan het scherm, of door de mantelzorger.
- **Plan je dag:** meteen na de naam opent een popup. Je kiest een **datum** en vult de taken voor die dag in (wat, hoe laat, soort), met "+ Nog een taak" voor meer. De popup toont wat al op die dag gepland staat. Later opnieuw openen kan met "+ Dag plannen".
- Een grote zin "Het is dinsdagmiddag." met de datum, een klok en het weer met een icoon (Open-Meteo, zonder sleutel; offline toont het scherm gewoon geen weer).
- De achtergrond kleurt mee met het dagdeel: ochtend blauw, middag geel, avond roze, nacht donkerblauw. 's Nachts staat er "Het is nacht. Slaap zacht."
- Eén taak tegelijk met één grote knop in eigen woorden: "Ik heb ze genomen", "Ik heb gegeten", "Gedaan".
- "Je pillen van vandaag": een vinkje met het uur ("Genomen om 08:35").
- "Al gebeurd vandaag" met het uur waarop iets gedaan is ("Gedaan om 08:02"), en "Nog te komen", met een foto of de initiaal van wie er op bezoek komt.
- **Vergist?** Bij elke afgevinkte taak staat "Toch niet". Een tik vraagt eerst: "Je tikte om 08:02 dat “Ochtendpillen” gedaan was. Is het toch nog niet gedaan?" De veilige keuze ("Nee, het is gedaan") heeft de focus, en Escape of naast het venster tikken verandert niets.
- Nooit verwijtend: het scherm zegt "Nog niet genomen", nooit "te laat".

## Stack

| Laag | Prototype (vandaag) | Volgende stap |
| --- | --- | --- |
| Frontend | React 19 + TypeScript + Vite | PWA in kioskmodus op de tablet |
| Data en sync | `localStorage` + `storage`-event, live tussen tabbladen | Supabase Postgres + Realtime tussen tablet en gsm |
| Logica | pure functie `today(state, now)`, getest met Vitest | herhaling en tijdzones server-side |
| Auth | geen (demo) | Supabase Auth voor de mantelzorger, tablet koppelen via code |
| Privacy | data blijft op het toestel | GDPR: Row Level Security per zorgkring |
| Hosting | statische build op Vercel (HTTPS) | idem |

## Starten

```bash
cd Project/frontend
npm install
npm run dev      # home: http://localhost:5173  ·  wandscherm: /#/scherm  ·  mantelzorger: /#/zorg
npm test
npm run build
```

De app start leeg. Een voorbeelddag laad je alleen als je dat zelf kiest (plan-app, Demo, "Voorbeelddag laden"). "Alles wissen" onder Instellingen zet alles terug naar leeg.

## Deploy (Vercel)

Importeer de repo in Vercel met deze instellingen:

- Root Directory: `Project/frontend`
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

## Technische vereisten

| Vereiste | Hoe |
| --- | --- |
| Hosting | statische build op Vercel, HTTPS-link |
| Werkende kernflow | moment plannen, op het wandscherm afvinken, status zien bij de mantelzorger |
| Responsive | getest op gsm (375px), tablet staand (768px), tablet liggend en laptop (1280-1366px) en pc (1920px). Wandscherm: één kolom op gsm met een knop over de volle breedte, twee kolommen vanaf 820px, breder vanaf 1600px. Plan-app: één kolom op gsm en tablet, twee kolommen (planning links, toevoegen en instellingen rechts) vanaf 1024px |
| Toegankelijk | lettertype Lexend, tekst van minstens 20px op het wandscherm, knop van 96px, hoog contrast per dagdeel, focusring, labels, reduced motion |
| State en opslag | `localStorage` (`anker:v3`): naam, planning, vinkjes en zorgkring overleven een refresh; geschiedenis van 7 dagen |
| UI-states | "Alles is gedaan", "Slaap zacht", lege planning, formulierfouten, foutieve foto, banner als opslaan faalt, waarschuwing bij belangrijke open momenten |
| Codekwaliteit | UI in `components/`, logica in `lib/`, pure `today()` met tests |

## Projectstructuur

```
Documentation/    frontend-, logica- en designafspraken + Anker-pitch.pptx
Project/frontend/ de webapp
```

## Presentatie
[Documentation/Anker-pitch.pptx](Documentation/Anker-pitch.pptx)

## Auteurs

- Sergiu Neagu
- Laurens Rombout
