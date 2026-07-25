import ProjectCommandWorkspace from './ProjectCommandWorkspace';

export async function generateStaticParams() {
  return [
    { id: '1' }, { id: '2' }, { id: '3' },
  ];
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  return <ProjectCommandWorkspace projectId={params.id} />;
}