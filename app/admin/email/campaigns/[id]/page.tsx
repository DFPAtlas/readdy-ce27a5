import CampaignWizardPage from './CampaignWizardPage';
export async function generateStaticParams() {
  return [{ id: 'new' }, { id: 'example-1' }, { id: 'example-2' }];
}
export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <CampaignWizardPage campaignId={resolvedParams.id} />;
}