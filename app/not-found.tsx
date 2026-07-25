import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4 bg-white">
      <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-[#06B6D4] to-[#22D3EE] bg-clip-text text-transparent mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">Page Not Found</h2>
      <p className="text-lg text-slate-500 mb-8">The page you are looking for does not exist or has been moved.</p>
      <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-all cursor-pointer whitespace-nowrap">
        <i className="ri-arrow-left-line w-4 h-4 flex items-center justify-center" />
        Back to Home
      </Link>
    </div>
  );
}