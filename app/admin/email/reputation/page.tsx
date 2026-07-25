'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Shield, Globe, UserCheck, Server, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle2, XCircle, Clock, RefreshCw,
  ArrowRight, Search, Filter, ExternalLink, Plus,
  Thermometer, Activity, Zap, BarChart3, Radio,
} from 'lucide-react';

const HEALTH_STATES: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  healthy: { label: 'Healthy', color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: CheckCircle2 },
  monitoring: { label: 'Monitoring', color: 'text-sky-400', bg: 'bg-sky-400/10', icon: Activity },
  warming: { label: 'Warming', color: 'text-amber-400', bg: 'bg-amber-400/10', icon: Thermometer },
  needs_attention: { label: 'Needs Attention', color: 'text-orange-400', bg: 'bg-orange-400/10', icon: AlertTriangle },
  degraded: { label: 'Degraded', color: 'text-red-400', bg: 'bg-red-400/10', icon: TrendingDown },
  paused: { label: 'Paused', color: 'text-slate-400', bg: 'bg-slate-400/10', icon: Clock },
  blocked: { label: 'Blocked', color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle },
  unknown: { label: 'Unknown', color: 'text-slate-500', bg: 'bg-slate-500/10', icon: Radio },
  not_configured: { label: 'Not Configured', color: 'text-slate-600', bg: 'bg-slate-600/10', icon: Clock },
};

const MOCK_ASSETS = [
  { id: '1', name: 'digital-footprint.uk', asset_type: 'sending_subdomain', brand: 'Digital Footprint', provider: 'Resend', health_state: 'healthy', delivery_rate: 99.2, bounce_rate: 0.3, complaint_rate: 0.02, daily_volume: 1240, authentication: { spf: true, dkim: true, dmarc: 'quarantine' } },
  { id: '2', name: 'mail.digital-footprint.uk', asset_type: 'return_path_domain', brand: 'Digital Footprint', provider: 'Resend', health_state: 'healthy', delivery_rate: 99.1, bounce_rate: 0.4, complaint_rate: 0.01, daily_volume: 1240 },
  { id: '3', name: 'notifications@digital-footprint.uk', asset_type: 'sender_profile', brand: 'Digital Footprint', provider: 'Resend', health_state: 'healthy', delivery_rate: 99.5, bounce_rate: 0.1, complaint_rate: 0.01, daily_volume: 890 },
  { id: '4', name: 'marketing@digital-footprint.uk', asset_type: 'sender_profile', brand: 'Digital Footprint', provider: 'Resend', health_state: 'warming', delivery_rate: 97.8, bounce_rate: 1.2, complaint_rate: 0.08, daily_volume: 340 },
  { id: '5', name: '192.168.1.100', asset_type: 'dedicated_ip', brand: 'Digital Footprint', provider: 'Resend', health_state: 'warming', delivery_rate: 96.5, bounce_rate: 1.8, complaint_rate: 0.12, daily_volume: 580 },
  { id: '6', name: 'track.digital-footprint.uk', asset_type: 'tracking_domain', brand: 'Digital Footprint', provider: 'Resend', health_state: 'healthy', delivery_rate: null as null, bounce_rate: null as null, complaint_rate: null as null, daily_volume: 0 },
  { id: '7', name: 'dfp-synqoro.co.uk', asset_type: 'sending_subdomain', brand: 'Synqoro', provider: 'Resend', health_state: 'needs_attention', delivery_rate: 94.2, bounce_rate: 3.1, complaint_rate: 0.25, daily_volume: 210 },
  { id: '8', name: 'support@dfp-synqoro.co.uk', asset_type: 'sender_profile', brand: 'Synqoro', provider: 'Resend', health_state: 'degraded', delivery_rate: 91.5, bounce_rate: 4.8, complaint_rate: 0.45, daily_volume: 95 },
];

const MOCK_INCIDENTS = [
  { id: 'inc-1', title: 'Elevated bounce rate on Synqoro domain', severity: 'sev-2', status: 'investigating', asset: 'dfp-synqoro.co.uk', detected: '2026-07-18T14:30:00Z' },
  { id: 'inc-2', title: 'Complaint spike — marketing sender', severity: 'sev-3', status: 'contained', asset: 'marketing@digital-footprint.uk', detected: '2026-07-17T09:15:00Z' },
  { id: 'inc-3', title: 'Blocklist listing detected', severity: 'sev-2', status: 'recovering', asset: '192.168.1.100', detected: '2026-07-16T22:00:00Z' },
];

const MOCK_WARMUP = [
  { id: 'wp-1', name: 'Marketing IP Warm-up Q3', asset: '192.168.1.100', status: 'active', stage: 2, total_stages: 5, daily_cap: 500, current_count: 342, start_date: '2026-07-10', target: 2000 },
  { id: 'wp-2', name: 'Synqoro Domain Warm-up', asset: 'dfp-synqoro.co.uk', status: 'paused', stage: 1, total_stages: 4, daily_cap: 100, current_count: 78, start_date: '2026-07-05', target: 800 },
];

const MOCK_BLOCKLIST = [
  { id: 'bl-1', blocklist_name: 'Spamhaus SBL', asset: '192.168.1.100', check_state: 'listed', listing_type: 'confirmed', first_detected: '2026-07-16T22:00:00Z', incident_id: 'inc-3' },
  { id: 'bl-2', blocklist_name: 'Barracuda', asset: 'dfp-synqoro.co.uk', check_state: 'clear', listing_type: null, first_detected: null },
  { id: 'bl-3', blocklist_name: 'SpamCop', asset: '192.168.1.100', check_state: 'clear', listing_type: null, first_detected: null },
  { id: 'bl-4', blocklist_name: 'SURBL', asset: 'digital-footprint.uk', check_state: 'clear', listing_type: null, first_detected: null },
];

const METRIC_CARDS = [
  { key: 'assets', icon: Shield, label: 'Reputation Assets', value: '8', sub: '2 needing attention', color: 'text-[#06B6D4]' },
  { key: 'delivery', icon: TrendingUp, label: 'Overall Delivery', value: '98.4%', sub: 'Last 30 days', color: 'text-emerald-400' },
  { key: 'warmup', icon: Thermometer, label: 'Active Warm-ups', value: '1', sub: '1 paused', color: 'text-amber-400' },
  { key: 'incidents', icon: AlertTriangle, label: 'Active Incidents', value: '3', sub: '1 SEV-2, 2 SEV-3', color: 'text-red-400' },
  { key: 'blocklist', icon: XCircle, label: 'Blocklist Listings', value: '1', sub: '1 confirmed', color: 'text-orange-400' },
  { key: 'auth', icon: CheckCircle2, label: 'Auth Status', value: 'SPF+DKIM+DMARC', sub: 'All domains passing', color: 'text-sky-400' },
];

export default function ReputationDashboard() {
  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState('all');
  const [assetFilter, setAssetFilter] = useState('all');

  const filtered = MOCK_ASSETS.filter((a) => {
    if (healthFilter !== 'all' && a.health_state !== healthFilter) return false;
    if (assetFilter !== 'all' && a.asset_type !== assetFilter) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const assetTypes = Array.from(new Set(MOCK_ASSETS.map((a) => a.asset_type)));

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-[#06B6D4]" />
          </div>
          <h1 className="text-xl font-bold text-white">Sender Reputation</h1>
        </div>
        <p className="text-sm text-slate-400 mt-1 ml-11">
          Monitor sending domains, sender profiles, IP reputation, warm-up progress and deliverability incidents.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {METRIC_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 hover:border-[rgba(255,255,255,0.1)] transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-[11px] text-slate-500 mt-1">{card.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
              <div>
                <h2 className="text-base font-bold text-white">Sender Asset Inventory</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Domains, senders, IPs and provider accounts — {filtered.length} of {MOCK_ASSETS.length} shown
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 w-36"
                  />
                </div>
                <select
                  value={assetFilter}
                  onChange={(e) => setAssetFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-lg text-xs text-slate-300 focus:outline-none pr-8 cursor-pointer"
                >
                  <option value="all">All Types</option>
                  {assetTypes.map((t) => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
                <select
                  value={healthFilter}
                  onChange={(e) => setHealthFilter(e.target.value)}
                  className="px-3 py-1.5 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-lg text-xs text-slate-300 focus:outline-none pr-8 cursor-pointer"
                >
                  <option value="all">All States</option>
                  {Object.entries(HEALTH_STATES).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.04)]">
                    <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Asset</th>
                    <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Brand</th>
                    <th className="text-left px-6 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Health</th>
                    <th className="text-right px-6 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Delivery</th>
                    <th className="text-right px-6 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Bounce</th>
                    <th className="text-right px-6 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Complaint</th>
                    <th className="text-right px-6 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Daily Vol</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((asset) => {
                    const health = HEALTH_STATES[asset.health_state] || HEALTH_STATES.unknown;
                    const HIcon = health.icon;
                    return (
                      <tr key={asset.id} className="border-b border-[rgba(255,255,255,0.02)] hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            {asset.asset_type.includes('domain') ? <Globe className="w-3.5 h-3.5 text-slate-500" /> : asset.asset_type.includes('sender') ? <UserCheck className="w-3.5 h-3.5 text-slate-500" /> : asset.asset_type.includes('ip') ? <Server className="w-3.5 h-3.5 text-slate-500" /> : <Shield className="w-3.5 h-3.5 text-slate-500" />}
                            <span className="text-sm text-white font-medium">{asset.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-xs text-slate-400 capitalize">{asset.asset_type.replace(/_/g, ' ')}</td>
                        <td className="px-6 py-3 text-xs text-slate-400">{asset.brand}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${health.bg} ${health.color}`}>
                            <HIcon className="w-3 h-3" />
                            {health.label}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right text-xs font-medium text-white">{asset.delivery_rate !== null ? `${asset.delivery_rate}%` : '—'}</td>
                        <td className="px-6 py-3 text-right text-xs">{asset.bounce_rate !== null ? <span className={asset.bounce_rate > 2 ? 'text-red-400' : 'text-slate-400'}>{asset.bounce_rate}%</span> : '—'}</td>
                        <td className="px-6 py-3 text-right text-xs">{asset.complaint_rate !== null ? <span className={asset.complaint_rate > 0.2 ? 'text-red-400' : 'text-slate-400'}>{asset.complaint_rate}%</span> : '—'}</td>
                        <td className="px-6 py-3 text-right text-xs text-slate-400">{asset.daily_volume.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
              <div>
                <h2 className="text-base font-bold text-white">Active Warm-up Plans</h2>
                <p className="text-xs text-slate-500 mt-0.5">Domain and IP warm-up progress</p>
              </div>
              <Link href="/admin/email/reputation/warm-up" className="text-xs text-[#06B6D4] hover:text-[#22D3EE] flex items-center gap-1 cursor-pointer whitespace-nowrap">
                Manage Plans <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {MOCK_WARMUP.map((wp) => (
                <div key={wp.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-[rgba(255,255,255,0.04)]">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-white">{wp.name}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${wp.status === 'active' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-slate-400/10 text-slate-400'}`}>
                        {wp.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{wp.asset} · Stage {wp.stage} of {wp.total_stages} · Target: {wp.target.toLocaleString()}/day</p>
                    <div className="mt-2 w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                      <div className="h-full bg-[#06B6D4] rounded-full transition-all" style={{ width: `${(wp.current_count / wp.daily_cap) * 100}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">{wp.current_count} / {wp.daily_cap} today</p>
                  </div>
                  <Link href="/admin/email/reputation/warm-up" className="text-xs text-[#06B6D4] hover:underline whitespace-nowrap cursor-pointer">View</Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
              <h2 className="text-base font-bold text-white">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              <Link href="/admin/email/reputation/domains" className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-[rgba(255,255,255,0.04)] text-sm text-slate-300 hover:text-white hover:border-[rgba(255,255,255,0.1)] transition-all cursor-pointer whitespace-nowrap">
                <Globe className="w-4 h-4 text-[#06B6D4]" /> Domain Inventory
              </Link>
              <Link href="/admin/email/reputation/senders" className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-[rgba(255,255,255,0.04)] text-sm text-slate-300 hover:text-white hover:border-[rgba(255,255,255,0.1)] transition-all cursor-pointer whitespace-nowrap">
                <UserCheck className="w-4 h-4 text-[#06B6D4]" /> Sender Profiles
              </Link>
              <Link href="/admin/email/reputation/warm-up" className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-[rgba(255,255,255,0.04)] text-sm text-slate-300 hover:text-white hover:border-[rgba(255,255,255,0.1)] transition-all cursor-pointer whitespace-nowrap">
                <Thermometer className="w-4 h-4 text-[#06B6D4]" /> Warm-up Plans
              </Link>
              <Link href="/admin/email/reputation/incidents" className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-[rgba(255,255,255,0.04)] text-sm text-slate-300 hover:text-white hover:border-[rgba(255,255,255,0.1)] transition-all cursor-pointer whitespace-nowrap">
                <AlertTriangle className="w-4 h-4 text-[#06B6D4]" /> Incidents
              </Link>
              <Link href="/admin/email/settings/reputation" className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-[rgba(255,255,255,0.04)] text-sm text-slate-300 hover:text-white hover:border-[rgba(255,255,255,0.1)] transition-all cursor-pointer whitespace-nowrap">
                <Shield className="w-4 h-4 text-[#06B6D4]" /> Reputation Settings
              </Link>
            </div>
          </div>

          <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
              <h2 className="text-base font-bold text-white">Active Incidents</h2>
            </div>
            <div className="p-4 space-y-3">
              {MOCK_INCIDENTS.map((inc) => {
                const sevClass = inc.severity === 'sev-1' ? 'bg-red-500/10 text-red-400 border-red-500/20' : inc.severity === 'sev-2' ? 'bg-orange-400/10 text-orange-400 border-orange-400/20' : 'bg-amber-400/10 text-amber-400 border-amber-400/20';
                return (
                  <Link key={inc.id} href="/admin/email/reputation/incidents" className="block p-3 rounded-xl bg-white/[0.02] border border-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)] transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${sevClass}`}>{inc.severity}</span>
                      <span className="text-[10px] text-slate-500">{new Date(inc.detected).toLocaleDateString('en-GB')}</span>
                    </div>
                    <p className="text-sm text-white font-medium">{inc.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-slate-500">{inc.asset}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${inc.status === 'investigating' ? 'bg-red-400/10 text-red-400' : inc.status === 'contained' ? 'bg-amber-400/10 text-amber-400' : 'bg-sky-400/10 text-sky-400'}`}>
                        {inc.status}
                      </span>
                    </div>
                  </Link>
                );
              })}
              <Link href="/admin/email/reputation/incidents" className="block text-center text-xs text-[#06B6D4] hover:underline py-1 cursor-pointer">
                View all incidents
              </Link>
            </div>
          </div>

          <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
              <h2 className="text-base font-bold text-white">Blocklist Status</h2>
            </div>
            <div className="p-4 space-y-3">
              {MOCK_BLOCKLIST.map((bl) => (
                <div key={bl.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]">
                  <div className="flex items-center gap-2 min-w-0">
                    {bl.check_state === 'listed' ? <XCircle className="w-4 h-4 text-red-400 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-xs text-white truncate">{bl.blocklist_name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{bl.asset}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-medium whitespace-nowrap ${bl.check_state === 'listed' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {bl.check_state === 'listed' ? 'Listed' : 'Clear'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}