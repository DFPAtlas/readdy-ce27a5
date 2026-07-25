import AppDetailClient from './AppDetailClient';

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }];
}

export default function AppDetailPage({ params }: { params: { id: string } }) {
  return <AppDetailClient id={params.id} />;
}