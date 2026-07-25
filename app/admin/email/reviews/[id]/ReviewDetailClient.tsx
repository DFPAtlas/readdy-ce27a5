'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, FileCheck, Users, Clock, MessageSquare, CheckCircle2, XCircle,
  RotateCcw, Ban, Eye, ExternalLink, ShieldCheck, AlertTriangle,
  ChevronDown, MoreVertical, Send, Plus, Copy, History
} from 'lucide-react';

interface Reviewer {
  id: string;
  displayName: string;
  email: string;
  company: string;
  role: string;
  reviewerType: 'required' | 'optional' | 'observer';
  accessStatus: string;
  decision: string | null;
  decisionAt: string | null;
  decisionNote: string | null;
  lastViewed: string | null;
}

interface Comment {
  id: string;
  author: string;
  authorType: string;
  body: string;
  sourceLocation: string | null;
  sourceType: string | null;
  status: string;
  visibility: string;
  createdAt: string;
  replies: Comment[];
}

interface ReviewDetail {
  id: string;
  name: string;
  sourceType: string;
  sourceName: string;
  sourceVersion: string;
  brand: string;
  language: string;
  reviewType: string;
  status: string;
  approvalPolicy: string;
  dueDate: string | null;
  instructions: string;
  subject: string;
  previewText: string;
  owner: string;
  createdBy: string;
  createdAt: string;
  round: number;
  previousReviewId: string | null;
  reviewers: Reviewer[];
}

const MOCK_DETAIL: ReviewDetail = {
  id: 'rev-1',
  name: 'Q3 Welcome Campaign',
  sourceType: 'campaign',
  sourceName: 'Welcome Series v3',
  sourceVersion: 'v3.2.1',
  brand: 'Digital Footprint',
  language: 'en',
  reviewType: 'campaign_signoff',
  status: 'in_review',
  approvalPolicy: 'all_required',
  dueDate: '2026-07-25',
  instructions: 'Please review the Q3 welcome campaign including all three email variants (desktop, mobile, plain text). Pay special attention to the new CTA placement and the updated brand colours. Legal footer has already been approved in a separate review.',
  subject: 'Welcome to Digital Footprint — Let\'s Get Started',
  previewText: 'Your account is ready. Here\'s everything you need to know to hit the ground running.',
  owner: 'Alex Chen',
  createdBy: 'Alex Chen',
  createdAt: '2026-07-18T10:30:00Z',
  round: 1,
  previousReviewId: null,
  reviewers: [
    { id: 'rvr-1', displayName: 'Sarah Mitchell', email: 'sarah@clientcorp.com', company: 'ClientCorp', role: 'Marketing Director', reviewerType: 'required', accessStatus: 'reviewing', decision: 'approved', decisionAt: '2026-07-21T14:30:00Z', decisionNote: 'Looks great. Love the new CTA placement.', lastViewed: '2026-07-21T14:25:00Z' },
    { id: 'rvr-2', displayName: 'Tom Harris', email: 'tom@clientcorp.com', company: 'ClientCorp', role: 'Product Owner', reviewerType: 'required', accessStatus: 'reviewing', decision: 'changes_requested', decisionAt: '2026-07-21T16:10:00Z', decisionNote: 'The pricing mention in email 2 needs updating to reflect Q3 rates. Also the mobile CTA button is slightly cut off on iPhone SE.', lastViewed: '2026-07-21T16:05:00Z' },
    { id: 'rvr-3', displayName: 'Rachel Kim', email: 'rachel@clientcorp.com', company: 'ClientCorp', role: 'Legal Counsel', reviewerType: 'required', accessStatus: 'verified', decision: null, decisionAt: null, decisionNote: null, lastViewed: null },
    { id: 'rvr-4', displayName: 'James Ng', email: 'james@clientcorp.com', company: 'ClientCorp', role: 'Brand Manager', reviewerType: 'optional', accessStatus: 'viewed', decision: null, decisionAt: null, decisionNote: null, lastViewed: '2026-07-20T11:00:00Z' },
    { id: 'rvr-5', displayName: 'Priya Shah', email: 'priya@agency.com', company: 'Agency', role: 'Account Manager', reviewerType: 'observer', accessStatus: 'viewed', decision: 'acknowledged', decisionAt: '2026-07-20T09:15:00Z', decisionNote: null, lastViewed: '2026-07-20T09:10:00Z' },
  ],
};

const MOCK_COMMENTS: Comment[] = [
  { id: 'cmt-1', author: 'Tom Harris', authorType: 'reviewer', body: 'The pricing mention in email 2 — currently shows £49/mo but Q3 rate is £59/mo. Please update before finalising.', sourceLocation: 'Email 2 — Pricing Section', sourceType: 'section', status: 'open', visibility: 'all', createdAt: '2026-07-21T16:10:00Z', replies: [
    { id: 'cmt-1a', author: 'Alex Chen', authorType: 'internal', body: 'Thanks Tom — will update the pricing and send a new snapshot for review.', sourceLocation: null, sourceType: null, status: 'resolved', visibility: 'all', createdAt: '2026-07-21T17:00:00Z', replies: [] },
  ]},
  { id: 'cmt-2', author: 'Tom Harris', authorType: 'reviewer', body: 'Mobile preview shows the CTA button slightly cut off on narrow viewports. Might need to adjust padding for screens under 375px wide.', sourceLocation: 'Mobile Preview — CTA Button', sourceType: 'mobile_preview', status: 'open', visibility: 'all', createdAt: '2026-07-21T16:12:00Z', replies: [] },
  { id: 'cmt-3', author: 'Sarah Mitchell', authorType: 'reviewer', body: 'Really like the hero image choice — the gradient works well with the updated brand palette. Approved from my side!', sourceLocation: 'Email 1 — Hero Section', sourceType: 'section', status: 'open', visibility: 'all', createdAt: '2026-07-21T14:32:00Z', replies: [
    { id: 'cmt-3a', author: 'Alex Chen', authorType: 'internal', body: 'Thanks Sarah! The design team will be happy to hear that.', sourceLocation: null, sourceType: null, status: 'resolved', visibility: 'all', createdAt: '2026-07-21T15:00:00Z', replies: [] },
  ]},
  { id: 'cmt-4', author: 'Alex Chen', authorType: 'internal', body: 'Internal note: legal has pre-approved the footer content. No need to wait for Rachel on that part specifically.', sourceLocation: null, sourceType: null, status: 'open', visibility: 'internal_only', createdAt: '2026-07-21T10:00:00Z', replies: [] },
];

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/20' },
  invited: { label: 'Invited', color: 'text-sky-400', bg: 'bg-sky-400/10 border-sky-400/20' },
  verified: { label: 'Verified', color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/20' },
  viewed: { label: 'Viewed', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
  reviewing: { label: 'Reviewing', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  completed: { label: 'Completed', color: 'text-slate-300', bg: 'bg-slate-300/10 border-slate-300/20' },
  revoked: { label: 'Revoked', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  expired: { label: 'Expired', color: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-500/20' },
};

const REVIEW_STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'text-slate-400', bg: 'bg-slate-400/10', icon: FileCheck },
  ready_to_send: { label: 'Ready to Send', color: 'text-sky-400', bg: 'bg-sky-400/10', icon: FileCheck },
  sent: { label: 'Sent', color: 'text-sky-400', bg: 'bg-sky-400/10', icon: Send },
  viewed: { label: 'Viewed', color: 'text-violet-400', bg: 'bg-violet-400/10', icon: Eye },
  in_review: { label: 'In Review', color: 'text-amber-400', bg: 'bg-amber-400/10', icon: MessageSquare },
  changes_requested: { label: 'Changes Req.', color: 'text-orange-400', bg: 'bg-orange-400/10', icon: RotateCcw },
  partially_approved: { label: 'Partial App.', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: ShieldCheck },
  approved: { label: 'Approved', color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-400/10', icon: XCircle },
};

const POLICY_LABELS: Record<string, string> = {
  any_one: 'Any One Required',
  all_required: 'All Required',
  minimum_count: 'Minimum Count',
  one_per_group: 'One Per Group',
  sequential: 'Sequential',
  legal_plus_product: 'Legal + Product Owner',
  internal_then_external: 'Internal Then External',
  external_then_internal: 'External Then Final Internal',
};

export default function ReviewDetailClient() {
  const [review] = useState<ReviewDetail>(MOCK_DETAIL);
  const [comments] = useState<Comment[]>(MOCK_COMMENTS);
  const [activeTab, setActiveTab] = useState<'overview' | 'preview' | 'comments' | 'activity'>('overview');
  const [newComment, setNewComment] = useState('');

  const rs = REVIEW_STATUS_META[review.status] || REVIEW_STATUS_META.draft;
  const StatusIcon = rs.icon;

  const decisionCounts = {
    approved: review.reviewers.filter((r) => r.decision === 'approved' || r.decision === 'approved_with_comments').length,
    changes: review.reviewers.filter((r) => r.decision === 'changes_requested').length,
    rejected: review.reviewers.filter((r) => r.decision === 'rejected').length,
    pending: review.reviewers.filter((r) => !r.decision || r.decision === 'acknowledged' || r.decision === 'abstained').length,
  };

  const tabs = [
    { key: 'overview' as const, label: 'Overview', icon: FileCheck },
    { key: 'preview' as const, label: 'Preview', icon: Eye },
    { key: 'comments' as const, label: `Comments (${comments.length})`, icon: MessageSquare },
    { key: 'activity' as const, label: 'Activity', icon: History },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/email/reviews" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.06] text-slate-400 hover:text-white transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">{review.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold border ${rs.bg} ${rs.color}`}>
              <StatusIcon className="w-3 h-3" />
              {rs.label}
            </span>
            <span className="text-xs text-slate-500">Round {review.round}</span>
            <span className="text-xs text-slate-500">{review.sourceName} ({review.sourceVersion})</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
            <div className="flex border-b border-[rgba(255,255,255,0.06)]">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'text-[#06B6D4] border-b-2 border-[#06B6D4]'
                        : 'text-slate-400 hover:text-white border-b-2 border-transparent'
                    }`}
                  >
                    <TabIcon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Instructions</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{review.instructions}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Subject</h3>
                      <p className="text-sm text-white">{review.subject}</p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Preview Text</h3>
                      <p className="text-sm text-slate-300">{review.previewText}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Reviewers</h3>
                    <div className="space-y-2">
                      {review.reviewers.map((rvr) => {
                        const accessMeta = STATUS_META[rvr.accessStatus] || STATUS_META.pending;
                        return (
                          <div key={rvr.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-[rgba(255,255,255,0.04)] rounded-xl">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#06B6D4]/20 to-[#22D3EE]/10 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-[#06B6D4]">{rvr.displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">{rvr.displayName}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-slate-500">{rvr.role} · {rvr.company}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${rvr.reviewerType === 'required' ? 'bg-amber-400/10 text-amber-400' : rvr.reviewerType === 'optional' ? 'bg-sky-400/10 text-sky-400' : 'bg-slate-400/10 text-slate-400'}`}>
                                    {rvr.reviewerType}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${accessMeta.bg} ${accessMeta.color}`}>
                                {accessMeta.label}
                              </span>
                              {rvr.decision && (
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                  rvr.decision === 'approved' || rvr.decision === 'approved_with_comments' ? 'bg-emerald-400/10 text-emerald-400' :
                                  rvr.decision === 'changes_requested' ? 'bg-orange-400/10 text-orange-400' :
                                  rvr.decision === 'rejected' ? 'bg-red-400/10 text-red-400' :
                                  'bg-slate-400/10 text-slate-400'
                                }`}>
                                  {rvr.decision.replace(/_/g, ' ')}
                                </span>
                              )}
                              {rvr.decisionNote && (
                                <div className="hidden lg:block max-w-xs">
                                  <p className="text-xs text-slate-500 truncate" title={rvr.decisionNote}>{rvr.decisionNote.slice(0, 40)}...</p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <button className="px-3 py-1.5 bg-[#06B6D4]/10 text-[#06B6D4] rounded-lg text-sm font-medium border border-[#06B6D4]/20 cursor-pointer whitespace-nowrap">Desktop</button>
                    <button className="px-3 py-1.5 bg-white/[0.04] text-slate-400 rounded-lg text-sm font-medium border border-[rgba(255,255,255,0.06)] hover:text-white hover:border-[rgba(255,255,255,0.12)] transition-colors cursor-pointer whitespace-nowrap">Mobile</button>
                    <button className="px-3 py-1.5 bg-white/[0.04] text-slate-400 rounded-lg text-sm font-medium border border-[rgba(255,255,255,0.06)] hover:text-white hover:border-[rgba(255,255,255,0.12)] transition-colors cursor-pointer whitespace-nowrap">Plain Text</button>
                  </div>
                  <div className="bg-white rounded-xl border border-[rgba(255,255,255,0.06)] overflow-hidden shadow-lg">
                    <div className="bg-slate-100 p-6 space-y-4 min-h-[400px]">
                      <div className="bg-white rounded-lg shadow-sm p-4 max-w-md mx-auto">
                        <div className="text-[9px] text-slate-400 uppercase tracking-wider mb-2">From: Digital Footprint</div>
                        <div className="text-sm font-bold text-slate-800 mb-1">{review.subject}</div>
                        <div className="text-xs text-slate-500 mb-3">{review.previewText}</div>
                        <div className="h-2 w-3/4 bg-slate-200 rounded mb-2" />
                        <div className="h-2 w-full bg-slate-200 rounded mb-2" />
                        <div className="h-2 w-5/6 bg-slate-200 rounded mb-4" />
                        <div className="flex gap-2">
                          <div className="h-8 w-24 bg-[#06B6D4] rounded-md" />
                          <div className="h-8 w-24 bg-slate-200 rounded-md" />
                        </div>
                      </div>
                      <div className="text-center text-[10px] text-slate-400">Sandboxed email preview — interactive elements disabled</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {comments.map((c) => (
                      <div key={c.id} className="bg-white/[0.02] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{c.author}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${c.authorType === 'internal' ? 'bg-violet-400/10 text-violet-400' : 'bg-sky-400/10 text-sky-400'}`}>
                              {c.authorType === 'internal' ? 'Internal' : 'Reviewer'}
                            </span>
                            {c.visibility === 'internal_only' && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-red-400/10 text-red-400">Internal Only</span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500">{new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {c.sourceLocation && (
                          <div className="text-[11px] text-[#06B6D4] mb-2">{c.sourceLocation}</div>
                        )}
                        <p className="text-sm text-slate-300 leading-relaxed">{c.body}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                            c.status === 'open' ? 'bg-amber-400/10 text-amber-400' :
                            c.status === 'resolved' ? 'bg-emerald-400/10 text-emerald-400' :
                            'bg-slate-400/10 text-slate-400'
                          }`}>{c.status}</span>
                        </div>
                        {c.replies.length > 0 && (
                          <div className="mt-3 ml-6 space-y-2 border-l-2 border-[rgba(255,255,255,0.06)] pl-4">
                            {c.replies.map((r) => (
                              <div key={r.id} className="bg-white/[0.03] rounded-lg p-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-white">{r.author}</span>
                                  <span className="text-[10px] text-slate-500">{new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-xs text-slate-400">{r.body}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add an internal note..."
                      className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/30 resize-none h-10"
                      maxLength={500}
                    />
                    <button className="px-4 py-2 bg-[#06B6D4] text-white rounded-xl text-sm font-semibold hover:bg-[#0891B2] transition-all cursor-pointer whitespace-nowrap">
                      Add Note
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-3">
                  {[
                    { action: 'Decision submitted', detail: 'Tom Harris requested changes', time: '2026-07-21T16:10:00Z', color: 'text-orange-400' },
                    { action: 'Decision submitted', detail: 'Sarah Mitchell approved', time: '2026-07-21T14:30:00Z', color: 'text-emerald-400' },
                    { action: 'Review link viewed', detail: 'James Ng viewed the preview', time: '2026-07-20T11:00:00Z', color: 'text-sky-400' },
                    { action: 'Review link viewed', detail: 'Priya Shah viewed the preview', time: '2026-07-20T09:10:00Z', color: 'text-sky-400' },
                    { action: 'Invitations sent', detail: '5 reviewer invitations dispatched via email', time: '2026-07-19T08:00:00Z', color: 'text-violet-400' },
                    { action: 'Snapshot created', detail: 'Immutable snapshot v3.2.1 generated', time: '2026-07-18T10:30:00Z', color: 'text-slate-400' },
                    { action: 'Review created', detail: 'Q3 Welcome Campaign review package created', time: '2026-07-18T10:30:00Z', color: 'text-slate-400' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-white/[0.02] border border-[rgba(255,255,255,0.04)] rounded-xl">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.color}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">{item.action}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.detail}</p>
                      </div>
                      <span className="text-[11px] text-slate-500 shrink-0">{new Date(item.time).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                  <Link href="/admin/email/reviews/rev-1/activity" className="flex items-center gap-1.5 text-xs text-[#06B6D4] hover:text-[#22D3EE] transition-colors cursor-pointer">
                    View Full Activity Log <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Review Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Type</span>
                <span className="text-xs text-slate-300 capitalize">{review.reviewType.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Approval Policy</span>
                <span className="text-xs text-slate-300">{POLICY_LABELS[review.approvalPolicy] || review.approvalPolicy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Brand</span>
                <span className="text-xs text-slate-300">{review.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Language</span>
                <span className="text-xs text-slate-300">{review.language?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Source</span>
                <span className="text-xs text-slate-300">{review.sourceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Version</span>
                <span className="text-xs text-slate-300">{review.sourceVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Due Date</span>
                <span className="text-xs text-slate-300">{review.dueDate ? new Date(review.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Created</span>
                <span className="text-xs text-slate-300">{new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Owner</span>
                <span className="text-xs text-slate-300">{review.owner}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Decision Summary</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-emerald-400/[0.04] rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-slate-300">Approved</span>
                </div>
                <span className="text-sm font-bold text-emerald-400">{decisionCounts.approved}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-orange-400/[0.04] rounded-lg">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs text-slate-300">Changes Requested</span>
                </div>
                <span className="text-sm font-bold text-orange-400">{decisionCounts.changes}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-red-400/[0.04] rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-xs text-slate-300">Rejected</span>
                </div>
                <span className="text-sm font-bold text-red-400">{decisionCounts.rejected}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-400/[0.04] rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-300">Pending</span>
                </div>
                <span className="text-sm font-bold text-slate-400">{decisionCounts.pending}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${review.reviewers.length > 0 ? (decisionCounts.approved / review.reviewers.filter((r) => r.reviewerType === 'required').length) * 100 : 0}%` }} />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 text-center">{decisionCounts.approved} of {review.reviewers.filter((r) => r.reviewerType === 'required').length} required approvals</p>
            </div>
          </div>

          <div className="space-y-2">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#06B6D4] text-white rounded-xl font-semibold text-sm hover:bg-[#0891B2] transition-all cursor-pointer whitespace-nowrap">
              <Copy className="w-4 h-4" /> Copy Review Links
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] text-slate-300 rounded-xl font-semibold text-sm hover:bg-white/[0.08] transition-all cursor-pointer whitespace-nowrap">
              <Send className="w-4 h-4" /> Send Reminders
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-400/5 border border-red-400/10 text-red-400 rounded-xl font-semibold text-sm hover:bg-red-400/10 transition-all cursor-pointer whitespace-nowrap">
              <Ban className="w-4 h-4" /> Revoke All Links
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}