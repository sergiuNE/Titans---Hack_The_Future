import type { Metadata } from 'next';
import { WallPage } from '../../components/Pages';

export const metadata: Metadata = { title: 'Vandaag' };

export default function Page() {
  return <WallPage />;
}
