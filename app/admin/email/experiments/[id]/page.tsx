import ExperimentDetailClient from './ExperimentDetailClient';

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

export default function ExperimentDetailPage({ params }: { params: { id: string } }) {
  return <ExperimentDetailClient params={params} />;
}