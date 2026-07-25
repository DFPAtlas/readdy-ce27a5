'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Component, Search, Plus, ChevronDown, ArrowRight, Eye, ShieldCheck,
  AlertTriangle, CheckCircle2, Clock, Archive, Layers,
  Palette, Package, GitBranch, XCircle,
} from 'lucide-react';

type ComponentCategory = 'preheader' | 'header' | 'hero' | 'introduction' | 'text_section' | 'image_text_row' | 'feature_card' | 'project_status_card' | 'website_preview_card' | 'payment_card' | 'appointment_card' | 'quote' | 'cta' | 'contact_block' | 'social_links' | 'divider' | 'legal_notice' | 'footer' | 'unsubscribe_block' | 'other';
type ComponentStatus = 'draft' | 'ready_for_review' | 'approved' | 'published' | 'deprecated' | 'retired' | 'blocked';

interface DesignComponent {
  id: string;
  key: string;
  name: string;
  category: ComponentCategory;
  description: string;
  scope: string;
  brand: string | null;
  status: ComponentStatus;
  version: number;
  owner: string;
  usage_count: number;
  is_locked: boolean;
  variant_of: string | null;
  variant_type: string | null;
  token_dependencies: string[];
  compatibility_level: string;
  updated_at: string;
}

const MOCK_COMPONENTS: DesignComponent[] = [
  { id: '1', key: 'header.brand', name: 'Brand Header', category: 'header', description: 'Standard brand header with logo and tagline', scope: 'dfp_default', brand: null, status: 'published', version: 3, owner: 'Marcus Webb', usage_count: 234, is_locked: false, variant_of: null, variant_type: null, token_dependencies: ['color.primary', 'spacing.section'], compatibility_level: 'full', updated_at: '2026-07-15T10:00:00Z' },
  { id: '2', key: 'hero.full_width', name: 'Full-Width Hero', category: 'hero', description: 'Full-width hero with background image, heading and CTA', scope: 'dfp_default', brand: null, status: 'published', version: 2, owner: 'Sarah Chen', usage_count: 156, is_locked: false, variant_of: null, variant_type: null, token_dependencies: ['color.primary', 'typography.heading', 'button.radius'], compatibility_level: 'full', updated_at: '2026-07-10T14:00:00Z' },
  { id: '3', key: 'hero.compact', name: 'Compact Hero', category: 'hero', description: 'Narrower hero variant for transactional emails', scope: 'dfp_default', brand: null, status: 'published', version: 1, owner: 'Sarah Chen', usage_count: 89, is_locked: false, variant_of: '2', variant_type: 'compact', token_dependencies: ['color.primary'], compatibility_level: 'full', updated_at: '2026-06-20T09:00:00Z' },
  { id: '4', key: 'cta.primary', name: 'Primary CTA Button', category: 'cta', description: 'Standard call-to-action button with brand colour', scope: 'organisation', brand: null, status: 'published', version: 4, owner: 'Marcus Webb', usage_count: 312, is_locked: false, variant_of: null, variant_type: null, token_dependencies: ['color.primary', 'button.radius', 'spacing.button.padding'], compatibility_level: 'full', updated_at: '2026-07-01T11:00:00Z' },
  { id: '5', key: 'cta.outlook_safe', name: 'Outlook-Safe CTA', category: 'cta', description: 'CTA variant using table-based button for Outlook compatibility', scope: 'organisation', brand: null, status: 'published', version: 2, owner: 'Marcus Webb', usage_count: 45, is_locked: false, variant_of: '4', variant_type: 'standard', token_dependencies: ['color.primary'], compatibility_level: 'full', updated_at: '2026-06-15T08:00:00Z' },
  { id: '6', key: 'footer.legal', name: 'Legal Footer', category: 'legal_notice', description: 'Mandatory legal footer with unsubscribe and company details', scope: 'organisation', brand: null, status: 'published', version: 5, owner: 'James Okonkwo', usage_count: 456, is_locked: true, variant_of: null, variant_type: null, token_dependencies: ['color.footer.text', 'accessibility.min_font_size'], compatibility_level: 'full', updated_at: '2026-07-12T16:00:00Z' },
  { id: '7', key: 'feature_card.default', name: 'Feature Card', category: 'feature_card', description: 'Card with icon, heading, description and optional link', scope: 'dfp_default', brand: null, status: 'published', version: 3, owner: 'Elena Rossi', usage_count: 98, is_locked: false, variant_of: null, variant_type: null, token_dependencies: ['color.primary', 'typography.heading', 'typography.body', 'spacing.section'], compatibility_level: 'partial', updated_at: '2026-07-08T12:00:00Z' },
  { id: '8', key: 'feature_card.dark', name: 'Feature Card — Dark', category: 'feature_card', description: 'Dark mode variant with inverted colours', scope: 'dfp_default', brand: null, status: 'published', version: 1, owner: 'Elena Rossi', usage_count: 34, is_locked: false, variant_of: '7', variant_type: 'dark', token_dependencies: ['color.primary'], compatibility_level: 'partial', updated_at: '2026-07-08T12:00:00Z' },
  { id: '9', key: 'social_links.default', name: 'Social Links Block', category: 'social_links', description: 'Standard social media icon row', scope: 'dfp_default', brand: null, status: 'published', version: 2, owner: 'Elena Rossi', usage_count: 167, is_locked: false, variant_of: null, variant_type: null, token_dependencies: ['spacing.section'], compatibility_level: 'full', updated_at: '2026-06-25T14:00:00Z' },
  { id: '10', key: 'appointment_card.default', name: 'Appointment Card', category: 'appointment_card', description: 'Card showing appointment date, time and location', scope: 'brand', brand: 'guardianhub', status: 'published', version: 1, owner: 'Elena Rossi', usage_count: 23, is_locked: false, variant_of: null, variant_type: null, token_dependencies: ['color.primary', 'color.primary.dark'], compatibility_level: 'full', updated_at: '2026-07-05T10:00:00Z' },
  { id: '11', key: 'divider.simple', name: 'Simple Divider', category: 'divider', description: 'Basic horizontal rule divider', scope: 'organisation', brand: null, status: 'published', version: 1, owner: 'Marcus Webb', usage_count: 289, is_locked: false, variant_of: null, variant_type: null, token_dependencies: [], compatibility_level: 'full', updated_at: '2026-03-10T08:00:00Z' },
  { id: '12', key: 'unsubscribe_block', name: 'Unsubscribe Block', category: 'unsubscribe_block', description: 'Mandatory unsubscribe link and preference centre', scope: 'organisation', brand: null, status: 'published', version: 3, owner: 'James Okonkwo', usage_count: 445, is_locked: true, variant_of: null, variant_type: null, token_dependencies: ['accessibility.min_font_size', 'link.default'], compatibility_level: 'full', updated_at: '2026-06-01T09:00:00Z' },
  { id: '13', key: 'text_section.default', name: 'Text Section', category: 'text_section', description: 'Standard body copy section with heading', scope: 'dfp_default', brand: null, status: 'draft', version: 4, owner: 'Marcus Webb', usage_count: 0, is_locked: false, variant_of: null, variant_type: null, token_dependencies: ['typography.body', 'typography.heading'], compatibility_level: 'full', updated_at: '2026-07-19T15:00:00Z' },
  { id: '14', key: 'footer.compact', name: 'Compact Footer', category: 'footer', description: 'Smaller footer for transactional emails', scope: 'dfp_default', brand: null, status: 'ready_for_review', version: 2, owner: 'Elena Rossi', usage_count: 0, is_locked: false, variant_of: '6', variant_type: 'compact', token_dependencies: ['color.footer.text'], compatibility_level: 'full', updated_at: '2026-07-18T11:00:00Z' },
  { id: '15', key: 'preheader.default', name: 'Preheader Text', category: 'preheader', description: 'Email preheader with view-in-browser link', scope: 'organisation', brand: null, status: 'published', version: 2, owner: 'Marcus Webb', usage_count: 389, is_locked: false, variant_of: null, variant_type: null, token_dependencies: ['link.default'], compatibility_level: 'full', updated_at: '2026-05-15T08:00:00Z' },
  { id: '16', key: 'payment_card.default', name: 'Payment Card', category: 'payment_card', description: 'Card displaying payment amount, method and status', scope: 'brand', brand: 'synqoro', status: 'deprecated', version: 1, owner: 'Elena Rossi', usage_count: 8, is_locked: false, variant_of: null, variant_type: null, token_dependencies: ['color.primary'], compatibility_level: 'partial', updated_at: '2026-02-10T09:00:00Z' },
];

const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  preheader: 'Preheader', header: 'Header', hero: 'Hero', introduction: 'Introduction',
  text_section: 'Text Section', image_text_row: 'Image & Text', feature_card: 'Feature Card',
  project_status_card: 'Project Status', website_preview_card: 'Website Preview', payment_card: 'Payment',
  appointment_card: 'Appointment', quote: 'Quote', cta: 'Call to Action', contact_block: 'Contact',
  social_links: 'Social Links', divider: 'Divider', legal_notice: 'Legal Notice', footer: 'Footer',
  unsubscribe_block: 'Unsubscribe', other: 'Other',
};

const STATUS_LABELS: Record<ComponentStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  ready_for_review: { label: 'Ready for Review', color: 'bg-sky-400/10 text-sky-400 border-sky-400/20' },
  approved: { label: 'Approved', color: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
  published: { label: 'Published', color: 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20' },
  deprecated: { label: 'Deprecated', color: 'bg-amber-400/10 text-amber-400 border-amber-400/20' },
  retired: { label: 'Retired', color: 'bg-rose-400/10 text-rose-400 border-rose-400/20' },
  blocked: { label: 'Blocked', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export default function DesignSystemComponents() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<DesignComponent | null>(null);

  const filtered = MOCK_COMPONENTS.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.key.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Component Library</h1>
          <p className="text-sm text-slate-400 mt-1.5 max-w-xl">
            Governed email-safe components with contracts, variants, token dependencies and compatibility evidence.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] text-white rounded-xl font-semibold text-sm hover:bg-[#0891B2] transition-all cursor-pointer whitespace-nowrap">
          <Plus className="w-4 h-4" />
          New Component
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text" placeholder="Search components..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/30"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 cursor-pointer pr-8">
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 cursor-pointer pr-8">
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const statusInfo = STATUS_LABELS[c.status];
          return (
            <div
              key={c.id}
              onClick={() => setSelected(c)}
              className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 hover:border-[rgba(255,255,255,0.1)] transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    <Component className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-white truncate">{c.name}</p>
                      {c.is_locked && <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />}
                    </div>
                    <code className="text-[10px] text-[#06B6D4] font-mono">{c.key}</code>
                  </div>
                </div>
                <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider border shrink-0 ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>

              <p className="text-xs text-slate-500 mb-3 line-clamp-2">{c.description}</p>

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-500/10 text-slate-400">{CATEGORY_LABELS[c.category]}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-400/10 text-violet-400">v{c.version}</span>
                {c.variant_of && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-400/10 text-sky-400">{c.variant_type}</span>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.04)]">
                <span className="text-[10px] text-slate-600">{c.token_dependencies.length} token deps</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-600">{c.compatibility_level} compat</span>
                  <span className="text-[10px] text-slate-600">{c.usage_count} uses</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#1a1a1e] border border-[rgba(255,255,255,0.1)] rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
              <h3 className="text-base font-bold text-white">{selected.name}</h3>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white cursor-pointer">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Key</p>
                  <code className="text-sm text-[#06B6D4] font-mono">{selected.key}</code>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Version</p>
                  <p className="text-sm text-white">v{selected.version}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Category</p>
                  <p className="text-sm text-white">{CATEGORY_LABELS[selected.category]}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Scope</p>
                  <p className="text-sm text-white">{selected.brand ? `${selected.scope} (${selected.brand})` : selected.scope}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Compatibility</p>
                  <p className="text-sm text-white capitalize">{selected.compatibility_level}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Owner</p>
                  <p className="text-sm text-white">{selected.owner}</p>
                </div>
              </div>
              <p className="text-sm text-slate-300">{selected.description}</p>
              {selected.token_dependencies.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Token Dependencies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.token_dependencies.map((t) => (
                      <code key={t} className="text-[10px] text-[#06B6D4] font-mono bg-[#06B6D4]/5 px-2 py-0.5 rounded">{t}</code>
                    ))}
                  </div>
                </div>
              )}
              {selected.variant_of && (
                <div className="bg-sky-400/5 border border-sky-400/10 rounded-xl p-3">
                  <p className="text-xs text-sky-300">Variant of component ID: {selected.variant_of} ({selected.variant_type})</p>
                </div>
              )}
              {selected.is_locked && (
                <div className="bg-amber-400/5 border border-amber-400/10 rounded-xl p-3 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-300">This component is locked and cannot be structurally changed or removed by ordinary editors.</p>
                </div>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-[rgba(255,255,255,0.06)]">
                <button className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] text-slate-300 rounded-xl text-sm font-medium hover:bg-white/[0.08] transition-all cursor-pointer whitespace-nowrap">Edit</button>
                <button className="flex-1 px-4 py-2.5 bg-[#06B6D4] text-white rounded-xl text-sm font-medium hover:bg-[#0891B2] transition-all cursor-pointer whitespace-nowrap">View Dependencies</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link href="/admin/email/design-system/tokens" className="flex items-center gap-3 px-4 py-3 bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-[#06B6D4]/30 transition-all cursor-pointer group">
          <Palette className="w-4 h-4 text-slate-500 group-hover:text-[#06B6D4] transition-colors" />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Tokens</span>
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
        <Link href="/admin/email/design-system/dependencies" className="flex items-center gap-3 px-4 py-3 bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-[#06B6D4]/30 transition-all cursor-pointer group">
          <GitBranch className="w-4 h-4 text-slate-500 group-hover:text-[#06B6D4] transition-colors" />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Dependencies</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#06B6D4] ml-auto transition-colors" />
        </Link>
      </div>
    </div>
  );
}