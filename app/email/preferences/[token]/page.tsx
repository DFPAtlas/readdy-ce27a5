import PreferencesClient from './PreferencesClient'

export async function generateStaticParams() {
  return [{ token: 'demo' }]
}

export default function PreferencesPage({ params }: { params: { token: string } }) {
  return <PreferencesClient />
}