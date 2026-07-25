'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Download } from 'lucide-react';

interface ActivityEvent {
  id: string;
  action: string;
  detail: string;
  user: string;
  category: 'snapshot' | 'invitation' | 'access' | 'comment' | 'decision' | 'admin' | 'system';
  time: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  snapshot: 'bg-slate-400',
  invitation: 'bg-violet-400',
  access: 'bg-sky-400',
  comment: 'bg-amber-400',
  decision: 'bg-emerald-400',
  admin: 'bg-red-400',
  system: 'bg-slate-500',
};

const MOCK_ACTIVITY: ActivityEvent[] = [
  { id: 'a1', action: 'Comment added', detail: 'Alex Chen replied to Tom Harris — pricing comment', user: 'Alex Chen', category: 'comment', time: '2026-07-21T17:00:00Z' },
  { id: 'a2', action: 'Decision submitted', detail: 'Tom Harris requested changes — pricing and mobile CTA', user: 'Tom Harris', category: 'decision', time: '2026-07-21T16:12:00Z' },
  { id: 'a3', action: 'Decision submitted', detail: 'Sarah Mitchell approved with comments', user: 'Sarah Mitchell', category: 'decision', time: '2026-07-21T14:32:00Z' },
  { id: 'a4', action: 'Internal note added', detail: 'Alex Chen noted legal footer pre-approved', user: 'Alex Chen', category: 'comment', time: '2026-07-21T10:00:00Z' },
  { id: 'a5', action: 'Review link viewed', detail: 'James Ng viewed the desktop and mobile previews', user: 'James Ng', category: 'access', time: '2026-07-20T11:05:00Z' },
  { id: 'a6', action: 'Review link viewed', detail: 'Priya Shah acknowledged viewing the review', user: 'Priya Shah', category: 'access', time: '2026-07-20T09:15:00Z' },
  { id: 'a7', action: 'Token verified', detail: 'Rachel Kim passed email verification', user: 'Rachel Kim', category: 'access', time: '2026-07-20T08:50:00Z' },
  { id: 'a8', action: 'Invitation delivered', detail: 'All 5 reviewer invitations confirmed delivered via Resend', user: 'System', category: 'invitation', time: '2026-07-19T08:05:00Z' },
  { id: 'a9', action: 'Invitations sent', detail: '5 reviewer invitations dispatched via Resend', user: 'Alex Chen', category: 'invitation', time: '2026-07-19T08:00:00Z' },
  { id: 'a10', action: 'Review activated', detail: 'Status changed from Ready to Send to Sent', user: 'Alex Chen', category: 'admin', time: '2026-07-19T08:00:00Z' },
  { id: 'a11', action: 'Snapshot created', detail: 'Immutable snapshot v3.2.1 checksum a8f3b... created', user: 'System', category: 'snapshot', time: '2026-07-18T10:30:00Z' },
  { id: 'a12', action: 'Review package created', detail: 'Q3 Welcome Campaign review created with all_required policy', user: 'Alex Chen', category: 'admin', time: '2026-07-18T10:30:00Z' },
  { id: 'a13', action: 'Reviewers added', detail: 'Sarah Mitchell, Tom Harris, Rachel Kim (required); James Ng (optional); Priya Shah (observer)', user: 'Alex Chen', category: 'admin', time: '2026-07-18T10:28:00Z' },
];

export default function ReviewActivityClient() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = MOCK_ACTIVITY.filter((e) => {
    const matchesSearch = e.action.toLowerCase().includes(search.toLowerCase()) || e.detail.toLowerCase().includes(search.toLowerCase()) || e.user.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/email/reviews/rev-1" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Q3 Welcome Campaign — Activity Log</h1>
          <p className="text-sm text-slate-400 mt-0.5">Complete audit trail for review rev-1 · Round 1</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/30"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 pr-8"
        >
          <option value="all">All Categories</option>
          <option value="snapshot">Snapshot</option>
          <option value="invitation">Invitation</option>
          <option value="access">Access</option>
          <option value="comment">Comment</option>
          <option value="decision">Decision</option>
          <option value="admin">Admin</option>
          <option value="system">System</option>
        </select>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] text-slate-300 rounded-xl font-semibold text-sm hover:bg-white/[0.08] transition-all cursor-pointer whitespace-nowrap">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-[rgba(255,255,255,0.06)]" />
          <div className="divide-y divide-[rgba(255,255,255,0.03)]">
            {filtered.map((event) => (
              <div key={event.id} className="relative flex items-start gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors">
                <div className={`relative z-10 w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${CATEGORY_COLORS[event.category]} ring-4 ring-[#121215]`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{event.action}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{event.detail}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-500 block">{event.user}</span>
                  <span className="text-[11px] text-slate-600 mt-0.5 block">
                    {new Date(event.time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-slate-400">No matching activity found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Audit Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white/[0.02] rounded-xl text-center">
            <p className="text-lg font-bold text-white">{MOCK_ACTIVITY.length}</p>
            <p className="text-[10px] text-slate-500">Total Events</p>
          </div>
          <div className="p-3 bg-white/[0.02] rounded-xl text-center">
            <p className="text-lg font-bold text-emerald-400">{MOCK_ACTIVITY.filter((e) => e.category === 'decision').length}</p>
            <p className="text-[10px] text-slate-500">Decisions</p>
          </div>
          <div className="p-3 bg-white/[0.02] rounded-xl text-center">
            <p className="text-lg font-bold text-amber-400">{MOCK_ACTIVITY.filter((e) => e.category === 'comment').length}</p>
            <p className="text-[10px] text-slate-500">Comments</p>
          </div>
          <div className="p-3 bg-white/[0.02] rounded-xl text-center">
            <p className="text-lg font-bold text-sky-400">{MOCK_ACTIVITY.filter((e) => e.category === 'access').length}</p>
            <p className="text-[10px] text-slate-500">Access Events</p>
          </div>
        </div>
      </div>
    </div>
  );
}