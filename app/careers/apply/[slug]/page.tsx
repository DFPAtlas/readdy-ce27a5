import CareersApplyClient from './CareersApplyClient';

export async function generateStaticParams() {
  return [
    { slug: 'senior-frontend-engineer' },
    { slug: 'cloud-infrastructure-engineer' },
    { slug: 'graduate-software-developer' },
    { slug: 'product-manager-saas' },
  ];
}

export default function CareersApplyPage({ params }: { params: { slug: string } }) {
  return <CareersApplyClient slug={params.slug} />;
}