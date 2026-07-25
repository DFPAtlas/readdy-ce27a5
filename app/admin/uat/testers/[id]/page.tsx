import Tester360Workspace from '@/components/admin/uat/Tester360Workspace';

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

export default function TesterDetailPage({ params }: { params: { id: string } }) {
  return <Tester360Workspace testerId={params.id} />;
}