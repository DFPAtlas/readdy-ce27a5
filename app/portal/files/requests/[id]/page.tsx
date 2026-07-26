import RequestDetail from './RequestDetail';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  return <RequestDetail requestId={params.id} />;
}