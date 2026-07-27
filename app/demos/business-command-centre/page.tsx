import type { Metadata } from 'next';
import BusinessCommandCentreClient from './BusinessCommandCentreClient';

export const metadata: Metadata = {
  title: 'Business Command Centre Demo | Digital Footprint',
  description:
    'Explore a simulated business operations dashboard for projects, team workload, tasks, revenue and cash flow.',
};

export default function BusinessCommandCentreDemoPage() {
  return <BusinessCommandCentreClient />;
}
