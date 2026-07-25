import CampaignWizardPage from './CampaignWizardPage';
export async function generateStaticParams() {
  return [{ id: 'new' }, { id: 'example-1' }, { id: 'example-2' }];
}
export default function CampaignPage({ params }: { params: { id: string } }) {
  return <CampaignWizardPage campaignId={params.id} />;
}