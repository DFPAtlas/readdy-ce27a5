'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Layers, Search, Plus, ArrowRight, Eye, CheckCircle2, Clock, Package,
  Palette, Component, GitBranch, XCircle, AlertTriangle,
} from 'lucide-react';

type PatternCategory = 'welcome' | 'website_preview' | 'project_update' | 'supplier_invitation' | 'client_approval' | 'payment_reminder' | 'appointment_confirmation' | 'newsletter' | 'product_announcement' | 'support_acknowledgement' | 'security_notification' | 'event_invitation' | 'other';
type PatternStatus = 'draft' | 'ready_for_review' | 'approved' | 'published' | 'deprecated' | 'retired' | 'blocked';

interface DesignPattern {
  id: string;
  key: string;
  name: string;
  category: PatternCategory;
  description: string;
  scope: string;
  brand: string | null;
  status: PatternStatus;
  version: number;
  owner: string;
  usage_count: number;
  component_keys: string[];
  layout_rules: string;
  updated_at: string;
}

const CATEGORY_LABELS: Record<PatternCategory, string> = {
  welcome: 'Welcome', website_preview: 'Website Preview', project_update: 'Project Update',
  supplier_invitation: 'Supplier Invite', client_approval: 'Client Approval', payment_reminder: 'Payment Reminder',
  appointment_confirmation: 'Appointment', newsletter: 'Newsletter', product_announcement: 'Product Announcement',
  support_acknowledgement: 'Support', security_notification: 'Security', event_invitation: 'Event',
  other: 'Other',
};

const STATUS_LABELS: Record<PatternStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  ready_for_review: { label: 'Ready for Review', color: 'bg-sky-400/10 text-sky-400 border-sky-400/20' },
  approved: { label: 'Approved', color: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' },
  published: { label: 'Published', color: 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20' },
  deprecated: { label: 'Deprecated', color: 'bg-amber-400/10 text-amber-400 border-amber-400/20' },
  retired: { label: 'Retired', color: 'bg-rose-400/10 text-rose-400 border-rose-400/20' },
  blocked: { label: 'Blocked', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const MOCK_PATTERNS: DesignPattern[] = [
  { id: '1', key: 'welcome.new_client', name: 'New Client Welcome', category: 'welcome', description: 'Onboarding welcome with brand intro, next steps and support links', scope: 'dfp_default', brand: null, status: 'published', version: 2, owner: 'Sarah Chen', usage_count: 89, component_keys: ['header.brand', 'hero.compact', 'text_section.default', 'cta.primary', 'social_links.default', 'footer.legal', 'unsubscribe_block'], layout_rules: 'Hero → Intro → CTA → Social → Footer', updated_at: '2026-07-10T09:00:00Z' },
  { id: '2', key: 'project.status_update', name: 'Project Status Update', category: 'project_update', description: 'Update with project card, milestones and action items', scope: 'dfp_default', brand: null, status: 'published', version: 3, owner: 'Marcus Webb', usage_count: 67, component_keys: ['header.brand', 'text_section.default', 'feature_card.default', 'cta.primary', 'footer.legal'], layout_rules: 'Header → Intro → Cards → CTA → Footer', updated_at: '2026-07-05T14:00:00Z' },
  { id: '3', key: 'newsletter.monthly', name: 'Monthly Newsletter', category: 'newsletter', description: 'Curated content newsletter with hero, articles and social', scope: 'dfp_default', brand: null, status: 'published', version: 1, owner: 'Elena Rossi', usage_count: 34, component_keys: ['header.brand', 'hero.full_width', 'text_section.default', 'image_text_row', 'cta.primary', 'social_links.default', 'footer.legal'], layout_rules: 'Header → Hero → Sections → CTA → Social → Footer', updated_at: '2026-06-20T11:00:00Z' },
  { id: '4', key: 'payment.reminder', name: 'Payment Reminder', category: 'payment_reminder', description: 'Polite payment reminder with amount, due date and payment link', scope: 'dfp_default', brand: null, status: 'published', version: 1, owner: 'James Okonkwo', usage_count: 45, component_keys: ['header.brand', 'text_section.default', 'payment_card.default', 'cta.primary', 'footer.legal', 'unsubscribe_block'], layout_rules: 'Header → Intro → Payment Card → CTA → Footer', updated_at: '2026-07-01T08:00:00Z' },
  { id: '5', key: 'appointment.confirmation', name: 'Appointment Confirmation', category: 'appointment_confirmation', description: 'Booking confirmation with appointment details and calendar link', scope: 'brand', brand: 'guardianhub', status: 'published', version: 1, owner: 'Elena Rossi', usage_count: 22, component_keys: ['header.brand', 'appointment_card.default', 'cta.primary', 'footer.legal', 'unsubscribe_block'], layout_rules: 'Header → Appointment Card → CTA → Footer', updated_at: '2026-06-28T10:00:00Z' },
  { id: '6', key: 'security.notification', name: 'Security Notification', category: 'security_notification', description: 'Account security alert with details and action required', scope: 'organisation', brand: null, status: 'draft', version: 1, owner: 'James Okonkwo', usage_count: 0, component_keys: ['header.brand', 'text_section.default', 'cta.primary', 'footer.legal', 'unsubscribe_block'], layout_rules: 'Header → Alert Text → CTA → Footer', updated_at: '2026-07-19T16:00:00Z' },
  { id: '7', key: 'event.invitation', name: 'Event Invitation', category: 'event_invitation', description: 'Event invite with date, venue, agenda and RSVP button', scope: 'dfp_default', brand: null, status: 'published', version: 1, owner: 'Sarah Chen', usage_count: 12, component_keys: ['header.brand', 'hero.full_width', 'text_section.default', 'cta.primary', 'social_links.default', 'footer.legal'], layout_rules: 'Header → Hero → Details → CTA → Social → Footer', updated_at: '2026-07-12T09:00:00Z' },
  { id: '8', key: 'product.announcement', name: 'Product Announcement', category: 'product_announcement', description: 'New product or feature announcement with highlights', scope: 'dfp_default', brand: null, status: 'ready_for_review', version: 2, owner: 'Marcus Webb', usage_count: 0, component_keys: ['header.brand', 'hero.full_width', 'feature_card.default', 'cta.primary', 'social_links.default', 'footer.legal'], layout_rules: 'Header → Hero → Feature Cards → CTA → Social → Footer', updated_at: '2026-07-18T14:00:00Z' },
  { id: '9', key: 'client.approval_request', name: 'Client Approval Request', category: 'client_approval', description: 'Secure approval request with review link and deadline', scope: 'dfp_default', brand: null, status: 'published', version: 1, owner: 'Sarah Chen', usage_count: 28, component_keys: ['header.brand', 'text_section.default', 'cta.primary', 'footer.legal', 'unsubscribe_block'], layout_rules: 'Header → Intro → Review Link → CTA → Footer', updated_at: '2026-06-15T11:00:00Z' },
  { id: '10', key: 'support.acknowledgement', name: 'Support Acknowledgement', category: 'support_acknowledgement', description: 'Ticket received confirmation with reference and expected response time', scope: 'organisation', brand: null, status: 'published', version: 1, owner: 'James Okonkwo', usage_count: 56, component_keys: ['header.brand', 'text_section.default', 'footer.legal', 'unsubscribe_block'], layout_rules: 'Header → Acknowledgement → Footer', updated_at: '2026-05-20T09:00:00Z' },
  { id: '11', key: 'supplier.invitation', name: 'Supplier Invitation', category: 'supplier_invitation', description: 'Invitation to join supplier portal with registration link', scope: 'brand', brand: 'synqoro', status: 'deprecated', version: 1, owner: 'Elena Rossi', usage_count: 5, component_keys: ['header.brand', 'cta.primary', 'footer.legal'], layout_rules: 'Header → Invitation → CTA → Footer', updated_at: '2026-03-10T08:00:00Z' },
  { id: '12', key: 'newsletter.product', name: 'Product Newsletter', category: 'newsletter', description: 'Product-focused newsletter variant with richer layout', scope: 'brand', brand: 'guardianhub', status: 'published', version: 1, owner: 'Elena Rossi', usage_count: 8, component_keys: ['header.brand', 'hero.full_width', 'feature_card.default', 'image_text_row', 'cta.primary', 'social_links.default', 'footer.legal'], layout_rules: 'Header → Hero → Cards → Image/Text → CTA → Social → Footer', updated_at: '2026-07-08T15:00:00Z' },
];

export default function DesignSystemPatterns() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<DesignPattern | null>(null);

  const filtered = MOCK_PATTERNS.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.key.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pattern Library</h1>
          <p className="text-sm text-slate-400 mt-1.5 max-w-xl">
            Reusable email patterns combining approved components, layout rules, token references and validation rules.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] text-white rounded-xl font-semibold text-sm hover:bg-[#0891B2] transition-all cursor-pointer whitespace-nowrap">
          <Plus className="w-4 h-4" />
          New Pattern
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search patterns..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/30" />
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
        {filtered.map((p) => {
          const statusInfo = STATUS_LABELS[p.status];
          return (
            <div key={p.id} onClick={() => setSelected(p)} className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 hover:border-[rgba(255,255,255,0.1)] transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-[rgba(255,255,255,0.06)] flex items-center justify-center">
                    <Layers className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                    <code className="text-[10px] text-[#06B6D4] font-mono">{p.key}</code>
                  </div>
                </div>
                <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider border shrink-0 ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">{p.description}</p>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-500/10 text-slate-400">{CATEGORY_LABELS[p.category]}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-400/10 text-violet-400">v{p.version}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-400/10 text-emerald-400">{p.component_keys.length} components</span>
              </div>
              {p.layout_rules && (
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-[rgba(255,255,255,0.04)]">
                  <p className="text-[10px] text-slate-500 font-mono">{p.layout_rules}</p>
                </div>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(255,255,255,0.04)]">
                <span className="text-[10px] text-slate-600">{p.owner}</span>
                <span className="text-[10px] text-slate-600">{p.usage_count} uses</span>
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
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"><XCircle className="w-4 h-4" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Key</p><code className="text-sm text-[#06B6D4] font-mono">{selected.key}</code></div>
                <div><p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Version</p><p className="text-sm text-white">v{selected.version}</p></div>
                <div><p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Category</p><p className="text-sm text-white">{CATEGORY_LABELS[selected.category]}</p></div>
                <div><p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Owner</p><p className="text-sm text-white">{selected.owner}</p></div>
              </div>
              <p className="text-sm text-slate-300">{selected.description}</p>
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Components ({selected.component_keys.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.component_keys.map((ck) => (
                    <code key={ck} className="text-[10px] text-emerald-400 font-mono bg-emerald-400/5 px-2 py-0.5 rounded">{ck}</code>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-[rgba(255,255,255,0.06)]">
                <button className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] text-slate-300 rounded-xl text-sm font-medium hover:bg-white/[0.08] transition-all cursor-pointer whitespace-nowrap">Edit</button>
                <button className="flex-1 px-4 py-2.5 bg-[#06B6D4] text-white rounded-xl text-sm font-medium hover:bg-[#0891B2] transition-all cursor-pointer whitespace-nowrap">Use Pattern</button>
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
        <Link href="/admin/email/design-system/components" className="flex items-center gap-3 px-4 py-3 bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl hover:border-[#06B6D4]/30 transition-all cursor-pointer group">
          <Component className="w-4 h-4 text-slate-500 group-hover:text-[#06B6D4] transition-colors" />
          <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Components</span>
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