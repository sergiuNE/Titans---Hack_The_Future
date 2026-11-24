/** Site footer on every page. No contact details, address, company number or social links. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="foot-grid">
        <div className="foot-brand">
          <a className="foot-logo" href="#/" aria-label="Anker, naar de homepagina">
            <span>Anker</span>
          </a>
          <p>
            Anker geeft mensen met dementie of geheugenproblemen houvast in hun dag, en hun mantelzorgers rust. Een
            concept van Team Titans voor Hack The Future 2026, gebouwd in Antwerpen.
          </p>
        </div>

        <nav aria-labelledby="foot-pages">
          <h2 id="foot-pages">Pagina's</h2>
          <ul>
            <li><a href="#/">Home</a></li>
            <li><a href="#/waarom">Waarom Anker</a></li>
            <li><a href="#/hoe">Hoe het werkt</a></li>
            <li><a href="#/scherm">Wandscherm</a></li>
            <li><a href="#/zorg">Mantelzorger</a></li>
          </ul>
        </nav>

        <nav aria-labelledby="foot-legal">
          <h2 id="foot-legal">Juridisch</h2>
          <ul>
            <li><a href="#/privacy">Privacybeleid</a></li>
            <li><a href="#/voorwaarden">Gebruiksvoorwaarden</a></li>
            <li><a href="#/privacy">Cookies: we plaatsen er geen</a></li>
          </ul>
        </nav>

        <div>
          <h2>Project</h2>
          <ul>
            <li>Hack The Future 2026</li>
            <li>Challenge van Little Miss Robot</li>
            <li>Team Titans</li>
            <li>Laurens Rombout en Sergiu Neagu</li>
          </ul>
        </div>
      </div>

      <div className="foot-bar">
        <span>© 2026 Anker · Team Titans</span>
        <span>Website by Neagu Sergiu</span>
      </div>
    </footer>
  );
}
