'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Webhook, Plus, Search, Shield, Clock, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Globe, Pause, Ban, Copy, ExternalLink } from 'lucide-react';

interface WebhookEndpoint {
  id: string; appName: string; appId: string; url: string; environment: string; eventTypes: string[]; signingSecretStatus: string; retryPolicy: string; status: string; owner: string; created: string; lastDelivery: string | null; failures24h: number;
}

const MOCK_WEBHOOKS: WebhookEndpoint[] = [
  { id: 'w1', appName: 'GuardianHub API', appId: '1', url: 'https://api.guardianhub.io/webhooks/email', environment: 'production', eventTypes: ['email.delivered','email.bounced','email.complained'], signingSecretStatus: 'active', retryPolicy: 'standard', status: 'active', owner: 'devops@digitalfootprint.uk', created: '2026-03-20', lastDelivery: '2026-07-20T10:45:00Z', failures24h: 0 },
  { id: 'w2', appName: 'Synqoro Integration', appId: '3', url: 'https://hooks.synqoro.io/email-studio', environment: 'production', eventTypes: ['campaign.completed','campaign.failed'], signingSecretStatus: 'active', retryPolicy: 'extended', status: 'active', owner: 'synqoro@digitalfootprint.uk', created: '2026-05-01', lastDelivery: '2026-07-20T09:30:00Z', failures24h: 1 },
  { id: 'w3', appName: 'Client Portal Sync', appId: '6', url: 'https://portal.digitalfootprint.uk/api/webhooks/email', environment: 'production', eventTypes: ['email.unsubscribed','email.complained'], signingSecretStatus: 'active', retryPolicy: 'standard', status: 'failed', owner: 'portal@digitalfootprint.uk', created: '2026-06-05', lastDelivery: '2026-07-19T18:00:00Z', failures24h: 12 },
  { id: 'w4', appName: 'n8n Automation Bridge', appId: '5', url: 'https://n8n.digitalfootprint.uk/webhook/email-events', environment: 'production', eventTypes: ['automation.execution_failed','template.approved'], signingSecretStatus: 'active', retryPolicy: 'standard', status: 'active', owner: 'automation@digitalfootprint.uk', created: '2026-05-15', lastDelivery: '2026-07-20T08:00:00Z', failures24h: 0 },
  { id: 'w5', appName: 'GuardianHub API Sandbox', appId: '2', url: 'https://sandbox.guardianhub.io/webhooks/email', environment: 'sandbox', eventTypes: ['email.delivered','email.bounced'], signingSecretStatus: 'pending', retryPolicy: 'standard', status: 'draft', owner: 'devops@digitalfootprint.uk', created: '2026-07-01', lastDelivery: null, failures24h: 0 },
  { id: 'w6', appName: 'Marketing Analytics Bridge', appId: '7', url: 'https://analytics.partner.com/webhooks/dfp', environment: 'sandbox', eventTypes: ['email.delivered','email.bounced','campaign.completed'], signingSecretStatus: 'pending', retryPolicy: 'standard', status: 'paused', owner: 'analytics-partner@example.com', created: '2026-06-20', lastDelivery: '2026-07-15T12:00:00Z', failures24h: 3 },
];

const STATUS_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: 'Active', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: CheckCircle2 },
  draft: { label: 'Draft', color: 'text-slate-400 bg-slate-400/10 border-slate-400/20', icon: Clock },
  paused: { label: 'Paused', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Pause },
  failed: { label: 'Failed', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: XCircle },
  revoked: { label: 'Revoked', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: Ban },
};

export default function DeveloperWebhooks() {
  const [webhooks] = useState<WebhookEndpoint[]>(MOCK_WEBHOOKS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookEndpoint | null>(null);

  const filtered = webhooks.filter((w) => {
    if (search && !w.url.toLowerCase().includes(search.toLowerCase()) && !w.appName.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && w.status !== statusFilter) return false;
    return true;
  });

  const statuses = ['all', ...new Set(webhooks.map((w) => w.status))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Webhooks</h1>
          <p className="text-sm text-slate-400 mt-1">Manage inbound and outbound webhook endpoints for event delivery and integration.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/email/developers" className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] text-slate-300 rounded-xl font-semibold text-sm hover:bg-white/[0.08] transition-all cursor-pointer whitespace-nowrap">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Endpoints', value: webhooks.length, color: 'text-[#06B6D4]' },
          { label: 'Active', value: webhooks.filter((w) => w.status === 'active').length, color: 'text-emerald-400' },
          { label: 'Failed (24h)', value: webhooks.filter((w) => w.status === 'failed').length, color: 'text-red-400' },
          { label: 'Signed', value: webhooks.filter((w) => w.signingSecretStatus === 'active').length, color: 'text-violet-400' },
          { label: 'Total Failures', value: webhooks.reduce((sum, w) => sum + w.failures24h, 0), color: 'text-amber-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
            <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search webhooks by URL or app..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/30" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 pr-8 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 cursor-pointer">
          {statuses.map((s) => <option key={s} value={s} className="bg-[#1a1a1e] text-white">{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filtered.map((w) => {
            const meta = STATUS_META[w.status] || STATUS_META.draft;
            const StatusIcon = meta.icon;
            const hasFailures = w.failures24h > 0;
            return (
              <div key={w.id} onClick={() => setSelectedWebhook(w)} className={`bg-[#121215] border rounded-2xl p-5 cursor-pointer transition-all ${selectedWebhook?.id === w.id ? 'border-[#06B6D4]/30' : hasFailures ? 'border-red-400/[0.15] hover:border-red-400/[0.3]' : 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Webhook className={`w-5 h-5 shrink-0 ${hasFailures ? 'text-red-400' : 'text-violet-400'}`} />
                    <div className="min-w-0">
                      <p className="text-sm text-white font-mono truncate">{w.url}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{w.appName} · {w.owner}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0 ml-2 ${meta.color}`}>
                    <StatusIcon className="w-2.5 h-2.5" />{meta.label}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{w.environment}</span>
                  <span className="flex items-center gap-1"><Shield className="w-3 h-3" />{w.signingSecretStatus === 'active' ? 'Signed' : 'Unsigned'}</span>
                  <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" />{w.retryPolicy} retry</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{w.lastDelivery ? new Date(w.lastDelivery).toLocaleString('en-GB') : 'No deliveries'}</span>
                  {w.failures24h > 0 && <span className="text-red-400 font-medium">{w.failures24h} failures (24h)</span>}
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {w.eventTypes.map((ev) => (
                    <span key={ev} className="px-2 py-0.5 rounded bg-violet-400/[0.08] border border-violet-400/[0.12] text-[10px] text-violet-300 font-mono">{ev}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          {selectedWebhook ? (
            <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Delivery Attempts</h3>
              {[
                { id: 'd1', status: 'delivered', code: 200, ms: 342, time: '2026-07-20T10:45:00Z' },
                { id: 'd2', status: 'delivered', code: 200, ms: 281, time: '2026-07-20T09:30:00Z' },
                { id: 'd3', status: 'failed', code: 502, ms: 15000, time: '2026-07-20T08:15:00Z', error: 'Bad Gateway' },
                { id: 'd4', status: 'retrying', code: null, ms: null, time: '2026-07-20T07:00:00Z', next: '2026-07-20T07:30:00Z' },
                { id: 'd5', status: 'delivered', code: 200, ms: 198, time: '2026-07-19T22:00:00Z' },
                { id: 'd6', status: 'replayed', code: 200, ms: 412, time: '2026-07-19T20:00:00Z' },
                { id: 'd7', status: 'delivered', code: 200, ms: 223, time: '2026-07-19T18:00:00Z' },
              ].map((del) => {
                const delStatusColors: Record<string, string> = {
                  delivered: 'text-emerald-400 bg-emerald-400/10', failed: 'text-red-400 bg-red-400/10',
                  retrying: 'text-amber-400 bg-amber-400/10', replayed: 'text-sky-400 bg-sky-400/10',
                };
                const sc = delStatusColors[del.status] || 'text-slate-400 bg-slate-400/10';
                return (
                  <div key={del.id} className="flex items-center justify-between py-2.5 border-b border-[rgba(255,255,255,0.04)] last:border-0 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${sc}`}>{del.status}</span>
                      {del.code && <span className="text-slate-500">{del.code}</span>}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      {del.ms && <span>{del.ms}ms</span>}
                      <span>{new Date(del.time).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                );
              })}
              <button className="w-full mt-4 py-2 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer">
                View All Deliveries
              </button>
            </div>
          ) : (
            <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 text-center">
              <Webhook className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400">Select a webhook to view delivery attempts</p>
            </div>
          )}

          <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
              <h3 className="text-sm font-bold text-white">Available Events</h3>
            </div>
            <div className="p-4 space-y-1.5">
              {['email.submitted','email.delivered','email.delayed','email.bounced','email.complained','email.unsubscribed','campaign.completed','campaign.failed','automation.execution_failed','template.approved','transactional.failed'].map((ev) => (
                <div key={ev} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 font-mono hover:bg-white/[0.02]">
                  <Webhook className="w-3 h-3 text-violet-400 shrink-0" />
                  {ev}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}