import type { Metadata } from 'next';
import AILeadSalesWorkspace from './AILeadSalesWorkspace';

export const metadata: Metadata = {
  title: 'AI Lead and Sales System Demo | Digital Footprint',
  description: 'Try a simulated AI-assisted CRM journey covering lead qualification, reply generation, proposals, pipeline forecasting and sales automation.',
};

export default function AILeadSystemDemoPage() {
  return <AILeadSalesWorkspace />;
}
