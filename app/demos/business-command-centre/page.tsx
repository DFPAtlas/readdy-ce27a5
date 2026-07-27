import type { Metadata } from 'next';
import DemoWorkspace from '../DemoWorkspace';

export const metadata: Metadata = {
  title: 'Business Command Centre Demo | Digital Footprint',
  description: 'Explore a simulated business operations dashboard from Digital Footprint.',
};

export default function BusinessCommandCentreDemoPage() {
  return (
    <DemoWorkspace
      type="command"
      eyebrow="Interactive dashboard"
      title="Business Command Centre"
      description="Explore a simulated operations workspace for projects, performance, team capacity and priority actions."
    />
  );
}
