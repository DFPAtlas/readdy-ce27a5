import AutomationActivityClient from './AutomationActivityClient';

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

export default function AutomationActivityPage({ params }: { params: { id: string } }) {
  return <AutomationActivityClient params={params} />;
}