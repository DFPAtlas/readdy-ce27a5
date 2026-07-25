import BrandKitEditorPage from '../BrandKitEditor';

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: 'new' }];
}

export default function BrandKitPage({ params }: { params: { id: string } }) {
  return <BrandKitEditorPage />;
}