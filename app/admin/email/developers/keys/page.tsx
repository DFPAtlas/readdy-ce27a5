'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Key, Shield, Copy, Search, Plus, RefreshCw, X, Clock, CheckCircle2, AlertTriangle, Ban, Globe } from 'lucide-react';

interface IntegrationKey {
  id: string; appName: string; appId: string; environment: string; displayName: string; keyPrefix: string; scopes: string[]; status: string; created: string; lastUsed: string; expires: string;
}

const MOCK_KEYS: IntegrationKey[] = [
  { id: 'k1', appName: 'GuardianHub API', appId: '1', environment: 'production', displayName: 'Template & Campaign Key', keyPrefix: 'dfp_gapi_prod_', scopes: ['templates.read','campaigns.create_draft'], status: 'active', created: '2026-03-15', lastUsed: '2026-07-20T10:45:00Z', expires: '2027-03-15' },
  { id: 'k2', appName: 'GuardianHub API', appId: '1', environment: 'production', displayName: 'Schedule Key', keyPrefix: 'dfp_gapi_prod_sch_', scopes: ['campaigns.schedule'], status: 'active', created: '2026-04-01', lastUsed: '2026-07-19T16:30:00Z', expires: '2027-04-01' },
  { id: 'k3', appName: 'GuardianHub API Sandbox', appId: '2', environment: 'sandbox', displayName: 'Sandbox Dev Key', keyPrefix: 'dfp_gapi_sand_', scopes: ['templates.read','sandbox.*'], status: 'active', created: '2026-03-15', lastUsed: '2026-07-20T09:00:00Z', expires: '2026-09-15' },
  { id: 'k4', appName: 'Synqoro Integration', appId: '3', environment: 'production', displayName: 'Marketing Bridge', keyPrefix: 'dfp_synq_prod_', scopes: ['campaigns.create_draft','campaigns.schedule','analytics.delivery.read'], status: 'active', created: '2026-04-20', lastUsed: '2026-07-20T08:15:00Z', expires: '2027-04-20' },
  { id: 'k5', appName: 'QuickGuard Notifications', appId: '4', environment: 'production', displayName: 'Transactional Send', keyPrefix: 'dfp_qg_prod_', scopes: ['transactional.send','templates.read'], status: 'active', created: '2026-05-01', lastUsed: '2026-07-20T10:30:00Z', expires: '2027-05-01' },
  { id: 'k6', appName: 'n8n Automation Bridge', appId: '5', environment: 'production', displayName: 'n8n Workflow Key', keyPrefix: 'dfp_n8n_prod_', scopes: ['automations.trigger','campaigns.read'], status: 'active', created: '2026-05-10', lastUsed: '2026-07-19T22:00:00Z', expires: '2027-05-10' },
  { id: 'k7', appName: 'Deprecated CRM Bridge', appId: '8', environment: 'production', displayName: 'CRM Sync Key', keyPrefix: 'dfp_crm_prod_', scopes: ['contacts.read_masked'], status: 'revoked', created: '2026-01-10', lastUsed: '2026-06-01T12:00:00Z', expires: '2027-01-10' },
  { id: 'k8', appName: 'QuickGuard Notifications', appId: '4', environment: 'sandbox', displayName: 'QuickGuard Sandbox', keyPrefix: 'dfp_qg_sand_', scopes: ['transactional.send','sandbox.*'], status: 'expiring', created: '2026-07-01', lastUsed: '2026-07-18T14:00:00Z', expires: '2026-07-23' },
  { id: 'k9', appName: 'Client Portal Sync', appId: '6', environment: 'production', displayName: 'Portal Sync Key', keyPrefix: 'dfp_portal_', scopes: ['contacts.read_masked','contacts.preferences.update'], status: 'rotating', created: '2026-07-15', lastUsed: '2026-07-20T07:00:00Z', expires: '2027-07-15' },
];

const STATUS_META: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: 'Active', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: CheckCircle2 },
  expiring: { label: 'Expiring', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Clock },
  expired: { label: 'Expired', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: X },
  rotating: { label: 'Rotating', color: 'text-sky-400 bg-sky-400/10 border-sky-400/20', icon: RefreshCw },
  suspended: { label: 'Suspended', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20', icon: AlertTriangle },
  revoked: { label: 'Revoked', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: Ban },
};

export default function DeveloperKeys() {
  const [keys] = useState<IntegrationKey[]>(MOCK_KEYS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [newSecret, setNewSecret] = useState('');

  const filtered = keys.filter((k) => {
    if (search && !k.displayName.toLowerCase().includes(search.toLowerCase()) && !k.appName.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && k.status !== statusFilter) return false;
    return true;
  });

  const statuses = ['all', ...new Set(keys.map((k) => k.status))];

  const handleGenerateKey = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let secret = 'dfp_sk_';
    for (let i = 0; i < 48; i++) secret += chars[Math.floor(Math.random() * chars.length)];
    setNewSecret(secret);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Integration Keys</h1>
          <p className="text-sm text-slate-400 mt-1">Manage secure server-to-server API keys across applications and environments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/email/developers" className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] text-slate-300 rounded-xl font-semibold text-sm hover:bg-white/[0.08] transition-all cursor-pointer whitespace-nowrap">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back
          </Link>
          <button onClick={handleGenerateKey} className="flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] text-white rounded-xl font-semibold text-sm hover:bg-[#0891B2] transition-all cursor-pointer whitespace-nowrap">
            <Plus className="w-4 h-4" /> Generate Key
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Keys', value: keys.length, color: 'text-[#06B6D4]' },
          { label: 'Active', value: keys.filter((k) => k.status === 'active').length, color: 'text-emerald-400' },
          { label: 'Expiring Soon', value: keys.filter((k) => k.status === 'expiring').length, color: 'text-amber-400' },
          { label: 'Revoked', value: keys.filter((k) => k.status === 'revoked').length, color: 'text-red-400' },
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
          <input type="text" placeholder="Search keys or applications..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/30" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 pr-8 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 cursor-pointer">
          {statuses.map((s) => <option key={s} value={s} className="bg-[#1a1a1e] text-white">{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                <th className="text-left px-6 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">Key</th>
                <th className="text-left px-6 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">Application</th>
                <th className="text-left px-6 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">Environment</th>
                <th className="text-left px-6 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">Scopes</th>
                <th className="text-left px-6 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">Last Used</th>
                <th className="text-left px-6 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">Expires</th>
                <th className="text-right px-6 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((key) => {
                const meta = STATUS_META[key.status] || STATUS_META.active;
                const StatusIcon = meta.icon;
                return (
                  <tr key={key.id} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-slate-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium truncate">{key.displayName}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <code className="text-[11px] text-slate-500 font-mono">{key.keyPrefix}••••••••••••</code>
                            <button className="text-slate-600 hover:text-slate-400 cursor-pointer"><Copy className="w-3 h-3" /></button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <Link href={`/admin/email/developers/apps/${key.appId}`} className="text-sm text-[#06B6D4] hover:underline cursor-pointer whitespace-nowrap">{key.appName}</Link>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <Globe className="w-3 h-3" /> {key.environment}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {key.scopes.slice(0, 2).map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-white/[0.04] text-[10px] text-slate-400 font-mono whitespace-nowrap">{s}</span>
                        ))}
                        {key.scopes.length > 2 && <span className="text-[10px] text-slate-600">+{key.scopes.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${meta.color}`}>
                        <StatusIcon className="w-2.5 h-2.5" /> {meta.label}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">{new Date(key.lastUsed).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">{key.expires}</td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="px-2 py-1 text-[10px] text-slate-400 hover:text-white hover:bg-white/[0.04] rounded-lg cursor-pointer whitespace-nowrap" title="Rotate"><RefreshCw className="w-3.5 h-3.5" /></button>
                        <button className="px-2 py-1 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg cursor-pointer whitespace-nowrap" title="Revoke"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-[#1a1a1e] border border-[rgba(255,255,255,0.1)] rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
                <Key className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">New Key Generated</h3>
                <p className="text-xs text-amber-400">Copy now — this secret is shown only once</p>
              </div>
            </div>
            <div className="bg-black/40 border border-[rgba(255,255,255,0.08)] rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <code className="text-xs text-emerald-300 font-mono break-all">{newSecret}</code>
                <button onClick={() => navigator.clipboard?.writeText(newSecret)} className="ml-2 p-1.5 text-slate-400 hover:text-white cursor-pointer shrink-0"><Copy className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="bg-amber-400/5 border border-amber-400/15 rounded-xl p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-300">Store this key securely. It will not be displayed again. If lost, you must generate a new key.</p>
              </div>
            </div>
            <button onClick={() => setShowModal(false)} className="w-full py-2.5 bg-[#06B6D4] text-white rounded-xl text-sm font-semibold hover:bg-[#0891B2] transition-all cursor-pointer">
              I&apos;ve copied the key
            </button>
          </div>
        </div>
      )}
    </div>
  );
}