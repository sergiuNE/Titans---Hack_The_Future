/** Site footer for the caregiver view. The wall screen has none: nothing there may distract. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="foot-grid">
        <div className="foot-brand">
          <span className="foot-logo">
            <span>Anker</span>
          </span>
          <p>
            Anker geeft mensen met dementie of geheugenproblemen houvast in hun dag, en hun mantelzorgers rust. Een
            concept van Team Titans voor Hack The Future 2026.
          </p>
        </div>

        <nav aria-labelledby="foot-pages">
          <h2 id="foot-pages">Pagina's</h2>
          <ul>
            <li><a href="#/">Wandscherm</a></li>
            <li><a href="#/zorg">Mantelzorger</a></li>
          </ul>
        </nav>

        <div>
          <h2>Voor wie</h2>
          <ul>
            <li>Personen met dementie</li>
            <li>Familie en mantelzorgers</li>
            <li>Thuisverpleging</li>
          </ul>
        </div>

        <div>
          <h2>Project</h2>
          <ul>
            <li>Hack The Future 2026</li>
            <li>Challenge: Claim de tijd terug</li>
            <li>Little Miss Robot</li>
          </ul>
        </div>
      </div>

      <div className="foot-bar">
        <span>© 2026 Anker, Team Titans</span>
        <span>Website by Neagu Sergiu</span>
      </div>
    </footer>
  );
}
