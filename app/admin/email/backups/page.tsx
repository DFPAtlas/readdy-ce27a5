'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Archive, HardDrive, RefreshCw, CheckCircle2, XCircle,
  AlertTriangle, Clock, Search, ArrowRight, ArrowLeft,
  ShieldCheck, Download, Eye, Plus,
} from 'lucide-react';

const mockBackups = [
  { id: 'bak-001', name: 'Pre-Release v3.2.0', type: 'pre_release', status: 'valid', size: '4.8 MB', modules: 7, records: 156, createdAt: '2026-07-17 02:00', expiresAt: '2027-01-17', restoreTest: 'passed', retention: 'protected' },
  { id: 'bak-002', name: 'Weekly — Templates & Brands', type: 'scheduled', status: 'valid', size: '3.2 MB', modules: 4, records: 89, createdAt: '2026-07-14 00:00', expiresAt: '2026-08-14', restoreTest: 'passed', retention: 'weekly' },
  { id: 'bak-003', name: 'Pre-Migration — Campaigns', type: 'pre_migration', status: 'valid', size: '1.6 MB', modules: 2, records: 34, createdAt: '2026-07-10 16:30', expiresAt: '2026-10-10', restoreTest: 'not_tested', retention: 'monthly' },
  { id: 'bak-004', name: 'Complete Config (no contacts)', type: 'complete_config', status: 'valid', size: '8.1 MB', modules: 8, records: 312, createdAt: '2026-07-05 00:00', expiresAt: '2026-08-05', restoreTest: 'passed', retention: 'monthly' },
  { id: 'bak-005', name: 'Manual — Before v3.1 upgrade', type: 'manual', status: 'expired', size: '3.5 MB', modules: 5, records: 120, createdAt: '2026-06-04 11:00', expiresAt: '2026-07-04', restoreTest: 'expired', retention: 'expired' },
  { id: 'bak-006', name: 'Daily — Config Only', type: 'scheduled', status: 'valid', size: '512 KB', modules: 1, records: 18, createdAt: '2026-07-19 00:00', expiresAt: '2026-07-26', restoreTest: 'pending', retention: 'daily' },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cl: string }> = {
    valid: { label: 'Valid', cl: 'text-emerald-400 bg-emerald-400/10' },
    expired: { label: 'Expired', cl: 'text-slate-500 bg-slate-500/10' },
    passed: { label: 'Passed', cl: 'text-emerald-400 bg-emerald-400/10' },
    not_tested: { label: 'Not Tested', cl: 'text-amber-400 bg-amber-400/10' },
    pending: { label: 'Pending', cl: 'text-sky-400 bg-sky-400/10' },
    protected: { label: 'Protected', cl: 'text-violet-400 bg-violet-400/10' },
  };
  const info = map[status] || { label: status, cl: 'text-slate-400 bg-slate-400/10' };
  return <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${info.cl}`}>{info.label}</span>;
}

export default function BackupsPage() {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const validBackups = mockBackups.filter((b) => b.status === 'valid');
  const totalSize = validBackups.reduce((sum, b) => sum + parseFloat(b.size), 0);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center">
            <Archive className="w-4 h-4 text-[#06B6D4]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Backup Snapshots</h1>
            <Link href="/admin/email/portability" className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer flex items-center gap-1 mt-0.5">
              <ArrowLeft className="w-3 h-3" /> Back to Portability
            </Link>
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-1 ml-11">
          Organisation-scoped logical snapshots — configuration, templates, brands, campaigns, automations and transactional mappings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3"><Archive className="w-4 h-4 text-slate-400" /><span className="text-xs text-slate-400 uppercase tracking-wider">Snapshots</span></div>
          <p className="text-2xl font-bold text-white">{mockBackups.length}</p>
          <p className="text-xs text-slate-500 mt-1">{validBackups.length} valid</p>
        </div>
        <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3"><HardDrive className="w-4 h-4 text-slate-400" /><span className="text-xs text-slate-400 uppercase tracking-wider">Storage</span></div>
          <p className="text-2xl font-bold text-white">{totalSize.toFixed(1)} MB</p>
          <p className="text-xs text-slate-500 mt-1">Total across all valid snapshots</p>
        </div>
        <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3"><RefreshCw className="w-4 h-4 text-slate-400" /><span className="text-xs text-slate-400 uppercase tracking-wider">Restore Tests</span></div>
          <p className="text-2xl font-bold text-emerald-400">3</p>
          <p className="text-xs text-slate-500 mt-1">Passed · 1 pending · 1 not tested</p>
        </div>
        <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3"><ShieldCheck className="w-4 h-4 text-slate-400" /><span className="text-xs text-slate-400 uppercase tracking-wider">Protected</span></div>
          <p className="text-2xl font-bold text-violet-400">1</p>
          <p className="text-xs text-slate-500 mt-1">Pre-release snapshot</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search backups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20"
          />
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-black text-sm font-semibold rounded-xl hover:bg-[#22D3EE] transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Create Backup
        </button>
      </div>

      {showCreate && (
        <div className="bg-[#121215] border border-[#06B6D4]/20 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Create Backup Snapshot</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Snapshot Type</label>
              <div className="flex flex-wrap gap-2">
                {['Configuration Only', 'Templates & Brands', 'Campaign Content', 'Automations & Transactional', 'Complete Studio', 'Pre-Migration', 'Manual Named'].map((type) => (
                  <button key={type} className="px-3 py-1.5 bg-white/[0.03] border border-[rgba(255,255,255,0.06)] rounded-lg text-xs text-slate-300 hover:border-[#06B6D4]/30 transition-all cursor-pointer whitespace-nowrap">
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">Name</label>
              <input type="text" placeholder="e.g. Pre-Release v3.3.0" className="w-full px-3 py-2 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#06B6D4] text-black text-sm font-semibold rounded-xl hover:bg-[#22D3EE] transition-all cursor-pointer whitespace-nowrap">
              <ShieldCheck className="w-4 h-4" /> Create Snapshot
            </button>
            <button onClick={() => setShowCreate(false)} className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.06)]">
              <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Name</th>
              <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Type</th>
              <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Size</th>
              <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Records</th>
              <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Status</th>
              <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Restore Test</th>
              <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Retention</th>
              <th className="text-right text-xs text-slate-500 font-medium px-5 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {mockBackups.map((bak) => (
              <tr key={bak.id} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3">
                  <Link href={`/admin/email/backups/${bak.id}`} className="text-white font-medium hover:text-[#06B6D4] transition-colors cursor-pointer">
                    {bak.name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-slate-400 text-xs capitalize">{bak.type.replace(/_/g, ' ')}</td>
                <td className="px-5 py-3 text-slate-300 text-xs">{bak.size}</td>
                <td className="px-5 py-3 text-slate-300 text-xs">{bak.records}</td>
                <td className="px-5 py-3"><StatusBadge status={bak.status} /></td>
                <td className="px-5 py-3"><StatusBadge status={bak.restoreTest} /></td>
                <td className="px-5 py-3"><StatusBadge status={bak.retention} /></td>
                <td className="px-5 py-3 text-slate-500 text-xs text-right">{bak.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/email/settings/backup" className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#121215] border border-[rgba(255,255,255,0.1)] text-white text-sm font-semibold rounded-xl hover:border-[#06B6D4]/30 transition-all cursor-pointer whitespace-nowrap">
          <ShieldCheck className="w-4 h-4" /> Backup Settings
        </Link>
      </div>
    </div>
  );
}