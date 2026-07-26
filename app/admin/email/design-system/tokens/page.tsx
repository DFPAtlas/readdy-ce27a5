'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Palette, Search, Plus, ChevronDown, ArrowRight, CheckCircle2,
  Clock, Eye, Edit3, Archive, ShieldCheck, AlertTriangle, XCircle,
  Layers, GitBranch, Package,
} from 'lucide-react';

type TokenCategory = 'colour' | 'typography' | 'spacing' | 'width' | 'border_radius' | 'divider' | 'image' | 'button' | 'section_padding' | 'header_layout' | 'footer_layout' | 'link' | 'accessibility' | 'compatibility_fallback' | 'other';
type TokenStatus = 'draft' | 'ready_for_review' | 'approved' | 'published' | 'deprecated' | 'retired' | 'blocked';
type TokenScope = 'organisation' | 'dfp_default' | 'brand' | 'product' | 'template_override';

interface DesignToken {
  id: string;
  key: string;
  name: string;
  token_type: TokenCategory;
  value: string;
  fallback_value: string | null;
  scope: TokenScope;
  brand_id: string | null;
  status: TokenStatus;
  version: number;
  description: string;
  owner: string;
  usage_count: number;
  inherits_from: string | null;
  is_locked: boolean;
  review_date: string;
  updated_at: string;
}

const MOCK_TOKENS: DesignToken[] = [
  { id: '1', key: 'color.primary', name: 'Primary Brand Colour', token_type: 'colour', value: '#06B6D4', fallback_value: '#0891B2', scope: 'dfp_default', brand_id: null, status: 'published', version: 2, description: 'Primary brand cyan used for CTAs, links and highlights', owner: 'Sarah Chen', usage_count: 156, inherits_from: null, is_locked: true, review_date: '2026-06-15', updated_at: '2026-06-15T10:30:00Z' },
  { id: '2', key: 'color.primary.dark', name: 'Primary Dark Variant', token_type: 'colour', value: '#0891B2', fallback_value: '#06B6D4', scope: 'dfp_default', brand_id: null, status: 'published', version: 1, description: 'Darker variant for hover states', owner: 'Sarah Chen', usage_count: 89, inherits_from: null, is_locked: false, review_date: '2026-05-20', updated_at: '2026-05-20T14:00:00Z' },
  { id: '3', key: 'color.background', name: 'Page Background', token_type: 'colour', value: '#FFFFFF', fallback_value: '#F8FAFC', scope: 'organisation', brand_id: null, status: 'published', version: 1, description: 'Default email background colour', owner: 'Sarah Chen', usage_count: 234, inherits_from: null, is_locked: false, review_date: '2026-04-10', updated_at: '2026-04-10T09:00:00Z' },
  { id: '4', key: 'typography.heading', name: 'Heading Font Stack', token_type: 'typography', value: "Georgia, 'Times New Roman', serif", fallback_value: 'Arial, sans-serif', scope: 'dfp_default', brand_id: null, status: 'published', version: 1, description: 'Serif heading font with web-safe fallback', owner: 'Marcus Webb', usage_count: 178, inherits_from: null, is_locked: false, review_date: '2026-06-01', updated_at: '2026-06-01T11:00:00Z' },
  { id: '5', key: 'typography.body', name: 'Body Font Stack', token_type: 'typography', value: "Arial, Helvetica, sans-serif", fallback_value: 'sans-serif', scope: 'organisation', brand_id: null, status: 'published', version: 2, description: 'Body copy font stack with Microsoft-safe fallbacks', owner: 'Marcus Webb', usage_count: 267, inherits_from: null, is_locked: false, review_date: '2026-06-10', updated_at: '2026-06-10T16:30:00Z' },
  { id: '6', key: 'spacing.section', name: 'Section Padding', token_type: 'spacing', value: '32px', fallback_value: '24px', scope: 'dfp_default', brand_id: null, status: 'published', version: 1, description: 'Default vertical padding between sections', owner: 'Marcus Webb', usage_count: 145, inherits_from: null, is_locked: false, review_date: '2026-05-15', updated_at: '2026-05-15T08:00:00Z' },
  { id: '7', key: 'spacing.mobile.section', name: 'Mobile Section Padding', token_type: 'spacing', value: '20px', fallback_value: '16px', scope: 'dfp_default', brand_id: null, status: 'published', version: 1, description: 'Vertical padding for mobile viewports', owner: 'Marcus Webb', usage_count: 134, inherits_from: '6', is_locked: false, review_date: '2026-05-15', updated_at: '2026-05-15T08:00:00Z' },
  { id: '8', key: 'button.radius', name: 'Button Border Radius', token_type: 'border_radius', value: '6px', fallback_value: '4px', scope: 'brand', brand_id: 'guardianhub', status: 'published', version: 1, description: 'GuardianHub brand button corner radius', owner: 'Elena Rossi', usage_count: 45, inherits_from: null, is_locked: false, review_date: '2026-07-01', updated_at: '2026-07-01T13:00:00Z' },
  { id: '9', key: 'color.primary.legacy', name: 'Legacy Primary Colour', token_type: 'colour', value: '#0284C7', fallback_value: '#06B6D4', scope: 'dfp_default', brand_id: null, status: 'deprecated', version: 1, description: 'Old primary colour — use color.primary instead', owner: 'Sarah Chen', usage_count: 23, inherits_from: null, is_locked: false, review_date: '2025-12-01', updated_at: '2026-01-15T10:00:00Z' },
  { id: '10', key: 'spacing.button.padding', name: 'Button Internal Padding', token_type: 'spacing', value: '12px 24px', fallback_value: '10px 20px', scope: 'dfp_default', brand_id: null, status: 'draft', version: 3, description: 'Horizontal and vertical button padding — v3 draft', owner: 'Marcus Webb', usage_count: 0, inherits_from: null, is_locked: false, review_date: '', updated_at: '2026-07-18T09:30:00Z' },
  { id: '11', key: 'color.accent', name: 'Accent Colour', token_type: 'colour', value: '#F59E0B', fallback_value: '#D97706', scope: 'dfp_default', brand_id: null, status: 'ready_for_review', version: 2, description: 'Warning and highlight accent colour — v2 pending approval', owner: 'Sarah Chen', usage_count: 0, inherits_from: null, is_locked: false, review_date: '2026-07-19', updated_at: '2026-07-19T11:00:00Z' },
  { id: '12', key: 'link.default', name: 'Default Link Colour', token_type: 'link', value: '#06B6D4', fallback_value: '#0EA5E9', scope: 'organisation', brand_id: null, status: 'published', version: 1, description: 'Standard inline link colour', owner: 'Sarah Chen', usage_count: 210, inherits_from: null, is_locked: false, review_date: '2026-04-20', updated_at: '2026-04-20T15:00:00Z' },
  { id: '13', key: 'accessibility.min_font_size', name: 'Minimum Font Size', token_type: 'accessibility', value: '14px', fallback_value: '13px', scope: 'organisation', brand_id: null, status: 'published', version: 1, description: 'WCAG-compliant minimum readable body font size', owner: 'James Okonkwo', usage_count: 0, inherits_from: null, is_locked: true, review_date: '2026-03-10', updated_at: '2026-03-10T09:00:00Z' },
  { id: '14', key: 'color.footer.text', name: 'Footer Text Colour', token_type: 'colour', value: '#94A3B8', fallback_value: '#64748B', scope: 'brand', brand_id: 'synqoro', status: 'published', version: 1, description: 'Synqoro muted footer text', owner: 'Elena Rossi', usage_count: 18, inherits_from: null, is_locked: false, review_date: '2026-07-10', updated_at: '2026-07-10T14:00:00Z' },
  { id: '15', key: 'image.max_width', name: 'Maximum Image Width', token_type: 'image', value: '600px', fallback_value: '100%', scope: 'organisation', brand_id: null, status: 'published', version: 1, description: 'Max image width for email client safety', owner: 'Marcus Webb', usage_count: 98, inherits_from: null, is_locked: false, review_date: '2026-02-20', updated_at: '2026-02-20T10:00:00Z' },
];

const CATEGORY_LABELS: Record<TokenCategory, string> = {
  colour: 'Colour',
  typography: 'Typography',
  spacing: 'Spacing',
  width: 'Width',
  border_radius: 'Border & Radius',
  divider: 'Dividers',
  image: 'Images',
  button: 'Buttons',
  section_padding: 'Section Padding',
  header_layout: 'Header Layout',
  footer_layout: 'Footer Layout',
  link: 'Links',
  accessibility: 'Accessibility',
  compatibility_fallback: 'Compatibility',
  other: 'Other',
};

const STATUS_LABELS: Record<TokenStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  ready_for_review: { label: 'Ready for Review', color: 'bg-sky-400/10 text-sky-400 border-sky-400/20' },
  approved: { label: 'Approved', color: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
  published: { label: 'Published', color: 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20' },
  deprecated: { label: 'Deprecated', color: 'bg-amber-400/10 text-amber-400 border-amber-400/20' },
  retired: { label: 'Retired', color: 'bg-rose-400/10 text-rose-400 border-rose-400/20' },
  blocked: { label: 'Blocked', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const SCOPE_LABELS: Record<TokenScope, string> = {
  organisation: 'Organisation',
  dfp_default: 'DFP Default',
  brand: 'Brand',
  product: 'Product',
  template_override: 'Template Override',
};

export default function DesignSystemTokens() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedToken, setSelectedToken] = useState<DesignToken | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'detail'>('table');

  const filtered = MOCK_TOKENS.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.key.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'all' && t.token_type !== categoryFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  const publishedCount = MOCK_TOKENS.filter((t) => t.status === 'published').length;
  const draftCount = MOCK_TOKENS.filter((t) => t.status === 'draft' || t.status === 'ready_for_review').length;
  const deprecatedCount = MOCK_TOKENS.filter((t) => t.status === 'deprecated').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Design Tokens</h1>
          <p className="text-sm text-slate-400 mt-1.5 max-w-xl">
            Governed email-safe tokens for colours, typography, spacing, buttons, links and accessibility.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] text-white rounded-xl font-semibold text-sm hover:bg-[#0891B2] transition-all cursor-pointer whitespace-nowrap">
          <Plus className="w-4 h-4" />
          New Token
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Published</span>
            <div className="w-7 h-7 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#06B6D4]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{publishedCount}</p>
          <p className="text-[11px] text-slate-500">Active tokens in use</p>
        </div>
        <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Drafts</span>
            <div className="w-7 h-7 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{draftCount}</p>
          <p className="text-[11px] text-slate-500">Pending review or approval</p>
        </div>
        <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Deprecated</span>
            <div className="w-7 h-7 rounded-lg bg-rose-400/10 border border-rose-400/20 flex items-center justify-center">
              <Archive className="w-3.5 h-3.5 text-rose-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{deprecatedCount}</p>
          <p className="text-[11px] text-slate-500">Scheduled for retirement</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tokens by name or key..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/30"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 cursor-pointer pr-8"
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-xl text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 cursor-pointer pr-8"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Key</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Name</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Value</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Scope</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Version</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="text-left px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Usage</th>
                <th className="text-right px-5 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
              {filtered.map((token) => {
                const statusInfo = STATUS_LABELS[token.status];
                return (
                  <tr key={token.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => { setSelectedToken(token); setViewMode('detail'); }}>
                    <td className="px-5 py-3.5">
                      <code className="text-xs text-[#06B6D4] font-mono bg-[#06B6D4]/5 px-1.5 py-0.5 rounded">{token.key}</code>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-medium">{token.name}</span>
                        {token.is_locked && <ShieldCheck className="w-3 h-3 text-amber-400" />}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-400">{CATEGORY_LABELS[token.token_type]}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      {token.token_type === 'colour' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded border border-[rgba(255,255,255,0.1)]" style={{ backgroundColor: token.value }} />
                          <code className="text-xs text-slate-300 font-mono">{token.value}</code>
                        </div>
                      ) : (
                        <code className="text-xs text-slate-300 font-mono">{token.value}</code>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-400">{SCOPE_LABELS[token.scope]}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-400">v{token.version}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-400">{token.usage_count}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button className="w-7 h-7 rounded-lg bg-white/[0.04] border border-[rgba(255,255,255,0.06)] flex items-center justify-center text-slate-500 hover:text-white hover:border-[rgba(255,255,255,0.15)] opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
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

      {selectedToken && viewMode === 'detail' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewMode('table')}>
          <div className="bg-[#1a1a1e] border border-[rgba(255,255,255,0.1)] rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
              <h3 className="text-base font-bold text-white">{selectedToken.name}</h3>
              <button onClick={() => setViewMode('table')} className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white cursor-pointer">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Key</p>
                  <code className="text-sm text-[#06B6D4] font-mono">{selectedToken.key}</code>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Version</p>
                  <p className="text-sm text-white">v{selectedToken.version}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Type</p>
                  <p className="text-sm text-white">{CATEGORY_LABELS[selectedToken.token_type]}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Scope</p>
                  <p className="text-sm text-white">{SCOPE_LABELS[selectedToken.scope]}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Value</p>
                  <div className="flex items-center gap-2">
                    {selectedToken.token_type === 'colour' && <div className="w-4 h-4 rounded border border-[rgba(255,255,255,0.1)]" style={{ backgroundColor: selectedToken.value }} />}
                    <code className="text-sm text-white font-mono">{selectedToken.value}</code>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Fallback</p>
                  <code className="text-sm text-slate-400 font-mono">{selectedToken.fallback_value || '—'}</code>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                  <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${STATUS_LABELS[selectedToken.status].color}`}>
                    {STATUS_LABELS[selectedToken.status].label}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Usage</p>
                  <p className="text-sm text-white">{selectedToken.usage_count} references</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Owner</p>
                  <p className="text-sm text-white">{selectedToken.owner}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Inherits From</p>
                  <p className="text-sm text-slate-400">{selectedToken.inherits_from || '—'}</p>
                </div>
              </div>
              {selectedToken.description && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-slate-300">{selectedToken.description}</p>
                </div>
              )}
              {selectedToken.is_locked && (
                <div className="bg-amber-400/5 border border-amber-400/10 rounded-xl p-3 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-300">This token is locked and cannot be structurally changed or removed by ordinary editors.</p>
                </div>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-[rgba(255,255,255,0.06)]">
                <button className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] text-slate-300 rounded-xl text-sm font-medium hover:bg-white/[0.08] transition-all cursor-pointer whitespace-nowrap">
                  Edit Token
                </button>
                <button className="flex-1 px-4 py-2.5 bg-[#06B6D4] text-white rounded-xl text-sm font-medium hover:bg-[#0891B2] transition-all cursor-pointer whitespace-nowrap">
                  View Dependencies
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Link href="/admin/email/design-system/components" className="flex items-center gap-3 px-4 py-3 bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-[#06B6D4]/30 transition-all cursor-pointer group">
          <Layers className="w-4 h-4 text-slate-500 group-hover:text-[#06B6D4] transition-colors" />
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
        <Link href="/admin/email/design-system/dependencies" className="flex items-center gap-3 px-4 py-3 bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-[#06B6D4]/30 transition-all cursor-pointer group">
          <GitBranch className="w-4 h-4 text-slate-500 group-hover:text-[#06B6D4] transition-colors" />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Dependencies</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#06B6D4] ml-auto transition-colors" />
        </Link>
      </div>
    </div>
  );
}

