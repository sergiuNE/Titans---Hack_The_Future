// Privacy policy and terms of use for the hackathon prototype.
// Written for what the app really does today: everything stays in the browser.

const UPDATED = '24 november 2026';

export function Privacy() {
  return (
    <main className="legal">
      <p className="legal-meta">Laatst bijgewerkt op {UPDATED}</p>
      <h1>Privacybeleid</h1>
      <p className="legal-lead">
        Anker gaat over gezondheid en dagelijkse zorg. Daarom houden we het simpel: wat je in Anker invult, blijft op je
        eigen toestel. Wij ontvangen het niet.
      </p>

      <h2>Wie zijn wij</h2>
      <p>
        Anker is een prototype van Team Titans (Laurens Rombout en Sergiu Neagu), gemaakt voor Hack The Future 2026. Het is
        geen commerciële dienst.
      </p>

      <h2>Welke gegevens Anker gebruikt</h2>
      <ul>
        <li>De naam die je ingeeft, voor de begroeting op het wandscherm.</li>
        <li>De planning: taken, medicijnen, maaltijden, afspraken en bezoeken, met datum en uur.</li>
        <li>Wanneer iets is afgevinkt.</li>
        <li>Foto's die je bij een bezoek toevoegt (verkleind tot een klein beeld).</li>
        <li>De namen in de zorgkring.</li>
      </ul>
      <p>
        Een planning met medicijnen kan iets zeggen over iemands gezondheid. Volgens de AVG (GDPR) zijn dat bijzondere
        persoonsgegevens. Juist daarom stuurt dit prototype ze nergens naartoe.
      </p>

      <h2>Waar je gegevens staan</h2>
      <p>
        Alles staat in de lokale opslag van je browser (localStorage) op het toestel dat je gebruikt. Er is geen account,
        geen server van ons, geen statistieken en geen reclame. Afvinkingen ouder dan 7 dagen worden automatisch gewist.
      </p>

      <h2 id="cookies">Cookies</h2>
      <p>Anker plaatst geen cookies. De lokale opslag van je browser is enkel nodig om je planning te bewaren.</p>

      <h2>Diensten van derden</h2>
      <p>Om de website te tonen, maakt je browser verbinding met deze diensten. Ze krijgen daarbij je IP-adres te zien, maar geen planning of naam:</p>
      <ul>
        <li>
          <strong>Open-Meteo</strong>, voor het weer op het wandscherm. De vraag bevat alleen een vaste locatie (Mortsel), niet
          jouw locatie.
        </li>
        <li>
          <strong>Google Fonts</strong>, voor het lettertype Lexend.
        </li>
        <li>
          <strong>De hostingpartij</strong> van de website, die zoals elke webserver technische logs bijhoudt.
        </li>
      </ul>

      <h2>Je rechten</h2>
      <p>
        Je hebt zelf alle controle. Je kunt je gegevens op elk moment wissen via Mantelzorger, Instellingen, “Alles wissen”,
        of door de websitegegevens in je browser te verwijderen. Omdat wij niets ontvangen, kunnen wij je gegevens ook niet
        inkijken, doorgeven of herstellen.
      </p>

      <h2>Als Anker later groeit</h2>
      <p>
        Synchronisatie tussen tablet en gsm vraagt een server. Voor we die toevoegen, passen we dit beleid aan en vragen we
        eerst je toestemming. Gegevens worden dan in de EU bewaard en enkel de eigen zorgkring kan ze zien.
      </p>
    </main>
  );
}

export function Terms() {
  return (
    <main className="legal">
      <p className="legal-meta">Laatst bijgewerkt op {UPDATED}</p>
      <h1>Gebruiksvoorwaarden</h1>
      <p className="legal-lead">Anker is een prototype. Gebruik het als steun, niet als vervanging van zorg.</p>

      <h2>Een prototype, geen medisch hulpmiddel</h2>
      <p>
        Anker is gemaakt tijdens Hack The Future 2026 om een idee te tonen. Het is geen medisch hulpmiddel en vervangt geen
        arts, apotheker, thuisverpleging of mantelzorger. Gebruik Anker niet als enige herinnering voor medicatie.
      </p>

      <h2>Geen garanties</h2>
      <p>
        We doen ons best om Anker correct te laten werken, maar we geven geen garantie dat het altijd beschikbaar, juist of
        foutloos is. Het weer komt van een externe dienst en kan afwijken. De demoknop “spring in de tijd” verandert de klok
        op het scherm; zet daarna altijd de echte tijd terug.
      </p>

      <h2>Je eigen gegevens</h2>
      <p>
        Wat je invult, blijft van jou en staat enkel op je eigen toestel (zie het privacybeleid). Voeg alleen foto's of
        namen van anderen toe als zij daarmee akkoord gaan.
      </p>

      <h2>Aansprakelijkheid</h2>
      <p>
        Je gebruikt Anker op eigen verantwoordelijkheid. Team Titans is niet aansprakelijk voor schade door het gebruik van
        dit prototype, voor zover de wet dat toelaat.
      </p>

      <h2>Rechten op Anker</h2>
      <p>Het ontwerp, de teksten en de code van Anker zijn van Team Titans.</p>

      <h2>Toepasselijk recht</h2>
      <p>Op deze voorwaarden is het Belgisch recht van toepassing.</p>
    </main>
  );
}
