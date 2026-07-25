import Client360Workspace from './Client360Workspace';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  return <Client360Workspace clientId={params.id} />;
}