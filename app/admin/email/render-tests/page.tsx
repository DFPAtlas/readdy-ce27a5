'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Monitor, CheckCircle2, AlertTriangle, XCircle, Clock,
  Play, Eye, Plus, Search, Filter, ChevronDown, ArrowRight,
  Sparkles, Zap, Image, ShieldCheck,
} from 'lucide-react';

const PRESET_LABELS: Record<string, string> = {
  quick: 'Quick Check',
  core: 'Core Clients',
  full: 'Full Compatibility',
  mobile: 'Mobile Only',
  outlook: 'Outlook Focus',
  dark_mode: 'Dark Mode',
  images_blocked: 'Images Blocked',
  custom: 'Custom Matrix',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  waiting: { label: 'Waiting', color: 'text-slate-400', bg: 'bg-slate-400/10', icon: Clock },
  running: { label: 'Running', color: 'text-sky-400', bg: 'bg-sky-400/10', icon: Zap },
  needs_review: { label: 'Needs Review', color: 'text-amber-400', bg: 'bg-amber-400/10', icon: AlertTriangle },
  passed: { label: 'Passed', color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: CheckCircle2 },
  passed_warnings: { label: 'Passed (Warnings)', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: AlertTriangle },
  failed: { label: 'Failed', color: 'text-red-400', bg: 'bg-red-400/10', icon: XCircle },
  accepted_exception: { label: 'Accepted Exception', color: 'text-violet-400', bg: 'bg-violet-400/10', icon: ShieldCheck },
  cancelled: { label: 'Cancelled', color: 'text-slate-500', bg: 'bg-slate-500/10', icon: XCircle },
  expired: { label: 'Expired', color: 'text-slate-500', bg: 'bg-slate-500/10', icon: Clock },
};

const MOCK_TESTS = [
  { id: '1', name: 'Welcome Template - Core Check', source_type: 'template', source_name: 'Welcome Email v3', status: 'passed', preset: 'core', client_count: 8, passed_count: 8, failed_count: 0, warning_count: 0, created_at: '2026-07-18T14:30:00Z', language: 'en' },
  { id: '2', name: 'Monthly Newsletter - Full Matrix', source_type: 'campaign', source_name: 'July Newsletter', status: 'needs_review', preset: 'full', client_count: 16, passed_count: 12, failed_count: 1, warning_count: 3, created_at: '2026-07-18T10:15:00Z', language: 'en' },
  { id: '3', name: 'Invoice Reminder - Quick', source_type: 'transactional', source_name: 'Invoice Due Reminder', status: 'passed_warnings', preset: 'quick', client_count: 4, passed_count: 3, failed_count: 0, warning_count: 1, created_at: '2026-07-17T16:45:00Z', language: 'en' },
  { id: '4', name: 'Welcome DE - Core Clients', source_type: 'template', source_name: 'Willkommen Email v2', status: 'running', preset: 'core', client_count: 8, passed_count: 0, failed_count: 0, warning_count: 0, created_at: '2026-07-19T09:00:00Z', language: 'de' },
  { id: '5', name: 'Dark Mode Audit - All Newsletters', source_type: 'template', source_name: 'Newsletter Base', status: 'failed', preset: 'dark_mode', client_count: 6, passed_count: 2, failed_count: 4, warning_count: 0, created_at: '2026-07-16T11:20:00Z', language: 'en' },
  { id: '6', name: 'Outlook Desktop Focus', source_type: 'campaign', source_name: 'Q3 Promo', status: 'passed', preset: 'outlook', client_count: 5, passed_count: 5, failed_count: 0, warning_count: 0, created_at: '2026-07-15T08:00:00Z', language: 'en' },
  { id: '7', name: 'Arabic RTL - Full Check', source_type: 'template', source_name: 'Welcome AR', status: 'needs_review', preset: 'full', client_count: 16, passed_count: 10, failed_count: 2, warning_count: 4, created_at: '2026-07-15T13:10:00Z', language: 'ar' },
  { id: '8', name: 'Images Blocked Test', source_type: 'template', source_name: 'Brand Header v1', status: 'passed', preset: 'images_blocked', client_count: 4, passed_count: 4, failed_count: 0, warning_count: 0, created_at: '2026-07-14T17:30:00Z', language: 'en' },
];

const STAT_CARDS = [
  { key: 'waiting', label: 'Waiting', icon: Clock, color: 'text-slate-400', bg: 'bg-slate-400/10', count: 1 },
  { key: 'running', label: 'Running', icon: Zap, color: 'text-sky-400', bg: 'bg-sky-400/10', count: 1 },
  { key: 'passed', label: 'Passed', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', count: 3 },
  { key: 'warnings', label: 'With Warnings', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10', count: 1 },
  { key: 'failed', label: 'Failed', icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/10', count: 1 },
  { key: 'regressions', label: 'Recent Regressions', icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-400/10', count: 2 },
];

const SOURCE_TYPE_LABELS: Record<string, string> = {
  template: 'Template',
  campaign: 'Campaign',
  automation: 'Automation',
  transactional: 'Transactional',
  brand: 'Brand Kit',
  plain_text: 'Plain Text',
};

export default function RenderTestsDashboard() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  const filtered = MOCK_TESTS.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (sourceFilter !== 'all' && t.source_type !== sourceFilter) return false;
    if (searchQuery && !t.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-violet-400/10 flex items-center justify-center">
              <Monitor className="w-4 h-4 text-violet-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Render Tests</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1 ml-11">
            Email-client previews, visual regression, compatibility diagnostics and rendering health.
          </p>
        </div>
        <Link
          href="/admin/email/render-tests/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-500 text-white rounded-xl font-semibold text-sm hover:bg-violet-600 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          New Render Test
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{card.label}</span>
                <div className={`w-7 h-7 rounded-lg ${card.bg} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{card.count}</p>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search render tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 cursor-pointer pr-8"
        >
          <option value="all">All Statuses</option>
          <option value="waiting">Waiting</option>
          <option value="running">Running</option>
          <option value="needs_review">Needs Review</option>
          <option value="passed">Passed</option>
          <option value="passed_warnings">Passed (Warnings)</option>
          <option value="failed">Failed</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-4 py-2.5 bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 cursor-pointer pr-8"
        >
          <option value="all">All Sources</option>
          <option value="template">Templates</option>
          <option value="campaign">Campaigns</option>
          <option value="automation">Automations</option>
          <option value="transactional">Transactional</option>
        </select>
      </div>

      <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                <th className="text-left px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Test</th>
                <th className="text-left px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Source</th>
                <th className="text-left px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Preset</th>
                <th className="text-left px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Clients</th>
                <th className="text-left px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Language</th>
                <th className="text-left px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-right px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((test) => {
                const st = STATUS_CONFIG[test.status];
                const StatusIcon = st.icon;
                return (
                  <tr key={test.id} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <Link href={`/admin/email/render-tests/${test.id}`} className="text-sm font-medium text-white hover:text-violet-400 transition-colors cursor-pointer">
                        {test.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-400">{SOURCE_TYPE_LABELS[test.source_type]}</span>
                      <span className="text-xs text-slate-500 ml-1">— {test.source_name}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-400">{PRESET_LABELS[test.preset] || test.preset}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium">{test.passed_count}/{test.client_count}</span>
                        {test.failed_count > 0 && <span className="text-xs text-red-400">{test.failed_count} failed</span>}
                        {test.warning_count > 0 && <span className="text-xs text-amber-400">{test.warning_count} warn</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-400 uppercase">{test.language || 'en'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold ${st.color} ${st.bg}`}>
                        <StatusIcon className="w-3 h-3" />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-400">
                        {new Date(test.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/email/render-tests/${test.id}`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer"
                          title="View Results"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {test.status === 'waiting' && (
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-sky-400 hover:text-white hover:bg-sky-400/10 transition-all cursor-pointer" title="Start Test">
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Monitor className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No render tests found</p>
            <p className="text-xs text-slate-500 mt-1">Create your first render test to check email-client compatibility</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Link href="/admin/email/compatibility" className="flex items-center gap-3 px-4 py-3 bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-violet-400/30 transition-all cursor-pointer group">
          <Sparkles className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Compatibility Diagnostics</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-violet-400 ml-auto transition-colors" />
        </Link>
        <Link href="/admin/email/visual-regression" className="flex items-center gap-3 px-4 py-3 bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-violet-400/30 transition-all cursor-pointer group">
          <Image className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Visual Regression</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-violet-400 ml-auto transition-colors" />
        </Link>
        <Link href="/admin/email/settings/rendering" className="flex items-center gap-3 px-4 py-3 bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-violet-400/30 transition-all cursor-pointer group">
          <ShieldCheck className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Rendering Settings</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-violet-400 ml-auto transition-colors" />
        </Link>
      </div>
    </div>
  );
}