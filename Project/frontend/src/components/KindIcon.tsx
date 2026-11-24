import type { ReactNode } from 'react';
import type { Item } from '../lib/day';

const paths: Record<Item['kind'], ReactNode> = {
  medicijn: (
    <>
      <rect x="3.5" y="9" width="17" height="6.5" rx="3.25" transform="rotate(-35 12 12.25)" />
      <path d="M10 8.2l4.1 7.9" />
    </>
  ),
  maaltijd: (
    <>
      <circle cx="13" cy="12" r="6.5" />
      <circle cx="13" cy="12" r="3" />
      <path d="M3.5 4v5.5M2 4v3.5a1.5 1.5 0 003 0V4M3.5 9.5V20" />
    </>
  ),
  bezoek: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20.5c.8-4.2 4-6.5 8-6.5s7.2 2.3 8 6.5" />
    </>
  ),
  taak: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5.5" />
    </>
  ),
};

/** Icon for an item. Visitors with a photo show the photo instead. */
export function KindIcon({ item, size = 48 }: { item: Item; size?: number }) {
  if (item.kind === 'bezoek' && item.photo) {
    return <img className="avatar" src={item.photo} alt="" width={size} height={size} />;
  }
  if (item.kind === 'bezoek') {
    // No photo yet: the first letter of the name is still more personal than a generic icon.
    return (
      <span className="avatar initial" style={{ width: size, height: size, fontSize: size * 0.46 }} aria-hidden="true">
        {item.title.trim().charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <svg
      className={`kind kind-${item.kind}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[item.kind]}
    </svg>
  );
}
