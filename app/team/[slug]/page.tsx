import TeamProfileDetail from '../TeamProfileDetail';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export async function generateStaticParams() {
  return [
    { slug: 'martin-hewett' },
    { slug: 'chris' },
    { slug: 'amelia-hart' },
  ];
}

export default function TeamProfilePage({ params }: { params: { slug: string } }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fafbfc] pt-24">
        <TeamProfileDetail slug={params.slug} />
      </main>
      <Footer />
    </>
  );
}