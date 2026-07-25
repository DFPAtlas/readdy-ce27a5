import InvoiceDetailWorkspace from './InvoiceDetailWorkspace';

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  return <InvoiceDetailWorkspace invoiceId={params.id} />;
}