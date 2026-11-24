import type { Metadata } from 'next';
import { Privacy } from '../../components/Legal';

export const metadata: Metadata = { title: 'Privacybeleid' };

export default function Page() {
  return <Privacy />;
}
