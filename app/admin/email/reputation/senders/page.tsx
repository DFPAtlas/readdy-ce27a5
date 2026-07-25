'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  UserCheck, ArrowLeft, CheckCircle2, XCircle, AlertTriangle,
  Clock, TrendingUp, TrendingDown, Shield, RefreshCw, Mail,
} from 'lucide-react';

const MOCK_SENDERS = [
  {
    id: '1', name: 'Digital Footprint', email: 'notifications@digital-footprint.uk', brand: 'Digital Footprint',
    provider: 'Resend', state: 'healthy', category: 'transactional',
    verification: { status: 'verified', verified_at: '2026-01-15T10:00:00Z' },
    delivery: { rate: 99.5, last_30_days: 26700, bounces: 0.1, complaints: 0.01, unsubscribes: 0.02, deferred: 18, rejected: 5 },
    last_used: '2026-07-19T09:00:00Z', active_campaigns: 3,
  },
  {
    id: '2', name: 'DFP Marketing', email: 'marketing@digital-footprint.uk', brand: 'Digital Footprint',
    provider: 'Resend', state: 'warming', category: 'marketing',
    verification: { status: 'verified', verified_at: '2026-06-20T14:00:00Z' },
    delivery: { rate: 97.8, last_30_days: 10200, bounces: 1.2, complaints: 0.08, unsubscribes: 0.35, deferred: 42, rejected: 18 },
    last_used: '2026-07-19T08:30:00Z', active_campaigns: 2,
  },
  {
    id: '3', name: 'Synqoro Support', email: 'support@dfp-synqoro.co.uk', brand: 'Synqoro',
    provider: 'Resend', state: 'degraded', category: 'transactional',
    verification: { status: 'verified', verified_at: '2026-03-10T09:00:00Z' },
    delivery: { rate: 91.5, last_30_days: 2850, bounces: 4.8, complaints: 0.45, unsubscribes: 1.2, deferred: 85, rejected: 42 },
    last_used: '2026-07-19T07:45:00Z', active_campaigns: 1,
  },
  {
    id: '4', name: 'QuickGuard Alerts', email: 'alerts@digital-footprint.uk', brand: 'QuickGuard',
    provider: 'Resend', state: 'healthy', category: 'transactional',
    verification: { status: 'verified', verified_at: '2026-02-01T11:00:00Z' },
    delivery: { rate: 99.7, last_30_days: 8900, bounces: 0.05, complaints: 0.01, unsubscribes: 0.01, deferred: 8, rejected: 2 },
    last_used: '2026-07-19T09:15:00Z', active_campaigns: 2,
  },
];

const STATE_META: Record<string, { label: string; color: string; bg: string }> = {
  healthy: { label: 'Healthy', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  warming: { label: 'Warming', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  needs_attention: { label: 'Needs Attention', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  degraded: { label: 'Degraded', color: 'text-red-400', bg: 'bg-red-400/10' },
  paused: { label: 'Paused', color: 'text-slate-400', bg: 'bg-slate-400/10' },
  blocked: { label: 'Blocked', color: 'text-red-500', bg: 'bg-red-500/10' },
};

const CATEGORY_META: Record<string, string> = {
  transactional: 'bg-sky-400/10 text-sky-400',
  marketing: 'bg-violet-400/10 text-violet-400',
  notification: 'bg-emerald-400/10 text-emerald-400',
};

export default function ReputationSenders() {
  const [selectedSender, setSelectedSender] = useState(MOCK_SENDERS[0]);
  const [confirmPause, setConfirmPause] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/email/reputation" className="w-8 h-8 flex items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] text-slate-400 hover:text-white hover:border-[rgba(255,255,255,0.15)] transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Sender Profile Reputation</h1>
          <p className="text-xs text-slate-400 mt-0.5">Delivery signals, health metrics and containment controls per sender</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-2">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider px-1">Sender Profiles</p>
          {MOCK_SENDERS.map((s) => {
            const meta = STATE_META[s.state] || STATE_META.not_configured;
            return (
              <button
                key={s.id}
                onClick={() => { setSelectedSender(s); setConfirmPause(false); }}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedSender.id === s.id
                    ? 'bg-[#06B6D4]/5 border-[#06B6D4]/20'
                    : 'bg-white/[0.02] border-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-sm font-medium text-white truncate">{s.name}</span>
                </div>
                <p className="text-[10px] text-slate-500 truncate mb-1.5">{s.email}</p>
                <div className="flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${meta.bg} ${meta.color}`}>{meta.label}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${CATEGORY_META[s.category] || ''}`}>{s.category}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <UserCheck className="w-5 h-5 text-[#06B6D4]" />
                  <h2 className="text-lg font-bold text-white">{selectedSender.name}</h2>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${STATE_META[selectedSender.state]?.bg} ${STATE_META[selectedSender.state]?.color}`}>
                    {STATE_META[selectedSender.state]?.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{selectedSender.email} · {selectedSender.brand} · {selectedSender.provider}</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedSender.state === 'degraded' && (
                  <button
                    onClick={() => setConfirmPause(!confirmPause)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {confirmPause ? 'Confirm Pause' : 'Pause Sender'}
                  </button>
                )}
                {selectedSender.state === 'warming' && (
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-400/10 border border-amber-400/20 text-amber-400 cursor-pointer whitespace-nowrap">
                    Adjust Warm-up
                  </button>
                )}
              </div>
            </div>

            {confirmPause && (
              <div className="mb-6 bg-red-500/5 border border-red-500/15 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-300 mb-2">Pause Sender Profile</p>
                    <p className="text-xs text-red-400/80 mb-3">
                      This will stop all new sends from this sender profile. Already-submitted messages cannot be recalled. This action creates an audit entry and requires a reason.
                    </p>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap">
                        Pause Sending
                      </button>
                      <button onClick={() => setConfirmPause(false)} className="px-4 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] border border-[rgba(255,255,255,0.08)] text-slate-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.04)] rounded-xl p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Delivery Rate</p>
                <p className={`text-xl font-bold ${selectedSender.delivery.rate >= 97 ? 'text-emerald-400' : selectedSender.delivery.rate >= 94 ? 'text-amber-400' : 'text-red-400'}`}>
                  {selectedSender.delivery.rate}%
                </p>
              </div>
              <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.04)] rounded-xl p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">30-Day Volume</p>
                <p className="text-xl font-bold text-white">{selectedSender.delivery.last_30_days.toLocaleString()}</p>
              </div>
              <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.04)] rounded-xl p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Bounce Rate</p>
                <p className={`text-xl font-bold ${selectedSender.delivery.bounces > 2 ? 'text-red-400' : 'text-white'}`}>
                  {selectedSender.delivery.bounces}%
                </p>
              </div>
              <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.04)] rounded-xl p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Complaint Rate</p>
                <p className={`text-xl font-bold ${selectedSender.delivery.complaints > 0.2 ? 'text-red-400' : 'text-white'}`}>
                  {selectedSender.delivery.complaints}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[rgba(255,255,255,0.04)]">
              <div>
                <p className="text-[10px] text-slate-500 mb-1">Deferred</p>
                <p className="text-sm font-medium text-white">{selectedSender.delivery.deferred}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 mb-1">Rejected</p>
                <p className="text-sm font-medium text-white">{selectedSender.delivery.rejected}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 mb-1">Unsubscribes</p>
                <p className="text-sm font-medium text-white">{selectedSender.delivery.unsubscribes}%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 mb-1">Active Campaigns</p>
                <p className="text-sm font-medium text-white">{selectedSender.active_campaigns}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white mb-3">Verification & Compliance</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-[rgba(255,255,255,0.04)]">
                <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Domain Verified</p>
                  <p className="text-[10px] text-slate-500">{selectedSender.verification.verified_at ? `Since ${new Date(selectedSender.verification.verified_at).toLocaleDateString('en-GB')}` : 'Not verified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-[rgba(255,255,255,0.04)]">
                <div className="w-8 h-8 rounded-lg bg-sky-400/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <p className="text-sm text-white font-medium">Last Used</p>
                  <p className="text-[10px] text-slate-500">{new Date(selectedSender.last_used).toLocaleString('en-GB')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}