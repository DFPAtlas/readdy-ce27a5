import { Suspense } from 'react';
import StaffDetailPage from './StaffDetail';

export async function generateStaticParams() {
  return [
    { id: 'c69343ec-2cd6-4962-8c11-f9dbd199f886' },
    { id: 'da1b56ef-b1a0-407c-968a-978207a8463d' },
  ];
}

export default function StaffDetailWrapper({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><p className="text-slate-500">Loading...</p></div>}>
      <StaffDetailPage />
    </Suspense>
  );
}