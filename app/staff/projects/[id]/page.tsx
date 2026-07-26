export async function generateStaticParams() {
  return [
    { id: 'placeholder-000000000001' },
    { id: 'placeholder-000000000002' },
    { id: 'placeholder-000000000003' },
    { id: 'placeholder-000000000004' },
    { id: 'placeholder-000000000005' },
  ];
}

import ProjectDetailClient from './ProjectDetailClient';

export default function ProjectDetailPage() {
  return <ProjectDetailClient />;
}