import TicketDetail from './TicketDetail';

export async function generateStaticParams() {
  return [
    { id: 'placeholder-1' },
    { id: 'placeholder-2' },
    { id: 'placeholder-3' },
  ];
}

export default async function SupportTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  return <TicketDetail ticketId={resolvedParams.id} />;
}