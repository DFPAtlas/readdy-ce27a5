import ContactDetail from './ContactDetail'

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }]
}

export default function ContactPage({ params }: { params: { id: string } }) {
  return <ContactDetail />
}