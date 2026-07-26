'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle, ArrowLeft, Shield, Clock, CheckCircle2,
  XCircle, TrendingDown, TrendingUp, BarChart3, Plus,
  Search, Filter, ExternalLink, Pause, Play, ChevronDown, Lock,
} from 'lucide-react';

const MOCK_INCIDENTS = [
  {
    id: 'inc-1', title: 'Elevated bounce rate on Synqoro domain', severity: 'sev-2', status: 'investigating',
    asset: 'dfp-synqoro.co.uk', asset_type: 'sending_subdomain', provider: 'Resend', brand: 'Synqoro',
    email_type: 'transactional', detection_source: 'Provider rejection spike',
    detection_time: '2026-07-18T14:30:00Z', owner: 'Marcus Webb',
    current: { delivery_rate: 91.5, bounce_rate: 4.8, complaints: 0.45, daily_volume: 95 },
    baseline: { delivery_rate: 98.5, bounce_rate: 0.8, complaints: 0.05, daily_volume: 120 },
    affected: { campaigns: 0, automations: 1, transactional: ['Synqoro password reset', 'Synqoro verification'] },
    estimated_impact: 2850,
    containment: [{ action: 'Paused Synqoro marketing campaigns', time: '2026-07-18T15:00:00Z', by: 'Marcus Webb' }],
    timeline: [
      { event: 'Incident detected (provider rejection spike)', time: '2026-07-18T14:30:00Z' },
      { event: 'Investigation started', time: '2026-07-18T14:45:00Z' },
      { event: 'Marketing sends paused', time: '2026-07-18T15:00:00Z' },
      { event: 'Audience audit initiated', time: '2026-07-18T16:00:00Z' },
    ],
  },
  {
    id: 'inc-2', title: 'Complaint spike — marketing sender', severity: 'sev-3', status: 'contained',
    asset: 'marketing@digital-footprint.uk', asset_type: 'sender_profile', provider: 'Resend', brand: 'Digital Footprint',
    email_type: 'marketing', detection_source: 'Guardrail threshold breach',
    detection_time: '2026-07-17T09:15:00Z', owner: 'Sarah Chen',
    current: { delivery_rate: 97.8, bounce_rate: 1.2, complaints: 0.35, daily_volume: 340 },
    baseline: { delivery_rate: 98.9, bounce_rate: 0.5, complaints: 0.03, daily_volume: 400 },
    affected: { campaigns: 2, automations: 0, transactional: [] },
    estimated_impact: 680,
    containment: [
      { action: 'Paused marketing campaigns', time: '2026-07-17T09:30:00Z', by: 'Sarah Chen' },
      { action: 'Content review completed', time: '2026-07-17T14:00:00Z', by: 'Sarah Chen' },
    ],
    timeline: [
      { event: 'Complaint threshold breached', time: '2026-07-17T09:15:00Z' },
      { event: 'Campaigns paused automatically', time: '2026-07-17T09:15:00Z' },
      { event: 'Content reviewed — frequency concern identified', time: '2026-07-17T14:00:00Z' },
      { event: 'Root cause: 3 campaigns sent within 48 hours', time: '2026-07-17T16:00:00Z' },
    ],
  },
  {
    id: 'inc-3', title: 'Blocklist listing — Spamhaus SBL', severity: 'sev-2', status: 'recovering',
    asset: '192.168.1.100', asset_type: 'dedicated_ip', provider: 'Resend', brand: 'Digital Footprint',
    email_type: 'marketing', detection_source: 'Blocklist monitoring',
    detection_time: '2026-07-16T22:00:00Z', owner: 'Sarah Chen',
    current: { delivery_rate: 85.2, bounce_rate: 3.5, complaints: 0.28, daily_volume: 50 },
    baseline: { delivery_rate: 96.5, bounce_rate: 1.8, complaints: 0.12, daily_volume: 580 },
    affected: { campaigns: 1, automations: 0, transactional: [] },
    estimated_impact: 580,
    containment: [
      { action: 'IP sending paused', time: '2026-07-16T22:30:00Z', by: 'Sarah Chen' },
      { action: 'Delisting request submitted', time: '2026-07-17T08:00:00Z', by: 'Sarah Chen' },
      { action: 'Audience list cleaned', time: '2026-07-17T12:00:00Z', by: 'Marcus Webb' },
    ],
    timeline: [
      { event: 'Spamhaus SBL listing detected', time: '2026-07-16T22:00:00Z' },
      { event: 'Sending paused immediately', time: '2026-07-16T22:30:00Z' },
      { event: 'Delisting request submitted', time: '2026-07-17T08:00:00Z' },
      { event: 'List de-listed, warming resumed', time: '2026-07-18T09:00:00Z' },
    ],
  },
  {
    id: 'inc-4', title: 'Webhook processing delay — 45min lag', severity: 'sev-3', status: 'resolved',
    asset: 'digital-footprint.uk', asset_type: 'sending_subdomain', provider: 'Resend', brand: 'Digital Footprint',
    email_type: 'all', detection_source: 'Operational health check',
    detection_time: '2026-07-15T20:00:00Z', owner: 'System',
    current: { delivery_rate: 99.2, event_lag: '45min' },
    baseline: { delivery_rate: 99.2, event_lag: '2min' },
    affected: { campaigns: 0, automations: 0, transactional: [] },
    estimated_impact: 0,
    containment: [],
    timeline: [
      { event: 'Webhook lag detected', time: '2026-07-15T20:00:00Z' },
      { event: 'Provider confirmed transient delay', time: '2026-07-15T21:30:00Z' },
      { event: 'Events caught up, no data loss', time: '2026-07-16T01:00:00Z' },
      { event: 'Resolved', time: '2026-07-16T09:00:00Z' },
    ],
  },
];

const SEVERITY_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  'sev-1': { label: 'SEV-1 — Critical', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  'sev-2': { label: 'SEV-2 — High', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  'sev-3': { label: 'SEV-3 — Medium', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
};

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: 'Open', color: 'text-red-400', bg: 'bg-red-400/10' },
  investigating: { label: 'Investigating', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  contained: { label: 'Contained', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  recovering: { label: 'Recovering', color: 'text-sky-400', bg: 'bg-sky-400/10' },
  resolved: { label: 'Resolved', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  closed: { label: 'Closed', color: 'text-slate-400', bg: 'bg-slate-400/10' },
};

export default function ReputationIncidents() {
  const [selectedIncident, setSelectedIncident] = useState(MOCK_INCIDENTS[0]);
  const [showContainmentPanel, setShowContainmentPanel] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/email/reputation" className="w-8 h-8 flex items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] text-slate-400 hover:text-white hover:border-[rgba(255,255,255,0.15)] transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Deliverability Incidents</h1>
            <p className="text-xs text-slate-400 mt-0.5">Incident detection, containment and recovery management</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] text-slate-300 rounded-xl font-semibold text-sm hover:bg-white/[0.08] transition-all cursor-pointer whitespace-nowrap">
          <Plus className="w-4 h-4" /> Report Incident
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['open', 'investigating', 'contained', 'recovering', 'resolved'] as const).map((status) => {
          const count = MOCK_INCIDENTS.filter((i) => i.status === status).length;
          const meta = STATUS_META[status];
          return (
            <div key={status} className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl p-3">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${meta.bg} ${meta.color}`}>{meta.label}</span>
              <p className="text-2xl font-bold text-white mt-1.5">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider px-1">Active & Recent Incidents</p>
          {MOCK_INCIDENTS.map((inc) => {
            const sev = SEVERITY_META[inc.severity];
            const status = STATUS_META[inc.status] || STATUS_META.open;
            return (
              <button
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedIncident.id === inc.id
                    ? 'bg-[#06B6D4]/5 border-[#06B6D4]/20'
                    : 'bg-white/[0.02] border-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)]'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${sev.border} ${sev.bg} ${sev.color}`}>{inc.severity}</span>
                  <span className="text-[10px] text-slate-500">{new Date(inc.detection_time).toLocaleDateString('en-GB')}</span>
                </div>
                <p className="text-sm text-white font-medium">{inc.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-slate-500">{inc.asset}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${status.bg} ${status.color}`}>{status.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${SEVERITY_META[selectedIncident.severity]?.bg} border ${SEVERITY_META[selectedIncident.severity]?.border}`} />
                  <span className={`text-xs font-bold uppercase ${SEVERITY_META[selectedIncident.severity]?.color}`}>{SEVERITY_META[selectedIncident.severity]?.label}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${STATUS_META[selectedIncident.status]?.bg} ${STATUS_META[selectedIncident.status]?.color}`}>
                    {STATUS_META[selectedIncident.status]?.label}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">{selectedIncident.title}</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Detected: {new Date(selectedIncident.detection_time).toLocaleString('en-GB')} · {selectedIncident.detection_source} · Owner: {selectedIncident.owner}
                </p>
              </div>
              {selectedIncident.status !== 'resolved' && selectedIncident.status !== 'closed' && (
                <div className="flex items-center gap-2">
                  {selectedIncident.status === 'investigating' && (
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-400/10 border border-amber-400/20 text-amber-400 hover:bg-amber-400/20 transition-colors cursor-pointer whitespace-nowrap">
                      Escalate
                    </button>
                  )}
                  <button
                    onClick={() => setShowContainmentPanel(!showContainmentPanel)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Containment
                  </button>
                </div>
              )}
            </div>

            {showContainmentPanel && (
              <div className="mb-6 bg-red-500/5 border border-red-500/15 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-300 mb-3">Containment Controls</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer whitespace-nowrap">
                    <Pause className="w-3.5 h-3.5" /> Pause Sender Profile
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer whitespace-nowrap">
                    <Lock className="w-3.5 h-3.5" /> Pause Domain Sending
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer whitespace-nowrap">
                    <XCircle className="w-3.5 h-3.5" /> Cancel Unsent Batches
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer whitespace-nowrap">
                    <Shield className="w-3.5 h-3.5" /> Activate Kill Switch
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.04)] rounded-xl p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Current Delivery</p>
                <p className={`text-lg font-bold ${selectedIncident.current.delivery_rate && selectedIncident.current.delivery_rate < 95 ? 'text-red-400' : 'text-white'}`}>
                  {selectedIncident.current.delivery_rate}%
                </p>
                <p className="text-[10px] text-slate-500">Baseline: {selectedIncident.baseline.delivery_rate}%</p>
              </div>
              <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.04)] rounded-xl p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Bounce Rate</p>
                <p className={`text-lg font-bold ${selectedIncident.current.bounce_rate && selectedIncident.current.bounce_rate > 2 ? 'text-red-400' : 'text-white'}`}>
                  {selectedIncident.current.bounce_rate}%
                </p>
                <p className="text-[10px] text-slate-500">Baseline: {selectedIncident.baseline.bounce_rate}%</p>
              </div>
              <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.04)] rounded-xl p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Complaints</p>
                <p className={`text-lg font-bold ${selectedIncident.current.complaints && selectedIncident.current.complaints > 0.2 ? 'text-red-400' : 'text-white'}`}>
                  {selectedIncident.current.complaints}%
                </p>
                <p className="text-[10px] text-slate-500">Baseline: {selectedIncident.baseline.complaints}%</p>
              </div>
              <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.04)] rounded-xl p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Est. Impact</p>
                <p className="text-lg font-bold text-white">{selectedIncident.estimated_impact.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500">recipients</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Affected</h3>
                <div className="space-y-1.5">
                  <p className="text-xs text-slate-300">
                    Campaigns: {selectedIncident.affected.campaigns} · Automations: {selectedIncident.affected.automations} · Transactional: {selectedIncident.affected.transactional.length}
                  </p>
                  <p className="text-xs text-slate-500">Asset: {selectedIncident.asset} · {selectedIncident.provider} · {selectedIncident.brand}</p>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Containment Actions</h3>
                {selectedIncident.containment.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedIncident.containment.map((c, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <p className="text-xs text-slate-400">{c.action} — <span className="text-slate-500">{new Date(c.time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} by {c.by}</span></p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No containment actions taken</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-3">Incident Timeline</h3>
            <div className="space-y-3">
              {selectedIncident.timeline.map((t, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${i === 0 ? 'bg-red-400' : i === selectedIncident.timeline.length - 1 ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  <div>
                    <p className="text-xs text-slate-300">{t.event}</p>
                    <p className="text-[10px] text-slate-500">{new Date(t.time).toLocaleString('en-GB')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedIncident.status !== 'resolved' && selectedIncident.status !== 'closed' && (
            <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-3">Recovery Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button className="px-4 py-2.5 rounded-lg text-xs font-medium bg-white/[0.04] border border-[rgba(255,255,255,0.08)] text-slate-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
                  Record Root Cause
                </button>
                <button className="px-4 py-2.5 rounded-lg text-xs font-medium bg-white/[0.04] border border-[rgba(255,255,255,0.08)] text-slate-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
                  Submit Recovery Plan
                </button>
                <button className="px-4 py-2.5 rounded-lg text-xs font-medium bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/20 transition-colors cursor-pointer whitespace-nowrap">
                  Resolve Incident
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}