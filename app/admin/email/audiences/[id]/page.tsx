import AudienceDetail from './AudienceDetail'

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }]
}

export default function AudiencePage({ params }: { params: { id: string } }) {
  return <AudienceDetail />
}