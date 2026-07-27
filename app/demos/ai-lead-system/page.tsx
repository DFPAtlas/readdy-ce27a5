import type { Metadata } from 'next';
import DemoWorkspace from '../DemoWorkspace';

export const metadata: Metadata = {
  title: 'AI Lead and Sales System Demo | Digital Footprint',
  description: 'Try a simulated AI-assisted lead qualification and sales workflow from Digital Footprint.',
};

export default function AILeadSystemDemoPage() {
  return (
    <DemoWorkspace
      type="sales"
      eyebrow="AI powered workflow"
      title="AI Lead & Sales System"
      description="Move a fictional enquiry from first contact to qualification, suggested reply and proposal-ready opportunity."
    />
  );
}
