'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  GitBranch, Search, ArrowRight, AlertTriangle, CheckCircle2,
  Package, Archive, Eye, ShieldCheck, Palette, Component, Layers,
  Unlink, RefreshCw, XCircle,
} from 'lucide-react';

type UpdateState = 'current' | 'update_available' | 'review_required' | 'compatible_update' | 'breaking_update' | 'deprecated' | 'missing_dependency' | 'detached' | 'update_blocked';
type UpdatePolicy = 'never' | 'notify_only' | 'auto_update_drafts_non_breaking' | 'require_review' | 'block_on_retired';
type LinkMode = 'detached' | 'linked';

interface Dependency {
  id: string;
  source_name: string;
  source_type: string;
  source_version: number;
  dependent_name: string;
  dependent_type: string;
  dependent_version: number;
  link_mode: LinkMode;
  update_state: UpdateState;
  update_policy: UpdatePolicy;
  latest_version: number;
  pinned_version: number | null;
}

const UPDATE_STATE_LABELS: Record<UpdateState, { label: string; icon: React.ElementType; color: string }> = {
  current: { label: 'Current', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-400/10' },
  update_available: { label: 'Update Available', icon: RefreshCw, color: 'text-sky-400 bg-sky-400/10' },
  review_required: { label: 'Review Required', icon: Eye, color: 'text-amber-400 bg-amber-400/10' },
  compatible_update: { label: 'Compatible Update', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-400/10' },
  breaking_update: { label: 'Breaking Update', icon: AlertTriangle, color: 'text-rose-400 bg-rose-400/10' },
  deprecated: { label: 'Deprecated', icon: Archive, color: 'text-amber-400 bg-amber-400/10' },
  missing_dependency: { label: 'Missing Dependency', icon: AlertTriangle, color: 'text-red-500 bg-red-500/10' },
  detached: { label: 'Detached', icon: Unlink, color: 'text-slate-400 bg-slate-500/10' },
  update_blocked: { label: 'Update Blocked', icon: ShieldCheck, color: 'text-orange-400 bg-orange-400/10' },
};

const POLICY_LABELS: Record<UpdatePolicy, string> = {
  never: 'Never Update',
  notify_only: 'Notify Only',
  auto_update_drafts_non_breaking: 'Auto-Update Drafts',
  require_review: 'Require Review',
  block_on_retired: 'Block on Retired',
};

const MOCK_DEPENDENCIES: Dependency[] = [
  { id: '1', source_name: 'color.primary', source_type: 'token', source_version: 2, dependent_name: 'Brand Header', dependent_type: 'component', dependent_version: 3, link_mode: 'linked', update_state: 'current', update_policy: 'auto_update_drafts_non_breaking', latest_version: 2, pinned_version: null },
  { id: '2', source_name: 'color.primary', source_type: 'token', source_version: 1, dependent_name: 'Monthly Newsletter', dependent_type: 'template', dependent_version: 5, link_mode: 'linked', update_state: 'compatible_update', update_policy: 'notify_only', latest_version: 2, pinned_version: null },
  { id: '3', source_name: 'button.radius', source_type: 'token', source_version: 1, dependent_name: 'Primary CTA', dependent_type: 'component', dependent_version: 4, link_mode: 'linked', update_state: 'current', update_policy: 'require_review', latest_version: 1, pinned_version: null },
  { id: '4', source_name: 'spacing.section', source_type: 'token', source_version: 1, dependent_name: 'Project Status Update', dependent_type: 'pattern', dependent_version: 3, link_mode: 'linked', update_state: 'breaking_update', update_policy: 'require_review', latest_version: 3, pinned_version: 1 },
  { id: '5', source_name: 'footer.legal', source_type: 'component', source_version: 4, dependent_name: 'All Campaign Templates', dependent_type: 'campaign', dependent_version: 0, link_mode: 'linked', update_state: 'compatible_update', update_policy: 'auto_update_drafts_non_breaking', latest_version: 5, pinned_version: null },
  { id: '6', source_name: 'color.primary.legacy', source_type: 'token', source_version: 1, dependent_name: 'Synqoro Welcome Template', dependent_type: 'template', dependent_version: 2, link_mode: 'linked', update_state: 'deprecated', update_policy: 'notify_only', latest_version: 1, pinned_version: null },
  { id: '7', source_name: 'header.brand', source_type: 'component', source_version: 3, dependent_name: 'New Client Welcome', dependent_type: 'pattern', dependent_version: 2, link_mode: 'linked', update_state: 'current', update_policy: 'auto_update_drafts_non_breaking', latest_version: 3, pinned_version: null },
  { id: '8', source_name: 'hero.full_width', source_type: 'component', source_version: 2, dependent_name: 'Product Announcement', dependent_type: 'pattern', dependent_version: 2, link_mode: 'detached', update_state: 'detached', update_policy: 'never', latest_version: 2, pinned_version: 2 },
  { id: '9', source_name: 'typography.body', source_type: 'token', source_version: 2, dependent_name: 'GuardianHub Brand Kit', dependent_type: 'brand_kit', dependent_version: 4, link_mode: 'linked', update_state: 'current', update_policy: 'notify_only', latest_version: 2, pinned_version: null },
  { id: '10', source_name: 'payment_card.default', source_type: 'component', source_version: 1, dependent_name: 'Payment Reminder', dependent_type: 'pattern', dependent_version: 1, link_mode: 'linked', update_state: 'review_required', update_policy: 'require_review', latest_version: 2, pinned_version: null },
  { id: '11', source_name: 'unsubscribe_block', source_type: 'component', source_version: 3, dependent_name: 'Transactional Mappings', dependent_type: 'transactional', dependent_version: 0, link_mode: 'linked', update_state: 'current', update_policy: 'block_on_retired', latest_version: 3, pinned_version: null },
  { id: '12', source_name: 'spacing.mobile.section', source_type: 'token', source_version: 1, dependent_name: 'Feature Card', dependent_type: 'component', dependent_version: 3, link_mode: 'detached', update_state: 'breaking_update', update_policy: 'never', latest_version: 3, pinned_version: 1 },
  { id: '13', source_name: 'color.accent', source_type: 'token', source_version: 2, dependent_name: 'GuardianHub Brand Kit', dependent_type: 'brand_kit', dependent_version: 4, link_mode: 'linked', update_state: 'review_required', update_policy: 'require_review', latest_version: 2, pinned_version: null },
  { id: '14', source_name: 'cta.primary', source_type: 'component', source_version: 4, dependent_name: 'New Client Welcome', dependent_type: 'pattern', dependent_version: 2, link_mode: 'linked', update_state: 'current', update_policy: 'auto_update_drafts_non_breaking', latest_version: 4, pinned_version: null },
];

export default function DesignSystemDependencies() {
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');

  const filtered = MOCK_DEPENDENCIES.filter((d) => {
    if (search && !d.source_name.toLowerCase().includes(search.toLowerCase()) && !d.dependent_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (stateFilter !== 'all' && d.update_state !== stateFilter) return false;
    return true;
  });

  const counts = {
    current: MOCK_DEPENDENCIES.filter((d) => d.update_state === 'current').length,
    outdated: MOCK_DEPENDENCIES.filter((d) => ['compatible_update', 'breaking_update', 'review_required'].includes(d.update_state)).length,
    deprecated: MOCK_DEPENDENCIES.filter((d) => d.update_state === 'deprecated').length,
    detached: MOCK_DEPENDENCIES.filter((d) => d.update_state === 'detached').length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dependency Tracking</h1>
          <p className="text-sm text-slate-400 mt-1.5 max-w-xl">
            Track relationships between tokens, components, patterns, brand kits, templates, campaigns and automations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Current</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{counts.current}</p>
          <p className="text-[11px] text-slate-500">Up to date</p>
        </div>
        <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Outdated</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{counts.outdated}</p>
          <p className="text-[11px] text-slate-500">Need attention</p>
        </div>
        <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Deprecated</span>
            <Archive className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{counts.deprecated}</p>
          <p className="text-[11px] text-slate-500">Replacement needed</p>
        </div>
        <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Detached</span>
            <Unlink className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-white mt-2">{counts.detached}</p>
          <p className="text-[11px] text-slate-500">Independent copies</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search by source or dependent name..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/30" />
        </div>
        <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="px-3 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 cursor-pointer pr-8">
          <option value="all">All States</option>
          {Object.entries(UPDATE_STATE_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Source</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Dependent</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Link Mode</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Version</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">State</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Policy</th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
              {filtered.map((d) => {
                const stateInfo = UPDATE_STATE_LABELS[d.update_state];
                const StateIcon = stateInfo.icon;
                const isProblem = ['breaking_update', 'deprecated', 'missing_dependency', 'review_required'].includes(d.update_state);

                return (
                  <tr key={d.id} className={`hover:bg-white/[0.02] transition-colors ${isProblem ? 'bg-red-500/[0.02]' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-[rgba(255,255,255,0.06)] flex items-center justify-center shrink-0">
                          {d.source_type === 'token' ? <Palette className="w-3.5 h-3.5 text-[#06B6D4]" /> : d.source_type === 'component' ? <Component className="w-3.5 h-3.5 text-emerald-400" /> : <Layers className="w-3.5 h-3.5 text-violet-400" />}
                        </div>
                        <div className="min-w-0">
                          <code className="text-xs text-[#06B6D4] font-mono">{d.source_name}</code>
                          <p className="text-[10px] text-slate-500">{d.source_type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-[rgba(255,255,255,0.06)] flex items-center justify-center shrink-0">
                          <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate max-w-[180px]">{d.dependent_name}</p>
                          <p className="text-[10px] text-slate-500 capitalize">{d.dependent_type.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${d.link_mode === 'linked' ? 'bg-sky-400/10 text-sky-400' : 'bg-slate-500/10 text-slate-400'}`}>
                        {d.link_mode}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-300">{d.source_version}</span>
                        {d.latest_version > d.source_version && (
                          <>
                            <ArrowRight className="w-3 h-3 text-slate-500" />
                            <span className="text-xs text-[#06B6D4] font-semibold">{d.latest_version}</span>
                          </>
                        )}
                        {d.pinned_version && (
                          <span className="text-[9px] text-amber-400 font-mono ml-1">pinned@v{d.pinned_version}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${stateInfo.color}`}>
                          <StateIcon className="w-3 h-3" />
                        </div>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${stateInfo.color.split(' ')[0]}`}>{stateInfo.label}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] text-slate-400">{POLICY_LABELS[d.update_policy]}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button className="w-7 h-7 rounded-lg bg-white/[0.04] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-slate-500 hover:text-white hover:border-[rgba(255,255,255,0.15)] transition-all cursor-pointer">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link href="/admin/email/design-system/tokens" className="flex items-center gap-3 px-4 py-3 bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-[#06B6D4]/30 transition-all cursor-pointer group">
          <Palette className="w-4 h-4 text-slate-500 group-hover:text-[#06B6D4] transition-colors" />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Tokens</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#06B6D4] ml-auto transition-colors" />
        </Link>
        <Link href="/admin/email/design-system/components" className="flex items-center gap-3 px-4 py-3 bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-[#06B6D4]/30 transition-all cursor-pointer group">
          <Component className="w-4 h-4 text-slate-500 group-hover:text-[#06B6D4] transition-colors" />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Components</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#06B6D4] ml-auto transition-colors" />
        </Link>
        <Link href="/admin/email/design-system/patterns" className="flex items-center gap-3 px-4 py-3 bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-[#06B6D4]/30 transition-all cursor-pointer group">
          <Layers className="w-4 h-4 text-slate-500 group-hover:text-[#06B6D4] transition-colors" />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Patterns</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#06B6D4] ml-auto transition-colors" />
        </Link>
        <Link href="/admin/email/design-system/releases" className="flex items-center gap-3 px-4 py-3 bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-[#06B6D4]/30 transition-all cursor-pointer group">
          <Package className="w-4 h-4 text-slate-500 group-hover:text-[#06B6D4] transition-colors" />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Releases</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#06B6D4] ml-auto transition-colors" />
        </Link>
      </div>
    </div>
  );
}