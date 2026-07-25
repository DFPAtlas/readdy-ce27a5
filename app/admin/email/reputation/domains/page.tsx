'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Globe, ArrowLeft, CheckCircle2, XCircle, AlertTriangle,
  Clock, TrendingUp, TrendingDown, BarChart3, Shield,
  RefreshCw, ExternalLink, Search, Filter,
} from 'lucide-react';

const MOCK_DOMAINS = [
  {
    id: '1', name: 'digital-footprint.uk', type: 'sending_subdomain', brand: 'Digital Footprint',
    provider: 'Resend', state: 'healthy',
    spf: { present: true, record: 'v=spf1 include:spf.resend.com ~all', lookup_count: 3 },
    dkim: { selectors: ['resend'], verified: true },
    dmarc: { record: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@digital-footprint.uk', policy: 'quarantine', alignment: 'relaxed' },
    return_path_aligned: true, tracking_verified: true,
    delivery: { rate: 99.2, trend: 'stable', last_30_days: 37200, deferred: 45, rejected: 12 },
    health: { bounces: 0.3, complaints: 0.02, unsubscribes: 0.15 },
    warmup: null,
    last_checked: '2026-07-19T08:00:00Z',
  },
  {
    id: '2', name: 'dfp-synqoro.co.uk', type: 'sending_subdomain', brand: 'Synqoro',
    provider: 'Resend', state: 'needs_attention',
    spf: { present: true, record: 'v=spf1 include:spf.resend.com ~all', lookup_count: 3 },
    dkim: { selectors: ['resend'], verified: true },
    dmarc: { record: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@dfp-synqoro.co.uk', policy: 'quarantine', alignment: 'relaxed' },
    return_path_aligned: true, tracking_verified: true,
    delivery: { rate: 94.2, trend: 'declining', last_30_days: 6300, deferred: 120, rejected: 68 },
    health: { bounces: 3.1, complaints: 0.25, unsubscribes: 0.8 },
    warmup: null,
    last_checked: '2026-07-19T08:00:00Z',
  },
  {
    id: '3', name: 'mail.digital-footprint.uk', type: 'return_path_domain', brand: 'Digital Footprint',
    provider: 'Resend', state: 'healthy',
    spf: null, dkim: null, dmarc: null,
    return_path_aligned: true, tracking_verified: false,
    delivery: { rate: 99.1, trend: 'stable', last_30_days: 37200, deferred: 52, rejected: 15 },
    health: { bounces: 0.4, complaints: 0.01, unsubscribes: 0.15 },
    warmup: null,
    last_checked: '2026-07-19T08:00:00Z',
  },
  {
    id: '4', name: 'track.digital-footprint.uk', type: 'tracking_domain', brand: 'Digital Footprint',
    provider: 'Resend', state: 'healthy',
    spf: null, dkim: null, dmarc: null,
    return_path_aligned: false, tracking_verified: true,
    delivery: null,
    health: null,
    warmup: null,
    last_checked: '2026-07-19T08:00:00Z',
  },
];

const STATE_META: Record<string, { label: string; color: string; bg: string }> = {
  healthy: { label: 'Healthy', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  needs_attention: { label: 'Needs Attention', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  degraded: { label: 'Degraded', color: 'text-red-400', bg: 'bg-red-400/10' },
  warming: { label: 'Warming', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  paused: { label: 'Paused', color: 'text-slate-400', bg: 'bg-slate-400/10' },
  blocked: { label: 'Blocked', color: 'text-red-500', bg: 'bg-red-500/10' },
  not_configured: { label: 'Not Configured', color: 'text-slate-600', bg: 'bg-slate-600/10' },
};

export default function ReputationDomains() {
  const [selectedDomain, setSelectedDomain] = useState(MOCK_DOMAINS[0]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/email/reputation" className="w-8 h-8 flex items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] text-slate-400 hover:text-white hover:border-[rgba(255,255,255,0.15)] transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Domain Reputation</h1>
          <p className="text-xs text-slate-400 mt-0.5">Authentication monitoring, delivery signals and health per domain</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-2">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider px-1">Domains</p>
          {MOCK_DOMAINS.map((d) => {
            const meta = STATE_META[d.state] || STATE_META.not_configured;
            return (
              <button
                key={d.id}
                onClick={() => setSelectedDomain(d)}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedDomain.id === d.id
                    ? 'bg-[#06B6D4]/5 border-[#06B6D4]/20'
                    : 'bg-white/[0.02] border-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-sm font-medium text-white truncate">{d.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${meta.bg} ${meta.color}`}>{meta.label}</span>
                  <span className="text-[10px] text-slate-500 capitalize">{d.type.replace(/_/g, ' ')}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-3 space-y-6">
          {selectedDomain && (
            <>
              <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-5 h-5 text-[#06B6D4]" />
                      <h2 className="text-lg font-bold text-white">{selectedDomain.name}</h2>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${STATE_META[selectedDomain.state]?.bg} ${STATE_META[selectedDomain.state]?.color}`}>
                        {STATE_META[selectedDomain.state]?.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{selectedDomain.type.replace(/_/g, ' ')} · {selectedDomain.brand} · {selectedDomain.provider}</p>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Last checked: {new Date(selectedDomain.last_checked).toLocaleString('en-GB')}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.04)] rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">SPF Record</h3>
                    {selectedDomain.spf ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm text-white font-medium">Present</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono break-all mb-1">{selectedDomain.spf.record}</p>
                        <p className="text-[10px] text-slate-600">{selectedDomain.spf.lookup_count} DNS lookups</p>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500">Not applicable for this domain type</p>
                    )}
                  </div>

                  <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.04)] rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">DKIM</h3>
                    {selectedDomain.dkim ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm text-white font-medium">Verified</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Selectors: {selectedDomain.dkim.selectors.join(', ')}</p>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500">Not applicable</p>
                    )}
                  </div>

                  <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.04)] rounded-xl p-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">DMARC</h3>
                    {selectedDomain.dmarc ? (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm text-white font-medium">Policy: {selectedDomain.dmarc.policy}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono break-all">{selectedDomain.dmarc.record}</p>
                        <p className="text-[10px] text-slate-600 mt-1">Alignment: {selectedDomain.dmarc.alignment}</p>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500">Not applicable</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedDomain.delivery && (
                <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
                  <h2 className="text-sm font-bold text-white mb-4">Delivery Signals</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Delivery Rate</p>
                      <p className={`text-xl font-bold ${selectedDomain.delivery.rate >= 97 ? 'text-emerald-400' : selectedDomain.delivery.rate >= 94 ? 'text-amber-400' : 'text-red-400'}`}>
                        {selectedDomain.delivery.rate}%
                      </p>
                      <p className="text-[10px] text-slate-500 capitalize">{selectedDomain.delivery.trend}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Last 30 Days</p>
                      <p className="text-xl font-bold text-white">{selectedDomain.delivery.last_30_days.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500">emails</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Deferred</p>
                      <p className={`text-xl font-bold ${selectedDomain.delivery.deferred > 100 ? 'text-amber-400' : 'text-white'}`}>{selectedDomain.delivery.deferred}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Rejected</p>
                      <p className={`text-xl font-bold ${selectedDomain.delivery.rejected > 50 ? 'text-red-400' : 'text-white'}`}>{selectedDomain.delivery.rejected}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Alignments</p>
                      <div className="space-y-1 mt-1">
                        <div className="flex items-center gap-1.5">
                          {selectedDomain.return_path_aligned ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-red-400" />}
                          <span className="text-[10px] text-slate-400">Return-path</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {selectedDomain.tracking_verified ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-red-400" />}
                          <span className="text-[10px] text-slate-400">Tracking</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-[rgba(255,255,255,0.04)]">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Bounce Rate</p>
                      <p className={`text-lg font-bold ${selectedDomain.health && selectedDomain.health.bounces > 2 ? 'text-red-400' : 'text-white'}`}>
                        {selectedDomain.health ? `${selectedDomain.health.bounces}%` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Complaint Rate</p>
                      <p className={`text-lg font-bold ${selectedDomain.health && selectedDomain.health.complaints > 0.2 ? 'text-red-400' : 'text-white'}`}>
                        {selectedDomain.health ? `${selectedDomain.health.complaints}%` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Unsubscribe Rate</p>
                      <p className={`text-lg font-bold ${selectedDomain.health && selectedDomain.health.unsubscribes > 1 ? 'text-amber-400' : 'text-white'}`}>
                        {selectedDomain.health ? `${selectedDomain.health.unsubscribes}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
                <h2 className="text-sm font-bold text-white mb-3">Remediation Guidance</h2>
                <div className="space-y-2 text-xs text-slate-400">
                  {selectedDomain.state === 'needs_attention' && (
                    <>
                      <p className="flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>Bounce rate at {selectedDomain.health?.bounces}% exceeds the 2% warning threshold. Verify audience quality and remove invalid contacts.</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>Complaint rate at {selectedDomain.health?.complaints}% is elevated. Review content, sending frequency and list source.</span>
                      </p>
                    </>
                  )}
                  {selectedDomain.state === 'healthy' && (
                    <p className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>All signals within healthy ranges. Continue monitoring and maintain list hygiene.</span>
                    </p>
                  )}
                  <p className="flex items-start gap-2 mt-2">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>Verify SPF record includes <code className="text-slate-300 bg-white/[0.04] px-1 rounded text-[10px]">include:spf.resend.com</code>. DMARC policy set to quarantine or reject. DKIM selectors configured in provider dashboard.</span>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}