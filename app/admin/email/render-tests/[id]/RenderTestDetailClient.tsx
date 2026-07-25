'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Monitor, CheckCircle2, AlertTriangle, XCircle, Clock, Zap,
  ArrowLeft, ChevronDown, ZoomIn, Maximize2, Columns2, Layers,
  Image, Eye, EyeOff, Sun, Moon, Smartphone, Monitor as MonitorIcon,
  MessageSquare, ShieldCheck, ThumbsUp, ThumbsDown, RotateCcw,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  waiting: { label: 'Waiting', color: 'text-slate-400', bg: 'bg-slate-400/10', icon: Clock },
  running: { label: 'Running', color: 'text-sky-400', bg: 'bg-sky-400/10', icon: Zap },
  passed: { label: 'Passed', color: 'text-emerald-400', bg: 'bg-emerald-400/10', icon: CheckCircle2 },
  warning: { label: 'Warning', color: 'text-amber-400', bg: 'bg-amber-400/10', icon: AlertTriangle },
  failed: { label: 'Failed', color: 'text-red-400', bg: 'bg-red-400/10', icon: XCircle },
  unavailable: { label: 'Unavailable', color: 'text-slate-500', bg: 'bg-slate-500/10', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'text-slate-500', bg: 'bg-slate-500/10', icon: XCircle },
};

const TEST = {
  id: '2',
  name: 'Monthly Newsletter - Full Matrix',
  status: 'needs_review',
  source_type: 'campaign',
  source_name: 'July Newsletter',
  source_version: 'v4.2',
  language: 'en',
  locale: 'en-GB',
  sample_profile: 'Default Profile',
  preset: 'full',
  created_at: '2026-07-18T10:15:00Z',
  completed_at: '2026-07-18T10:28:00Z',
  summary: { total: 16, passed: 12, warning: 3, failed: 1, baseline_count: 8 },
};

const MOCK_RESULTS = [
  { id: '1', client_key: 'gmail_web', client_name: 'Gmail Web', platform: 'web', mode: 'light', image_state: 'enabled', status: 'passed', diff_percentage: 0.3, issue_count: 0, test_time: 12 },
  { id: '2', client_key: 'gmail_web_dark', client_name: 'Gmail Web', platform: 'web', mode: 'dark', image_state: 'enabled', status: 'warning', diff_percentage: 4.2, issue_count: 2, test_time: 14 },
  { id: '3', client_key: 'outlook_web', client_name: 'Outlook Web', platform: 'web', mode: 'light', image_state: 'enabled', status: 'passed', diff_percentage: 0.8, issue_count: 0, test_time: 15 },
  { id: '4', client_key: 'outlook_win', client_name: 'Outlook Windows', platform: 'desktop', mode: 'light', image_state: 'enabled', status: 'failed', diff_percentage: 18.7, issue_count: 5, test_time: 22 },
  { id: '5', client_key: 'outlook_mac', client_name: 'Outlook macOS', platform: 'desktop', mode: 'light', image_state: 'enabled', status: 'passed', diff_percentage: 1.1, issue_count: 0, test_time: 18 },
  { id: '6', client_key: 'apple_mail', client_name: 'Apple Mail', platform: 'desktop', mode: 'light', image_state: 'enabled', status: 'warning', diff_percentage: 3.5, issue_count: 1, test_time: 16 },
  { id: '7', client_key: 'apple_mail_dark', client_name: 'Apple Mail', platform: 'desktop', mode: 'dark', image_state: 'enabled', status: 'passed', diff_percentage: 0.9, issue_count: 0, test_time: 18 },
  { id: '8', client_key: 'thunderbird', client_name: 'Thunderbird', platform: 'desktop', mode: 'light', image_state: 'enabled', status: 'passed', diff_percentage: 2.0, issue_count: 0, test_time: 19 },
  { id: '9', client_key: 'yahoo_web', client_name: 'Yahoo Mail', platform: 'web', mode: 'light', image_state: 'enabled', status: 'passed', diff_percentage: 1.5, issue_count: 0, test_time: 13 },
  { id: '10', client_key: 'gmail_android', client_name: 'Gmail Android', platform: 'mobile', mode: 'light', image_state: 'enabled', status: 'warning', diff_percentage: 3.8, issue_count: 2, test_time: 16 },
  { id: '11', client_key: 'gmail_ios', client_name: 'Gmail iOS', platform: 'mobile', mode: 'light', image_state: 'enabled', status: 'passed', diff_percentage: 1.2, issue_count: 0, test_time: 15 },
  { id: '12', client_key: 'apple_iphone', client_name: 'Apple Mail iPhone', platform: 'mobile', mode: 'light', image_state: 'enabled', status: 'passed', diff_percentage: 0.5, issue_count: 0, test_time: 14 },
  { id: '13', client_key: 'apple_ipad', client_name: 'Apple Mail iPad', platform: 'mobile', mode: 'light', image_state: 'enabled', status: 'passed', diff_percentage: 0.7, issue_count: 0, test_time: 17 },
  { id: '14', client_key: 'outlook_android', client_name: 'Outlook Android', platform: 'mobile', mode: 'light', image_state: 'enabled', status: 'passed', diff_percentage: 1.8, issue_count: 0, test_time: 20 },
  { id: '15', client_key: 'outlook_ios', client_name: 'Outlook iOS', platform: 'mobile', mode: 'light', image_state: 'enabled', status: 'passed', diff_percentage: 1.4, issue_count: 0, test_time: 19 },
  { id: '16', client_key: 'samsung_email', client_name: 'Samsung Email', platform: 'mobile', mode: 'light', image_state: 'enabled', status: 'unavailable', diff_percentage: 0, issue_count: 0, test_time: 0 },
];

export default function RenderTestDetailClient({ params }: { params: { id: string } }) {
  const [viewMode, setViewMode] = useState<'grid' | 'detail'>('grid');
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState<'side_by_side' | 'overlay' | 'diff'>('side_by_side');
  const [reviewNote, setReviewNote] = useState('');

  const testStatus = STATUS_CONFIG[TEST.status];
  const TestStatusIcon = testStatus.icon;

  const filteredByPlatform = (platform: string) => MOCK_RESULTS.filter((r) => r.platform === platform);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/email/render-tests" className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">{TEST.name}</h1>
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold ${testStatus.color} ${testStatus.bg}`}>
              <TestStatusIcon className="w-3 h-3" />
              {testStatus.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {TEST.source_name} · {TEST.language?.toUpperCase()} · {TEST.preset} · {TEST.source_version}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-xl text-sm font-medium hover:bg-amber-400/20 transition-all cursor-pointer whitespace-nowrap">
            <ThumbsDown className="w-4 h-4" />
            Request Changes
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-400/20 transition-all cursor-pointer whitespace-nowrap">
            <ThumbsUp className="w-4 h-4" />
            Approve
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Total Clients</p>
          <p className="text-2xl font-bold text-white">{TEST.summary.total}</p>
        </div>
        <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Passed</p>
          <p className="text-2xl font-bold text-emerald-400">{TEST.summary.passed}</p>
        </div>
        <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Warnings</p>
          <p className="text-2xl font-bold text-amber-400">{TEST.summary.warning}</p>
        </div>
        <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Failed</p>
          <p className="text-2xl font-bold text-red-400">{TEST.summary.failed}</p>
        </div>
        <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">Baselines</p>
          <p className="text-2xl font-bold text-violet-400">{TEST.summary.baseline_count}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${viewMode === 'grid' ? 'bg-violet-400/10 text-violet-400' : 'text-slate-400 hover:text-white'}`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode('detail')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${viewMode === 'detail' ? 'bg-violet-400/10 text-violet-400' : 'text-slate-400 hover:text-white'}`}
          >
            Detail View
          </button>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400" /> Passed
          <span className="w-2 h-2 rounded-full bg-amber-400 ml-2" /> Warning
          <span className="w-2 h-2 rounded-full bg-red-400 ml-2" /> Failed
          <span className="w-2 h-2 rounded-full bg-slate-600 ml-2" /> Unavailable
        </div>
      </div>

      <div className="space-y-6">
        {['web', 'desktop', 'mobile'].map((platform) => {
          const results = filteredByPlatform(platform);
          if (results.length === 0) return null;
          const platformLabel = platform === 'web' ? 'Web Clients' : platform === 'desktop' ? 'Desktop Clients' : 'Mobile Clients';
          const PlatformIcon = platform === 'web' ? MonitorIcon : platform === 'desktop' ? MonitorIcon : Smartphone;
          return (
            <div key={platform}>
              <div className="flex items-center gap-2 mb-3">
                <PlatformIcon className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-white">{platformLabel}</h3>
                <span className="text-xs text-slate-500">({results.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {results.map((r) => {
                  const rs = STATUS_CONFIG[r.status];
                  const RIcon = rs.icon;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedResult(selectedResult === r.id ? null : r.id)}
                      className={`bg-[#121215] border rounded-xl p-3 text-left transition-all cursor-pointer ${
                        selectedResult === r.id ? 'border-violet-400/50 ring-1 ring-violet-400/20' : 'border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-white">{r.client_name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {r.mode === 'dark' ? 'Dark Mode' : 'Light'} · {r.image_state === 'blocked' ? 'Images Off' : 'Images On'}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${rs.color} ${rs.bg}`}>
                          <RIcon className="w-2.5 h-2.5" />
                          {rs.label}
                        </span>
                      </div>
                      <div className="aspect-[4/3] bg-white/[0.02] border border-[rgba(255,255,255,0.04)] rounded-lg overflow-hidden mb-2 flex items-center justify-center">
                        <div className="text-center p-4">
                          <Image className="w-8 h-8 text-slate-600 mx-auto mb-1" />
                          <p className="text-[10px] text-slate-500">Screenshot</p>
                          <p className="text-[9px] text-slate-600">{r.client_key}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">
                          {r.diff_percentage > 0 ? `${r.diff_percentage}% diff` : 'Baseline'}
                        </span>
                        {r.issue_count > 0 && (
                          <span className="text-amber-400">{r.issue_count} issue{r.issue_count > 1 ? 's' : ''}</span>
                        )}
                        <span className="text-slate-600">{r.test_time}s</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selectedResult && (
        <div className="bg-[#121215] border border-violet-400/20 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-white">Screenshot Viewer</h3>
              <span className="text-xs text-slate-500">{MOCK_RESULTS.find((r) => r.id === selectedResult)?.client_name}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCompareMode('side_by_side')}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-all cursor-pointer ${compareMode === 'side_by_side' ? 'bg-violet-400/10 text-violet-400' : 'text-slate-400 hover:text-white'}`}
                title="Side by Side"
              >
                <Columns2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCompareMode('overlay')}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-all cursor-pointer ${compareMode === 'overlay' ? 'bg-violet-400/10 text-violet-400' : 'text-slate-400 hover:text-white'}`}
                title="Overlay"
              >
                <Layers className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCompareMode('diff')}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-all cursor-pointer ${compareMode === 'diff' ? 'bg-violet-400/10 text-violet-400' : 'text-slate-400 hover:text-white'}`}
                title="Difference"
              >
                <Eye className="w-4 h-4" />
              </button>
              <span className="w-px h-5 bg-[rgba(255,255,255,0.08)] mx-1" />
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer" title="Zoom In">
                <ZoomIn className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer" title="Fit Width">
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-5">
            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2">
                  {compareMode === 'diff' ? 'Current Render' : 'Baseline'}
                </p>
                <div className="aspect-[4/3] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Image className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Render screenshot</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">Approved baseline v2</p>
                  </div>
                </div>
              </div>
              {compareMode === 'side_by_side' && (
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2">Current Render</p>
                  <div className="aspect-[4/3] bg-white/[0.02] border border-[rgba(255,255,255,0.06)] rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <Image className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">Current screenshot</p>
                    </div>
                  </div>
                </div>
              )}
              {compareMode === 'diff' && (
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-2">Difference Map</p>
                  <div className="aspect-[4/3] bg-red-400/[0.03] border border-red-400/10 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <Eye className="w-12 h-12 text-red-400/30 mx-auto mb-2" />
                      <p className="text-xs text-red-400/50">4.2% difference</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-white/[0.02] border border-[rgba(255,255,255,0.04)] rounded-xl">
              <h4 className="text-xs font-semibold text-white mb-2">Issues Detected</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-white">Dark mode inversion on CTA button</p>
                    <p className="text-[10px] text-slate-500">Button background inverts to light grey, causing white text to become unreadable</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-white">Logo contrast reduced in dark mode</p>
                    <p className="text-[10px] text-slate-500">Dark logo on dark background needs light-mode variant</p>
                  </div>
                </div>
              </div>
            </div>

            {TEST.status === 'needs_review' && (
              <div className="mt-4 p-4 bg-amber-400/[0.03] border border-amber-400/10 rounded-xl">
                <h4 className="text-xs font-semibold text-white mb-3">Review Decision</h4>
                <div className="flex items-center gap-3">
                  <textarea
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder="Add a review note..."
                    rows={2}
                    maxLength={500}
                    className="flex-1 px-3 py-2 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-xl text-sm text-white placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                  <div className="flex flex-col gap-2">
                    <button className="px-4 py-2 bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 rounded-xl text-xs font-semibold hover:bg-emerald-400/20 transition-all cursor-pointer whitespace-nowrap">
                      <ThumbsUp className="w-3.5 h-3.5 inline mr-1" />
                      Approve
                    </button>
                    <button className="px-4 py-2 bg-red-400/10 border border-red-400/20 text-red-400 rounded-xl text-xs font-semibold hover:bg-red-400/20 transition-all cursor-pointer whitespace-nowrap">
                      <ThumbsDown className="w-3.5 h-3.5 inline mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Link href="/admin/email/compatibility" className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] text-slate-300 rounded-xl font-medium text-sm hover:bg-white/[0.08] transition-all cursor-pointer whitespace-nowrap">
          <Zap className="w-4 h-4" /> Compatibility Report
        </Link>
        <Link href="/admin/email/render-tests" className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] text-slate-300 rounded-xl font-medium text-sm hover:bg-white/[0.08] transition-all cursor-pointer whitespace-nowrap">
          <ArrowLeft className="w-4 h-4" /> Back to Tests
        </Link>
      </div>
    </div>
  );
}