import TicketDetail from './TicketDetail';

export async function generateStaticParams() {
  return [
    { id: 'placeholder-1' },
    { id: 'placeholder-2' },
    { id: 'placeholder-3' },
  ];
}

export default function SupportTicketPage({ params }: { params: { id: string } }) {
  return <TicketDetail ticketId={params.id} />;
}