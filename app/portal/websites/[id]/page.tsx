import WebsiteDetail from './WebsiteDetail';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default function WebsitePage({ params }: { params: { id: string } }) {
  return <WebsiteDetail websiteId={params.id} />;
}