import type { Metadata } from 'next';
import CustomerProjectPortalClient from './CustomerProjectPortalClient';

export const metadata: Metadata = {
  title: 'Customer Project Portal Demo | Digital Footprint',
  description: 'Try a simulated customer portal for project milestones, design approvals, messages, files, invoices and UK payment schedules.',
};

export default function CustomerPortalDemoPage() {
  return <CustomerProjectPortalClient />;
}
