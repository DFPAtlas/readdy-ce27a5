import ProductDetail from '../ProductDetail';

export async function generateStaticParams() {
  return [
    { slug: 'quickguard' },
    { slug: 'guardianhub' },
    { slug: 'synqoro' },
    { slug: 'lethub' },
  ];
}

export default function ProductSlugPage({ params }: { params: { slug: string } }) {
  return <ProductDetail slug={params.slug} />;
}