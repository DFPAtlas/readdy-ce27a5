import type { Metadata } from 'next';
import CustomerProjectPortalWorkspace from './CustomerProjectPortalWorkspace';

export const metadata: Metadata = {
  title: 'Customer Project Portal Demo | Digital Footprint',
  description: 'Explore a simulated customer portal for milestones, approvals, messages, files, invoices and payment schedules.',
};

export default function CustomerPortalDemoPage() {
  return <CustomerProjectPortalWorkspace />;
}
