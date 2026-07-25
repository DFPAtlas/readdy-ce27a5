'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileCheck, Eye, MessageSquare, Clock, Users, AlertTriangle,
  Plus, Search, ArrowRight, ExternalLink, MoreVertical, XCircle,
  CheckCircle2, Ban, ShieldCheck, RotateCcw, ChevronDown
} from 'lucide-react';

interface ReviewItem {
  id: string;
  name: string;
  sourceType: string;
  sourceName: string;
  brand: string;
  reviewType: string;
  status: string;
  dueDate: string | null;
  reviewerCount: number;
  decisions: { approved: number; rejected: number; changes: number; pending: number };
  lastActivity: string;
  owner: string;
  round: number;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/20', icon: FileCheck },
  ready_to_send: { label: 'Ready to Send', color: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/20', icon: FileCheck },
  sent: { label: 'Sent', color: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/20', icon: Eye },
  viewed: { label: 'Viewed', color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/20', icon: Eye },
  in_review: { label: 'In Review', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20', icon: MessageSquare },
  changes_requested: { label: 'Changes Req.', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20', icon: RotateCcw },
  partially_approved: { label: 'Partial App.', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20', icon: ShieldCheck },
  approved: { label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20', icon: XCircle },
  expired: { label: 'Expired', color: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-500/20', icon: Clock },
  revoked: { label: 'Revoked', color: 'text-rose-400', bg: 'bg-rose-400/10 border-rose-400/20', icon: Ban },
  cancelled: { label: 'Cancelled', color: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-500/20', icon: XCircle },
  superseded: { label: 'Superseded', color: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-500/20', icon: RotateCcw },
};

const SOURCE_TYPE_META: Record<string, string> = {
  template: 'Template',
  campaign: 'Campaign',
  experiment: 'Experiment',
  automation: 'Automation',
  transactional: 'Transactional',
  language_variant: 'Language Variant',
  personalised_content: 'Personalised Content',
  brand_header: 'Brand Header',
  brand_footer: 'Brand Footer',
  legal_content: 'Legal Content',
  product_bundle: 'Product Bundle',
};

const REVIEW_TYPE_META: Record<string, string> = {
  content: 'Content Review',
  brand: 'Brand Review',
  legal: 'Legal Review',
  accessibility: 'Accessibility',
  localisation: 'Localisation',
  campaign_signoff: 'Campaign Sign-off',
  product_owner: 'Product Owner',
  general_stakeholder: 'Stakeholder',
};

const MOCK_REVIEWS: ReviewItem[] = [
  { id: 'rev-1', name: 'Q3 Welcome Campaign', sourceType: 'campaign', sourceName: 'Welcome Series v3', brand: 'Digital Footprint', reviewType: 'campaign_signoff', status: 'in_review', dueDate: '2026-07-25', reviewerCount: 5, decisions: { approved: 2, rejected: 0, changes: 1, pending: 2 }, lastActivity: '2 hours ago', owner: 'Alex Chen', round: 1 },
  { id: 'rev-2', name: 'Updated Legal Footer', sourceType: 'legal_content', sourceName: 'Global Footer v7', brand: 'All Brands', reviewType: 'legal', status: 'sent', dueDate: '2026-07-28', reviewerCount: 3, decisions: { approved: 0, rejected: 0, changes: 0, pending: 3 }, lastActivity: '5 hours ago', owner: 'Maya Patel', round: 1 },
  { id: 'rev-3', name: 'Synqoro Product Launch', sourceType: 'template', sourceName: 'Synqoro Launch Email', brand: 'Synqoro', reviewType: 'product_owner', status: 'changes_requested', dueDate: '2026-07-22', reviewerCount: 4, decisions: { approved: 0, rejected: 0, changes: 2, pending: 2 }, lastActivity: '1 day ago', owner: 'James Wilson', round: 2 },
  { id: 'rev-4', name: 'GuardianHub Onboarding', sourceType: 'template', sourceName: 'GuardianHub Welcome', brand: 'GuardianHub', reviewType: 'content', status: 'approved', dueDate: '2026-07-18', reviewerCount: 3, decisions: { approved: 3, rejected: 0, changes: 0, pending: 0 }, lastActivity: '3 days ago', owner: 'Sarah Kim', round: 1 },
  { id: 'rev-5', name: 'FR Localisation Pack', sourceType: 'language_variant', sourceName: 'Invoice Template FR', brand: 'Digital Footprint', reviewType: 'localisation', status: 'partially_approved', dueDate: '2026-07-26', reviewerCount: 2, decisions: { approved: 1, rejected: 0, changes: 0, pending: 1 }, lastActivity: '1 day ago', owner: 'Luc Dubois', round: 1 },
  { id: 'rev-6', name: 'Dark Mode Header', sourceType: 'brand_header', sourceName: 'Brand Header v12', brand: 'QuickGuard', reviewType: 'brand', status: 'draft', dueDate: null, reviewerCount: 2, decisions: { approved: 0, rejected: 0, changes: 0, pending: 2 }, lastActivity: '1 week ago', owner: 'Emma Torres', round: 1 },
  { id: 'rev-7', name: 'Payment Receipt Redesign', sourceType: 'transactional', sourceName: 'Receipt Template T4', brand: 'Lethub', reviewType: 'accessibility', status: 'expired', dueDate: '2026-07-10', reviewerCount: 2, decisions: { approved: 0, rejected: 0, changes: 0, pending: 2 }, lastActivity: '10 days ago', owner: 'David Park', round: 1 },
  { id: 'rev-8', name: 'A/B Test Hero CTA', sourceType: 'experiment', sourceName: 'Hero Variant B', brand: 'Digital Footprint', reviewType: 'general_stakeholder', status: 'revoked', dueDate: '2026-07-20', reviewerCount: 3, decisions: { approved: 1, rejected: 0, changes: 0, pending: 2 }, lastActivity: '4 days ago', owner: 'Nina Gupta', round: 1 },
];

export default function ReviewsDashboard() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = MOCK_REVIEWS.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.sourceName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesType = typeFilter === 'all' || r.reviewType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const activeReviews = MOCK_REVIEWS.filter((r) => ['sent','viewed','in_review','partially_approved'].includes(r.status)).length;
  const pendingApproval = MOCK_REVIEWS.filter((r) => r.status === 'in_review' || r.status === 'partially_approved').length;
  const changesReq = MOCK_REVIEWS.filter((r) => r.status === 'changes_requested').length;
  const approved = MOCK_REVIEWS.filter((r) => r.status === 'approved').length;

  const STATS = [
    { label: 'Active Reviews', value: activeReviews, icon: MessageSquare, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Awaiting Sign-off', value: pendingApproval, icon: Users, color: 'text-violet-400', bg: 'bg-violet-400/10' },
    { label: 'Changes Requested', value: changesReq, icon: RotateCcw, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { label: 'Approved', value: approved, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">External Reviews</h1>
          <p className="text-sm text-slate-400 mt-1">Secure client and stakeholder review & approval for email content</p>
        </div>
        <Link href="/admin/email/reviews" className="flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] text-white rounded-xl font-semibold text-sm hover:bg-[#0891B2] transition-all cursor-pointer whitespace-nowrap shadow-lg shadow-[#06B6D4]/10">
          <Plus className="w-4 h-4" />
          Create Review
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{s.label}</span>
                <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 pr-8"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="in_review">In Review</option>
          <option value="changes_requested">Changes Requested</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 pr-8"
        >
          <option value="all">All Types</option>
          <option value="campaign_signoff">Campaign Sign-off</option>
          <option value="legal">Legal Review</option>
          <option value="product_owner">Product Owner</option>
          <option value="content">Content Review</option>
          <option value="brand">Brand Review</option>
          <option value="localisation">Localisation</option>
          <option value="accessibility">Accessibility</option>
          <option value="general_stakeholder">Stakeholder</option>
        </select>
      </div>

      <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Review</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Source</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Reviewers</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Due</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Owner</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Activity</th>
                <th className="px-5 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const sm = STATUS_META[r.status] || STATUS_META.draft;
                const StatusIcon = sm.icon;
                return (
                  <tr key={r.id} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/email/reviews/${r.id}`} className="text-sm font-medium text-white hover:text-[#06B6D4] transition-colors cursor-pointer">
                        {r.name}
                      </Link>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-slate-500">{r.brand}</span>
                        {r.round > 1 && (
                          <span className="px-1 py-0.5 rounded text-[9px] font-medium bg-violet-400/10 text-violet-400">R{r.round}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-300">{r.sourceName}</span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{SOURCE_TYPE_META[r.sourceType] || r.sourceType}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-300">{REVIEW_TYPE_META[r.reviewType] || r.reviewType}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold border ${sm.bg} ${sm.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {sm.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-white font-medium">{r.reviewerCount}</span>
                        <div className="flex items-center gap-1">
                          {r.decisions.approved > 0 && (
                            <span className="w-4 h-4 rounded-full bg-emerald-400/20 text-emerald-400 text-[9px] font-bold flex items-center justify-center">{r.decisions.approved}</span>
                          )}
                          {r.decisions.changes > 0 && (
                            <span className="w-4 h-4 rounded-full bg-orange-400/20 text-orange-400 text-[9px] font-bold flex items-center justify-center">{r.decisions.changes}</span>
                          )}
                          {r.decisions.rejected > 0 && (
                            <span className="w-4 h-4 rounded-full bg-red-400/20 text-red-400 text-[9px] font-bold flex items-center justify-center">{r.decisions.rejected}</span>
                          )}
                          {r.decisions.pending > 0 && (
                            <span className="w-4 h-4 rounded-full bg-slate-400/20 text-slate-400 text-[9px] font-bold flex items-center justify-center">{r.decisions.pending}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-sm ${r.dueDate ? 'text-slate-300' : 'text-slate-600'}`}>
                        {r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-300">{r.owner}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-500">{r.lastActivity}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.06] text-slate-500 hover:text-white transition-colors cursor-pointer opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center">
                    <FileCheck className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">No reviews found</p>
                    <p className="text-xs text-slate-500 mt-1">Create a review package to share with external stakeholders</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Link href="/admin/email/reviews" className="flex items-center gap-3 px-4 py-3 bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-[#06B6D4]/30 transition-all cursor-pointer group">
          <FileCheck className="w-4 h-4 text-slate-500 group-hover:text-[#06B6D4] transition-colors" />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Review Detail & Activity</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#06B6D4] ml-auto transition-colors" />
        </Link>
        <Link href="/admin/email/settings/external-reviews" className="flex items-center gap-3 px-4 py-3 bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-[#06B6D4]/30 transition-all cursor-pointer group">
          <ShieldCheck className="w-4 h-4 text-slate-500 group-hover:text-[#06B6D4] transition-colors" />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">External Review Settings</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#06B6D4] ml-auto transition-colors" />
        </Link>
      </div>
    </div>
  );
}