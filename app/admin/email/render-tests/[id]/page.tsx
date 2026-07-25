import RenderTestDetailClient from './RenderTestDetailClient';

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

export default function RenderTestDetailPage({ params }: { params: { id: string } }) {
  return <RenderTestDetailClient params={params} />;
}