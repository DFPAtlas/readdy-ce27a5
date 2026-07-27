import type { Metadata } from 'next';
import DemoWorkspace from '../DemoWorkspace';

export const metadata: Metadata = {
  title: 'Customer Project Portal Demo | Digital Footprint',
  description: 'Explore a simulated customer project portal from Digital Footprint.',
};

export default function CustomerPortalDemoPage() {
  return (
    <DemoWorkspace
      type="portal"
      eyebrow="Client experience"
      title="Customer Project Portal"
      description="Review a fictional project, approve a design, request changes and inspect messages, milestones and payment progress."
    />
  );
}
