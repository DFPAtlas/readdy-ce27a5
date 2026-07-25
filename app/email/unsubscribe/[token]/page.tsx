import UnsubscribeClient from './UnsubscribeClient'

export async function generateStaticParams() {
  return [{ token: 'demo' }]
}

export default function UnsubscribePage({ params }: { params: { token: string } }) {
  return <UnsubscribeClient />
}