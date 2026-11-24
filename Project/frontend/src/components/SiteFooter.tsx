import Link from 'next/link';

/** Site footer on every page. No contact details, address, company number or social links. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="foot-grid">
        <div className="foot-brand">
          <Link className="foot-logo" href="/" aria-label="Anker, naar de homepagina">
            <span>Anker</span>
          </Link>
          <p>
            Anker geeft mensen met dementie of geheugenproblemen houvast in hun dag, en hun mantelzorgers rust. Een
            concept van Team Titans voor Hack The Future 2026, gebouwd in Antwerpen.
          </p>
        </div>

        <nav aria-labelledby="foot-pages">
          <h2 id="foot-pages">Pagina's</h2>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/#waarom">Waarom Anker</Link></li>
            <li><Link href="/#hoe">Hoe het werkt</Link></li>
            <li><Link href="/vandaag">Wandscherm</Link></li>
            <li><Link href="/plan">Mantelzorger</Link></li>
          </ul>
        </nav>

        <nav aria-labelledby="foot-legal">
          <h2 id="foot-legal">Juridisch</h2>
          <ul>
            <li><Link href="/privacy">Privacybeleid</Link></li>
            <li><Link href="/voorwaarden">Gebruiksvoorwaarden</Link></li>
            <li><Link href="/privacy">Cookies: we plaatsen er geen</Link></li>
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
