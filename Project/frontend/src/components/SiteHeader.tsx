import type { Route } from '../lib/store';

const LINKS: { href: string; label: string; route: Route }[] = [
  { href: '#/', label: 'Home', route: 'home' },
  { href: '#/scherm', label: 'Wandscherm', route: 'scherm' },
  { href: '#/zorg', label: 'Mantelzorger', route: 'zorg' },
];

export function SiteHeader({ route }: { route: Route }) {
  return (
    <header className="site-header">
      <a className="brand" href="#/">
        <img src="/favicon.svg" alt="" width={32} height={32} />
        Anker
      </a>
      <nav aria-label="Hoofdmenu">
        <ul>
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} aria-current={route === l.route ? 'page' : undefined}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
