import ReviewActivityClient from './ReviewActivityClient';

export async function generateStaticParams() {
  return [{ id: 'rev-1' }, { id: 'rev-2' }];
}

export default function ReviewActivityPage() {
  return <ReviewActivityClient />;
}