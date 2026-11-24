import type { Metadata } from 'next';
import { Terms } from '../../components/Legal';

export const metadata: Metadata = { title: 'Gebruiksvoorwaarden' };

export default function Page() {
  return <Terms />;
}
