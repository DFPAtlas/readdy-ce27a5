'use client';

import dynamic from 'next/dynamic';

const AILeadSalesWorkspace = dynamic(
  () => import('./AILeadSalesWorkspace'),
  {
    ssr: false,
    loading: () => (
      <main className="min-h-screen bg-[#07111f] px-6 pt-36 text-white">
        <div className="mx-auto max-w-7xl animate-pulse rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-sm text-slate-400">
          Loading AI Lead &amp; Sales demo…
        </div>
      </main>
    ),
  },
);

export default function AILeadSalesClient() {
  return <AILeadSalesWorkspace />;
}
