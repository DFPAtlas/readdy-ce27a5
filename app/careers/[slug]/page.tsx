import CareersVacancyDetail from './CareersVacancyDetail';

export async function generateStaticParams() {
  return [
    { slug: 'senior-frontend-engineer' },
    { slug: 'cloud-infrastructure-engineer' },
    { slug: 'graduate-software-developer' },
    { slug: 'product-manager-saas' },
  ];
}

export default function CareersVacancyPage({ params }: { params: { slug: string } }) {
  return <CareersVacancyDetail slug={params.slug} />;
}