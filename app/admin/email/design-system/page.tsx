'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Palette, Component, Layers, Package, GitBranch, AlertTriangle,
  Clock, CheckCircle2, XCircle, ArrowRight, TrendingUp, FileText,
  Eye, Edit3, Archive, Activity, ShieldCheck, Zap,
} from 'lucide-react';

interface StatCard {
  key: string;
  icon: React.ElementType;
  label: string;
  value: number;
  subtitle: string;
  color: string;
  bg: string;
  border: string;
  href: string;
}

const statCards: StatCard[] = [
  { key: 'published_tokens', icon: Palette, label: 'Published Tokens', value: 48, subtitle: 'Across 5 token categories', color: 'text-[#06B6D4]', bg: 'bg-[#06B6D4]/10', border: 'border-[#06B6D4]/20', href: '/admin/email/design-system/tokens' },
  { key: 'draft_changes', icon: Edit3, label: 'Draft Changes', value: 7, subtitle: 'Awaiting review', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', href: '/admin/email/design-system/tokens' },
  { key: 'components', icon: Component, label: 'Components', value: 22, subtitle: '18 published + 4 drafts', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', href: '/admin/email/design-system/components' },
  { key: 'patterns', icon: Layers, label: 'Patterns', value: 14, subtitle: 'Across 7 categories', color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20', href: '/admin/email/design-system/patterns' },
  { key: 'outdated_deps', icon: AlertTriangle, label: 'Outdated Dependencies', value: 9, subtitle: '3 breaking, 6 compatible', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20', href: '/admin/email/design-system/dependencies' },
  { key: 'deprecated', icon: Archive, label: 'Deprecated Items', value: 4, subtitle: '2 tokens, 1 component, 1 pattern', color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20', href: '/admin/email/design-system/components' },
  { key: 'pending_reviews', icon: Eye, label: 'Pending Reviews', value: 11, subtitle: '5 tokens + 4 components + 2 patterns', color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/20', href: '/admin/email/design-system/releases' },
  { key: 'recent_releases', icon: Package, label: 'Recent Releases', value: 3, subtitle: 'in the last 30 days', color: 'text-[#06B6D4]', bg: 'bg-[#06B6D4]/10', border: 'border-[#06B6D4]/20', href: '/admin/email/design-system/releases' },
];

interface HealthItem {
  label: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  detail: string;
}

const libraryHealth: HealthItem[] = [
  { label: 'Token Validation', status: 'healthy', detail: 'All published tokens pass validation' },
  { label: 'Component Contracts', status: 'healthy', detail: '18 components with valid contracts' },
  { label: 'Dependency Graph', status: 'warning', detail: '9 outdated dependencies detected' },
  { label: 'Compatibility Evidence', status: 'warning', detail: '3 components missing recent render tests' },
  { label: 'Broken Links', status: 'healthy', detail: 'No circular dependencies detected' },
  { label: 'Branch Coverage', status: 'healthy', detail: '3 brands using the system' },
  { label: 'Failed Migrations', status: 'healthy', detail: 'No failed migrations' },
  { label: 'Lock Compliance', status: 'healthy', detail: 'All locked items intact' },
];

interface RecentActivity {
  action: string;
  item: string;
  user: string;
  time: string;
  type: 'token' | 'component' | 'pattern' | 'release' | 'dependency';
}

const recentActivity: RecentActivity[] = [
  { action: 'Published release', item: 'v2.4.0 — Footer accessibility update', user: 'Sarah Chen', time: '2 hours ago', type: 'release' },
  { action: 'Updated component', item: 'Feature Card — v3.1 (patch)', user: 'Marcus Webb', time: '4 hours ago', type: 'component' },
  { action: 'Deprecated token', item: 'color.primary.legacy', user: 'Sarah Chen', time: '1 day ago', type: 'token' },
  { action: 'Created pattern', item: 'Security Notification', user: 'James Okonkwo', time: '1 day ago', type: 'pattern' },
  { action: 'Bulk updated deps', item: '12 Draft templates — button colour update', user: 'Marcus Webb', time: '2 days ago', type: 'dependency' },
  { action: 'Locked component', item: 'Legal Footer — organisation-wide', user: 'Sarah Chen', time: '3 days ago', type: 'component' },
  { action: 'Approved token set', item: 'Spacing v2.0 — mobile padding', user: 'Elena Rossi', time: '3 days ago', type: 'token' },
  { action: 'Rolled back release', item: 'v2.3.1 — button radius change', user: 'Marcus Webb', time: '5 days ago', type: 'release' },
];

const typeColors: Record<string, string> = {
  token: 'text-[#06B6D4] bg-[#06B6D4]/10',
  component: 'text-emerald-400 bg-emerald-400/10',
  pattern: 'text-violet-400 bg-violet-400/10',
  release: 'text-amber-400 bg-amber-400/10',
  dependency: 'text-sky-400 bg-sky-400/10',
};

const statusIcons: Record<string, React.ElementType> = {
  healthy: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  unknown: Activity,
};

const statusColors: Record<string, string> = {
  healthy: 'text-emerald-400',
  warning: 'text-amber-400',
  error: 'text-rose-400',
  unknown: 'text-slate-500',
};

const QUICK_LINKS = [
  { icon: Palette, label: 'Manage Tokens', href: '/admin/email/design-system/tokens' },
  { icon: Component, label: 'Component Library', href: '/admin/email/design-system/components' },
  { icon: Layers, label: 'Pattern Library', href: '/admin/email/design-system/patterns' },
  { icon: Package, label: 'Releases', href: '/admin/email/design-system/releases' },
  { icon: GitBranch, label: 'Dependencies', href: '/admin/email/design-system/dependencies' },
  { icon: ShieldCheck, label: 'Settings', href: '/admin/email/settings/design-system' },
];

export default function DesignSystemDashboard() {
  const [search, setSearch] = useState('');
  const [activityFilter, setActivityFilter] = useState<string>('all');

  const filteredActivity = recentActivity.filter((a) => {
    if (activityFilter !== 'all' && a.type !== activityFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Design System</h1>
          <p className="text-sm text-slate-400 mt-1.5 max-w-xl">
            Governed email design tokens, shared components and pattern library for consistent, safely maintained content across DFP brands.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/email/design-system/releases"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] text-slate-300 rounded-xl font-semibold text-sm hover:bg-white/[0.08] hover:border-[rgba(255,255,255,0.15)] transition-all cursor-pointer whitespace-nowrap"
          >
            <Package className="w-4 h-4" />
            Create Release
          </Link>
          <Link
            href="/admin/email/design-system/tokens"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] text-white rounded-xl font-semibold text-sm hover:bg-[#0891B2] transition-all cursor-pointer whitespace-nowrap shadow-lg shadow-[#06B6D4]/10"
          >
            <Palette className="w-4 h-4" />
            New Token
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.slice(0, 8).map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.key} href={card.href} className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 hover:border-[rgba(255,255,255,0.1)] transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{card.label}</span>
                <div className={`w-8 h-8 rounded-lg ${card.bg} ${card.border} border flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-[11px] text-slate-500 mt-1">{card.subtitle}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
              <div>
                <h2 className="text-base font-bold text-white">Library Health</h2>
                <p className="text-xs text-slate-500 mt-0.5">Real-time status of the design system</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">8 checks</span>
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {libraryHealth.map((item) => {
                  const Icon = statusIcons[item.status];
                  return (
                    <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl border border-[rgba(255,255,255,0.04)] bg-white/[0.02]">
                      <Icon className={`w-4 h-4 ${statusColors[item.status]} mt-0.5 shrink-0`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">{item.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
              <div>
                <h2 className="text-base font-bold text-white">Recent Activity</h2>
                <p className="text-xs text-slate-500 mt-0.5">Design system changes and events</p>
              </div>
              <div className="flex items-center gap-1">
                {['all', 'token', 'component', 'pattern', 'release'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActivityFilter(t)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap ${
                      activityFilter === t ? 'bg-[#06B6D4]/10 text-[#06B6D4]' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {filteredActivity.map((item, i) => (
                <div key={i} className="flex items-start gap-3 px-6 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${typeColors[item.type]}`}>
                    {item.type === 'token' ? <Palette className="w-3.5 h-3.5" /> : item.type === 'component' ? <Component className="w-3.5 h-3.5" /> : item.type === 'pattern' ? <Layers className="w-3.5 h-3.5" /> : item.type === 'release' ? <Package className="w-3.5 h-3.5" /> : <GitBranch className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white">
                      <span className="font-medium">{item.action}</span>{' — '}
                      <span className="text-slate-300">{item.item}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.user} · {item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
              <h2 className="text-base font-bold text-white">Quick Links</h2>
            </div>
            <div className="p-3 space-y-1">
              {QUICK_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer group"
                  >
                    <Icon className="w-4 h-4 text-slate-500 group-hover:text-[#06B6D4] transition-colors" />
                    <span>{link.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 ml-auto" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
              <h2 className="text-base font-bold text-white">Brand Usage</h2>
            </div>
            <div className="p-4 space-y-4">
              {[
                { name: 'Digital Footprint', tokens: 48, components: 18, patterns: 12 },
                { name: 'GuardianHub', tokens: 36, components: 12, patterns: 8 },
                { name: 'Synqoro', tokens: 29, components: 8, patterns: 4 },
              ].map((brand) => (
                <div key={brand.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">{brand.name}</p>
                    <span className="text-[10px] text-slate-500">{brand.tokens + brand.components + brand.patterns} items</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#06B6D4]/10 text-[#06B6D4]">{brand.tokens} tokens</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-400/10 text-emerald-400">{brand.components} components</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-violet-400/10 text-violet-400">{brand.patterns} patterns</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
              <h2 className="text-base font-bold text-white">Compatibility Warnings</h2>
            </div>
            <div className="p-4 space-y-3">
              {[
                { item: 'Hero v2.1', issue: 'Missing mobile dark-mode evidence', severity: 'warning' },
                { item: 'Button colour tokens', issue: 'Outlook fallback not verified', severity: 'warning' },
                { item: 'Footer v1.4', issue: 'Render test baseline > 30 days', severity: 'info' },
              ].map((w, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-400/[0.04] border border-amber-400/[0.08]">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm text-white">{w.item}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{w.issue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-4 py-3 bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-[#06B6D4]/30 transition-all cursor-pointer group"
            >
              <Icon className="w-4 h-4 text-slate-500 group-hover:text-[#06B6D4] transition-colors" />
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{link.label}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#06B6D4] ml-auto transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}