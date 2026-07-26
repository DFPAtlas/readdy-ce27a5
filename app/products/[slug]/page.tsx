import ProductDetail from '../ProductDetail';

export async function generateStaticParams() {
  return [
    { slug: 'quickguard' },
    { slug: 'guardianhub' },
    { slug: 'synqoro' },
    { slug: 'lethub' },
    { slug: 'the-forge' },
    { slug: 'wedora' },
    { slug: 'corevia-ai' },
    { slug: 'homaura' },
    { slug: 'dataharbour' },
    { slug: 'fisheryhub' },
    { slug: 'homvia' },
    { slug: 'hotdesk-hub' },
    { slug: 'bivvybox' },
    { slug: 'rackflow' },
    { slug: 'chairdock-ai' },
    { slug: 'drivedrop-ai' },
  ];
}

export default function ProductSlugPage({ params }: { params: { slug: string } }) {
  return <ProductDetail slug={params.slug} />;
}