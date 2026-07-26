import DemoDetail from '../DemoDetail';

export async function generateStaticParams() {
  return [
    { slug: 'quickguard-walkthrough' },
    { slug: 'guardianhub-preview' },
    { slug: 'synqoro-event-demo' },
    { slug: 'lethub-lettings-tour' },
  ];
}

export default async function DemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  return <DemoDetail slug={resolvedParams.slug} />;
}