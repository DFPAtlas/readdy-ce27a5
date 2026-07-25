import ExperimentReportClient from './ExperimentReportClient';

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

export default function ExperimentReportPage({ params }: { params: { id: string } }) {
  return <ExperimentReportClient params={params} />;
}