import TaskDetailWorkspace from './TaskDetailWorkspace';

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  return <TaskDetailWorkspace taskId={params.id} />;
}