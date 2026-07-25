import AutomationEditor from './AutomationEditor';

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: 'new' }];
}

export default function AutomationPage({ params }: { params: { id: string } }) {
  const isNew = params.id === 'new';
  return <AutomationEditor automationId={isNew ? null : params.id} />;
}