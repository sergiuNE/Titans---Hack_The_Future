# Anker

Houvast voor wie de tijd kwijt is.

Hack The Future 2026 · Little Miss Robot challenge "Claim de tijd terug!" · Team Titans: Laurens Rombout en Sergiu Neagu

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
| Persona | **Maria, 78**: beginnende Alzheimer, woont alleen in Mortsel | **Els, 52**: dochter van Maria, werkt voltijds in Antwerpen |
| Toestel | tablet aan de muur, altijd aan | eigen smartphone |
| Kan | lezen, een grote knop aantikken | plannen, opvolgen |
| Nood | houvast, rust, herkenning | overzicht, geruststelling, minder telefoontjes |

## Concept

Anker is een webapp met twee kanten. Els plant de dag op haar gsm. Maria ziet die dag rustig op haar tablet. Wat Maria afvinkt, ziet Els meteen. Anker zet verleden, heden en toekomst terug op hun plek: **Al gebeurd**, **Nu** en **Straks**.

### De website

| Pagina | URL | Inhoud |
| --- | --- | --- |
| Home | `/` | Wat Anker is, "Waarom wij dit bouwen", het probleem met cijfers, hoe het werkt, Maria en Els, knoppen naar beide schermen. Bovenaan een live mini-versie van het wandscherm |
| Privacybeleid | `/#/privacy` | Welke gegevens, waar ze staan (alleen op je toestel), cookies (geen), diensten van derden, je rechten |
| Gebruiksvoorwaarden | `/#/voorwaarden` | Prototype, geen medisch hulpmiddel, geen garanties, aansprakelijkheid, Belgisch recht |
| Wandscherm | `/#/scherm` | Het scherm van Maria (tablet aan de muur) |
| Mantelzorger | `/#/zorg` | De plan-app van Els (gsm) |

Elke pagina heeft onderaan dezelfde footer: logo, korte omschrijving, Pagina's, Voor wie en Project. Er staan geen contactgegevens, adres, ondernemingsnummer of sociale media in. Home en Mantelzorger hebben bovenaan een menubalk. Het wandscherm niet, want dat moet rustig blijven.

### Wandscherm van Maria (`/#/scherm`)

- **Leeg starten, geen voorbeelddata:** het scherm vraagt groot "Welkom bij Anker. Hoe heet je?" en bewaart de naam. Daarna begroet het: "Goedemorgen, Maria." De naam is later aan te passen via "Naam aanpassen" onderaan het scherm, of door de mantelzorger.
- **Plan je dag:** meteen na de naam opent een popup. Je kiest een **datum** en vult de taken voor die dag in (wat, hoe laat, soort), met "+ Nog een taak" voor meer. De popup toont wat al op die dag gepland staat. Later opnieuw openen kan met "+ Dag plannen".
- Een grote zin "Het is dinsdagmiddag." met de datum, een klok en het weer met een icoon (Open-Meteo, zonder sleutel; offline toont het scherm gewoon geen weer).
- De achtergrond kleurt mee met het dagdeel: ochtend blauw, middag geel, avond roze, nacht donkerblauw. 's Nachts staat er "Het is nacht. Slaap zacht."
- Eén taak tegelijk met één grote knop in eigen woorden: "Ik heb ze genomen", "Ik heb gegeten", "Gedaan".
- "Je pillen van vandaag": een vinkje met het uur ("Genomen om 08:35").
- "Al gebeurd vandaag" met het uur waarop iets gedaan is ("Gedaan om 08:02"), en "Nog te komen", met een foto of de initiaal van wie er op bezoek komt.
- **Vergist?** Bij elke afgevinkte taak staat "Toch niet". Een tik vraagt eerst: "Je tikte om 08:02 dat “Ochtendpillen” gedaan was. Is het toch nog niet gedaan?" De veilige keuze ("Nee, het is gedaan") heeft de focus, en Escape of naast het venster tikken verandert niets.
- Nooit verwijtend: Maria ziet "Nog niet genomen", nooit "te laat".

### Plan-app van Els (`/#/zorg`)

- Ziet wat Maria nu ziet en hoeveel pillen er genomen zijn.
- Krijgt een signaal als een **belangrijk** moment (pillen, voordeur op slot) een uur na tijd nog openstaat.
- Voegt zoveel extra momenten toe als nodig: medicijn, maaltijd, bezoek (met foto), afspraak (bv. kapper) of taak, eenmalig of elke dag.
- Kan zelf afvinken of een vinkje ongedaan maken.
- Past de naam van haar naaste aan (Instellingen). De naam wordt meteen bewaard en staat in de begroeting op het wandscherm.
- **Zorgkring:** nodigt familie uit (bv. Tom), zodat iedereen hetzelfde overzicht heeft. In de demo is dit gemockt: er wordt nog niets verstuurd.
- **Demo: spring in de tijd** (08:35, 15:00, 20:00, 23:30, +1 uur), zodat de hele dag in een paar minuten te tonen is. Het wandscherm springt mee.

## Demoscript

1. Open `/#/scherm` en `/#/zorg` naast elkaar in dezelfde browser.
2. Tablet: het scherm vraagt "Hoe heet je?". Typ "Maria". Het scherm zegt: "Goedemorgen, Maria. Het is dinsdagochtend."
3. De popup "Plan je dag" opent: kies de datum, vul "Pillen nemen" (medicijn) en "Tom komt koffie drinken" (bezoek) in en bewaar.
4. Gsm: Els ziet de taken meteen en voegt de kapper toe. Wil je een volle dag tonen? Klik in de plan-app op "Voorbeelddag laden".
5. Spring naar 20:00: "Avondpillen" met een grote knop. Tik op de tablet. De gsm toont het vinkje met het uur.
6. Tik "Toch niet": Anker vraagt eerst of het klopt.
7. Spring naar 23:30: het scherm wordt donker. "Slaap zacht."
8. Zet daarna "Echte tijd" terug.

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

De app start leeg. Een voorbeelddag voor Maria laad je alleen als je dat zelf kiest (plan-app, Demo, "Voorbeelddag laden"). "Alles wissen" onder Instellingen zet alles terug naar leeg.

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
| State en opslag | `localStorage` (`anker:v2`): naam, planning, vinkjes en zorgkring overleven een refresh; geschiedenis van 7 dagen |
| UI-states | "Alles is gedaan", "Slaap zacht", lege planning, formulierfouten, foutieve foto, banner als opslaan faalt, waarschuwing bij belangrijke open momenten |
| Codekwaliteit | UI in `components/`, logica in `lib/`, pure `today()` met tests |

## Projectstructuur

```
.claude/          Claude Code-regels voor dit project
Documentation/    frontend-, logica- en designafspraken + Anker-pitch.pptx
Project/frontend/ de webapp
```

## Next steps

- Echte sync tussen tablet en gsm via Supabase Realtime, met login voor de mantelzorger.
- Pushmelding naar de mantelzorger als belangrijke momenten openblijven.
- Spraak: het scherm leest voor ("Straks komt Lisa") en Maria kan vragen "Welke dag is het?".
- Herinneringsalbum: "Vandaag 50 jaar geleden trouwde je met Jos."
- Zorgkring: familie en thuisverpleging delen één overzicht.
- AI-invoer: de mantelzorger typt "morgen 10u kapper" en Anker plant het in (Claude API).
- Testen met echte mantelzorgers.

## Presentatie

[Documentation/Anker-pitch.pptx](Documentation/Anker-pitch.pptx): 14 slides met sprekersnotities, fade-overgangen en animaties die vanzelf starten (elementen verschijnen na elkaar). Elk deel heeft de kleur van een dagdeel uit de app, en alle screenshots zitten in een tablet-, gsm- of laptopframe.

| Deel | Slides |
| --- | --- |
| Titel | Anker, met Laurens Rombout en Sergiu Neagu |
| Probleem | Waarom dit persoonlijk is · De Desync bij dementie, met cijfers · Maria en Els |
| Oplossing | Concept · Leeg starten (naam, Plan je dag) · Wandscherm · Het licht vertelt de tijd · Plan-app · Website · Techniek |
| Scopebepaling | Impact-moeitematrix, met talen (NL, EN, FR) en donkere/lichte modus |
| Demo | Demoscript in 6 stappen |
| Einde | Slotzin en vragen |
