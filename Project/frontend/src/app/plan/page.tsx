import type { Metadata } from 'next';
import { PlanPage } from '../../components/Pages';

export const metadata: Metadata = { title: 'Plan' };

export default function Page() {
  return <PlanPage />;
}
