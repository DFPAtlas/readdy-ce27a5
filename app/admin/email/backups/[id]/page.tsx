import BackupDetailClient from './BackupDetailClient';

export async function generateStaticParams() {
  return [{ id: 'bak-001' }, { id: 'bak-002' }, { id: 'bak-003' }];
}

export default function BackupDetailPage() {
  return <BackupDetailClient />;
}