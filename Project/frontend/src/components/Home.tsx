import { today, momentWord, formatClock, type State } from '../lib/day';
import { KindIcon } from './KindIcon';

/** Public home page: why Anker exists, how it works, and the way into both screens. */
export function Home({ state, now }: { state: State; now: number }) {
  const t = today(state, now);
  const preview = t.open.at(-1) ?? t.later[0];

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-text">
          <h1>Houvast voor wie de tijd kwijt is.</h1>
          <p className="hero-lead">
            Anker is een rustig scherm aan de muur dat iemand met dementie op elk moment vertelt welke dag het is, wat al
            gebeurd is en wat nog komt. De familie plant de dag vanaf de gsm en ziet meteen wat er gedaan is.
          </p>
          <div className="hero-cta">
            <a className="btn-primary" href="#/scherm">
              Open het wandscherm
            </a>
            <a className="btn-secondary" href="#/zorg">
              Ik ben mantelzorger
            </a>
          </div>
        </div>

        <a className="hero-preview" href="#/scherm" aria-label="Live voorbeeld van het wandscherm, openen">
          <span className="pv-moment">Het is {momentWord(now)}.</span>
          <span className="pv-clock">{formatClock(now)}</span>
          {preview && (
            <span className="pv-card">
              <KindIcon item={preview} size={44} />
              <span>
                <span className="pv-label">{preview.state === 'open' ? 'Nu doen' : `Straks, om ${preview.time}`}</span>
                <span className="pv-title">{preview.title}</span>
              </span>
            </span>
          )}
          <span className="pv-meds">
            Pillen vandaag: {t.medsTaken} van {t.meds.length} genomen
          </span>
        </a>
      </section>

      <section id="waarom" className="band band-warm">
        <div className="band-inner split">
          <div>
            <h2>Waarom wij dit bouwen</h2>
            <blockquote className="story">
              <p>
                Ik ken mensen in mijn familie en vriendenkring die problemen hebben met hun geheugen. Ze vergeten vaak wat
                ze al gedaan hebben en wat ze nog moeten doen.
              </p>
              <p>
                Heb ik mijn medicijnen genomen? Heb ik het huis op slot gedaan? Heb ik die taak al gedaan, of moet het nog?
                Die kleine twijfels maken een hele dag onrustig, voor hen en voor wie voor hen zorgt.
              </p>
              <footer>Neagu Sergiu, Team Titans</footer>
            </blockquote>
          </div>
          <ul className="doubts" aria-label="Vragen die elke dag terugkomen">
            <li>
              <Icon d="M10.5 3.5a5 5 0 017 7l-7 7a5 5 0 01-7-7z M7 7l7 7" />
              Heb ik mijn pillen al genomen?
            </li>
            <li>
              <Icon d="M6 11V8a6 6 0 0112 0v3 M5 11h14v10H5z M12 15v2" />
              Heb ik de deur op slot gedaan?
            </li>
            <li>
              <Icon d="M4 4h16v16H4z M8.5 12.5l2.5 2.5 4.5-5.5" />
              Heb ik dat al gedaan, of moet het nog?
            </li>
          </ul>
        </div>
      </section>

      <section id="probleem" className="band">
        <div className="band-inner">
          <h2>Bij dementie is de Desync geen verhaal</h2>
          <p className="band-lead">In Achrona loopt de tijd door elkaar. Voor iemand met dementie is dat dagelijkse realiteit.</p>
          <div className="three">
            <article>
              <h3>Verleden</h3>
              <p>Heb ik gegeten? Mijn pillen genomen? Is er al iemand geweest? Wat al gebeurd is, verdwijnt.</p>
            </article>
            <article>
              <h3>Heden</h3>
              <p>Welke dag is het? Is het ochtend of avond? Het besef van het moment valt weg.</p>
            </article>
            <article>
              <h3>Toekomst</h3>
              <p>Komt er vandaag iemand? Een vergeten afspraak of een onverwachte bel zorgt voor onrust.</p>
            </article>
          </div>
          <dl className="stats">
            <div>
              <dt>mensen met dementie in België</dt>
              <dd>200.000+</dd>
            </div>
            <div>
              <dt>van de personen met dementie in Vlaanderen woont thuis</dt>
              <dd>70%</dd>
            </div>
            <div>
              <dt>keer per dag dezelfde vraag voor de mantelzorger</dt>
              <dd>Tientallen</dd>
            </div>
          </dl>
          <p className="source">Bronnen: Expertisecentrum Dementie Vlaanderen (2025); Vlaamse overheid, Dementieplan Vlaanderen.</p>
        </div>
      </section>

      <section id="hoe" className="band band-panel">
        <div className="band-inner">
          <h2>Hoe Anker werkt</h2>
          <p className="band-lead">Anker zet verleden, heden en toekomst terug op hun plek.</p>
          <ol className="layers">
            <li>
              <span className="layer-name">Al gebeurd</span>
              <p>Ontbijt, pillen, Tom belde. Met een vinkje en het uur: “Genomen om 08:35”. Het verleden als bewijs.</p>
            </li>
            <li>
              <span className="layer-name">Nu</span>
              <p>“Het is dinsdagmiddag.” Eén taak, één grote knop: “Ik heb ze genomen”. Vergist? “Toch niet” vraagt eerst of het klopt.</p>
            </li>
            <li>
              <span className="layer-name">Straks</span>
              <p>“Om 15u komt Lisa.” Met foto of initiaal, zodat je herkent wie er komt.</p>
            </li>
          </ol>
          <div className="dayparts" aria-label="Het scherm kleurt mee met het dagdeel">
            <span className="dp ochtend">Ochtend</span>
            <span className="dp middag">Middag</span>
            <span className="dp avond">Avond</span>
            <span className="dp nacht">Nacht: slaap zacht</span>
          </div>
        </div>
      </section>

      <section id="voor-wie" className="band">
        <div className="band-inner">
          <h2>Twee mensen, dezelfde dag, een andere tijd</h2>
          <div className="two">
            <article className="persona">
              <h3>Maria, 78</h3>
              <p className="persona-sub">Beginnende Alzheimer, woont alleen in Mortsel. Tablet aan de muur.</p>
              <p>Vraagt elke ochtend welke dag het is. Vergeet of ze gegeten heeft. Wordt onrustig als er onverwacht iemand aanbelt.</p>
              <p className="persona-quote">Tijd is een mist zonder houvast.</p>
              <a className="btn-secondary" href="#/scherm">
                Bekijk het scherm van Maria
              </a>
            </article>
            <article className="persona">
              <h3>Els, 52</h3>
              <p className="persona-sub">Dochter van Maria, werkt voltijds in Antwerpen. Eigen gsm.</p>
              <p>Plant de thuisverpleging, de kapper en de bezoekjes van haar broer Tom. Belt mama vijf keer per dag.</p>
              <p className="persona-quote">Tijd is te kort en vol zorgen.</p>
              <a className="btn-secondary" href="#/zorg">
                Bekijk de plan-app van Els
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="band band-cta">
        <div className="band-inner cta-inner">
          <h2>Probeer het zelf</h2>
          <p>Open het wandscherm en de plan-app naast elkaar. Wat je op de ene afvinkt, verschijnt meteen op de andere.</p>
          <div className="hero-cta">
            <a className="btn-primary" href="#/scherm">
              Open het wandscherm
            </a>
            <a className="btn-secondary" href="#/zorg">
              Open de plan-app
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
