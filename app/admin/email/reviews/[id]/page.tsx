import ReviewDetailClient from './ReviewDetailClient';

export async function generateStaticParams() {
  return [{ id: 'rev-1' }, { id: 'rev-2' }, { id: 'rev-3' }];
}

export default function ReviewDetailPage() {
  return <ReviewDetailClient />;
}