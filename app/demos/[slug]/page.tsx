import DemoDetail from '../DemoDetail';

export async function generateStaticParams() {
  return [
    { slug: 'quickguard-walkthrough' },
    { slug: 'guardianhub-preview' },
    { slug: 'synqoro-event-demo' },
    { slug: 'lethub-lettings-tour' },
  ];
}

export default function DemoPage({ params }: { params: { slug: string } }) {
  return <DemoDetail slug={params.slug} />;
}