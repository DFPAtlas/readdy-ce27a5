import Lead360Workspace from './Lead360Workspace';

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  return <Lead360Workspace leadId={params.id} />;
}