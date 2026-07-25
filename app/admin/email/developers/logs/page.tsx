'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, Search, Clock, CheckCircle2, XCircle, AlertTriangle, Activity, Filter, Shield } from 'lucide-react';

interface ApiLog {
  id: string; appName: string; keyPrefix: string; endpoint: string; method: string; statusCode: number; durationMs: number; rateLimitResult: string; errorCode: string | null; idempotencyState: string | null; created: string;
}

const MOCK_LOGS: ApiLog[] = [
  { id: 'l1', appName: 'GuardianHub API', keyPrefix: 'dfp_gapi_prod_', endpoint: '/api/email-studio/v1/transactional/send', method: 'POST', statusCode: 202, durationMs: 145, rateLimitResult: 'passed', errorCode: null, idempotencyState: 'new', created: '2026-07-20T10:45:12Z' },
  { id: 'l2', appName: 'GuardianHub API', keyPrefix: 'dfp_gapi_prod_', endpoint: '/api/email-studio/v1/templates', method: 'GET', statusCode: 200, durationMs: 87, rateLimitResult: 'passed', errorCode: null, idempotencyState: null, created: '2026-07-20T10:44:58Z' },
  { id: 'l3', appName: 'Synqoro Integration', keyPrefix: 'dfp_synq_prod_', endpoint: '/api/email-studio/v1/campaigns', method: 'POST', statusCode: 201, durationMs: 234, rateLimitResult: 'passed', errorCode: null, idempotencyState: 'conflict', created: '2026-07-20T10:43:00Z' },
  { id: 'l4', appName: 'QuickGuard Notifications', keyPrefix: 'dfp_qg_prod_', endpoint: '/api/email-studio/v1/transactional/send', method: 'POST', statusCode: 202, durationMs: 112, rateLimitResult: 'passed', errorCode: null, idempotencyState: 'new', created: '2026-07-20T10:42:30Z' },
  { id: 'l5', appName: 'n8n Automation Bridge', keyPrefix: 'dfp_n8n_prod_', endpoint: '/api/email-studio/v1/automations/trigger', method: 'POST', statusCode: 202, durationMs: 198, rateLimitResult: 'passed', errorCode: null, idempotencyState: 'new', created: '2026-07-20T10:41:00Z' },
  { id: 'l6', appName: 'Client Portal Sync', keyPrefix: 'dfp_portal_', endpoint: '/api/email-studio/v1/contacts/preferences', method: 'PUT', statusCode: 403, durationMs: 45, rateLimitResult: 'passed', errorCode: 'scope_denied', idempotencyState: null, created: '2026-07-20T10:38:00Z' },
  { id: 'l7', appName: 'GuardianHub API', keyPrefix: 'dfp_gapi_prod_sch_', endpoint: '/api/email-studio/v1/campaigns/schedule', method: 'POST', statusCode: 200, durationMs: 312, rateLimitResult: 'passed', errorCode: null, idempotencyState: null, created: '2026-07-20T10:35:00Z' },
  { id: 'l8', appName: 'Synqoro Integration', keyPrefix: 'dfp_synq_prod_', endpoint: '/api/email-studio/v1/analytics/delivery', method: 'GET', statusCode: 200, durationMs: 67, rateLimitResult: 'passed', errorCode: null, idempotencyState: null, created: '2026-07-20T10:30:00Z' },
  { id: 'l9', appName: '(unknown)', keyPrefix: 'dfp_crm_prod_', endpoint: '/api/email-studio/v1/contacts', method: 'GET', statusCode: 401, durationMs: 12, rateLimitResult: 'passed', errorCode: 'key_expired', idempotencyState: null, created: '2026-07-20T10:25:00Z' },
  { id: 'l10', appName: 'QuickGuard Notifications', keyPrefix: 'dfp_qg_prod_', endpoint: '/api/email-studio/v1/transactional/send', method: 'POST', statusCode: 429, durationMs: 5, rateLimitResult: 'exceeded', errorCode: 'rate_limit_exceeded', idempotencyState: null, created: '2026-07-20T10:24:00Z' },
  { id: 'l11', appName: 'n8n Automation Bridge', keyPrefix: 'dfp_n8n_prod_', endpoint: '/api/email-studio/v1/automations/trigger', method: 'POST', statusCode: 422, durationMs: 89, rateLimitResult: 'passed', errorCode: 'validation_failed', idempotencyState: null, created: '2026-07-20T10:20:00Z' },
  { id: 'l12', appName: 'GuardianHub API', keyPrefix: 'dfp_gapi_prod_', endpoint: '/api/email-studio/v1/transactional/send', method: 'POST', statusCode: 202, durationMs: 156, rateLimitResult: 'passed', errorCode: null, idempotencyState: 'exists', created: '2026-07-20T10:15:00Z' },
  { id: 'l13', appName: 'GuardianHub API', keyPrefix: 'dfp_gapi_prod_', endpoint: '/api/email-studio/v1/transactional/send', method: 'POST', statusCode: 400, durationMs: 23, rateLimitResult: 'passed', errorCode: 'sender_unverified', idempotencyState: null, created: '2026-07-20T10:10:00Z' },
  { id: 'l14', appName: 'QuickGuard Notifications', keyPrefix: 'dfp_qg_prod_', endpoint: '/api/email-studio/v1/transactional/send', method: 'POST', statusCode: 400, durationMs: 18, rateLimitResult: 'passed', errorCode: 'recipient_suppressed', idempotencyState: null, created: '2026-07-20T10:05:00Z' },
];

export default function DeveloperLogs() {
  const [logs] = useState<ApiLog[]>(MOCK_LOGS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = logs.filter((l) => {
    if (search && !l.appName.toLowerCase().includes(search.toLowerCase()) && !l.endpoint.toLowerCase().includes(search.toLowerCase()) && !l.keyPrefix.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === '2xx' && (l.statusCode < 200 || l.statusCode >= 300)) return false;
    if (statusFilter === '4xx' && (l.statusCode < 400 || l.statusCode >= 500)) return false;
    if (statusFilter === '5xx' && (l.statusCode < 500 || l.statusCode >= 600)) return false;
    if (statusFilter === 'rate_limit' && l.errorCode !== 'rate_limit_exceeded') return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">API Logs</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time API request logs — never includes secrets, auth headers, or restricted payloads.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/email/developers" className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] text-slate-300 rounded-xl font-semibold text-sm hover:bg-white/[0.08] transition-all cursor-pointer whitespace-nowrap">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Today', value: logs.length, color: 'text-[#06B6D4]' },
          { label: '2xx', value: logs.filter((l) => l.statusCode >= 200 && l.statusCode < 300).length, color: 'text-emerald-400' },
          { label: '4xx', value: logs.filter((l) => l.statusCode >= 400 && l.statusCode < 500).length, color: 'text-amber-400' },
          { label: 'Rate Limited', value: logs.filter((l) => l.errorCode === 'rate_limit_exceeded').length, color: 'text-orange-400' },
          { label: 'Avg Duration', value: `${Math.round(logs.reduce((s, l) => s + l.durationMs, 0) / logs.length)}ms`, color: 'text-violet-400' },
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
          <input type="text" placeholder="Search by app, endpoint or key prefix..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/30" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 pr-8 bg-white/[0.04] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 cursor-pointer">
          <option value="all" className="bg-[#1a1a1e] text-white">All Requests</option>
          <option value="2xx" className="bg-[#1a1a1e] text-white">2xx Success</option>
          <option value="4xx" className="bg-[#1a1a1e] text-white">4xx Client Error</option>
          <option value="5xx" className="bg-[#1a1a1e] text-white">5xx Server Error</option>
          <option value="rate_limit" className="bg-[#1a1a1e] text-white">Rate Limited</option>
        </select>
      </div>

      <div className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                <th className="text-left px-5 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">Time</th>
                <th className="text-left px-5 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">Application</th>
                <th className="text-left px-5 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">Method</th>
                <th className="text-left px-5 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">Endpoint</th>
                <th className="text-center px-5 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-center px-5 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">Duration</th>
                <th className="text-center px-5 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">Rate Limit</th>
                <th className="text-left px-5 py-3 text-[10px] font-medium text-slate-500 uppercase tracking-wider">Error / Idempotency</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const isError = log.statusCode >= 400;
                const isSuccess = log.statusCode >= 200 && log.statusCode < 300;
                const isSlow = log.durationMs > 200;
                return (
                  <tr key={log.id} className={`border-b border-[rgba(255,255,255,0.03)] hover:bg-white/[0.02] transition-colors ${isError ? 'bg-red-400/[0.02]' : ''}`}>
                    <td className="px-5 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">
                      {new Date(log.created).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-xs text-white truncate max-w-[120px]">{log.appName}</p>
                        <p className="text-[10px] text-slate-600 font-mono">{log.keyPrefix}••••</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                        log.method === 'GET' ? 'text-sky-400 bg-sky-400/10' :
                        log.method === 'POST' ? 'text-emerald-400 bg-emerald-400/10' :
                        log.method === 'PUT' ? 'text-amber-400 bg-amber-400/10' :
                        'text-slate-400 bg-slate-400/10'
                      }`}>{log.method}</span>
                    </td>
                    <td className="px-5 py-3">
                      <code className="text-[11px] text-slate-400 font-mono truncate max-w-[220px] block">{log.endpoint}</code>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isSuccess ? 'text-emerald-400 bg-emerald-400/10' :
                        isError ? 'text-red-400 bg-red-400/10' : 'text-slate-400 bg-slate-400/10'
                      }`}>
                        {isSuccess ? <CheckCircle2 className="w-2.5 h-2.5" /> : isError ? <XCircle className="w-2.5 h-2.5" /> : null}
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs ${isSlow ? 'text-amber-400' : 'text-slate-400'}`}>{log.durationMs}ms</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        log.rateLimitResult === 'exceeded' ? 'text-red-400 bg-red-400/10' :
                        log.rateLimitResult === 'passed' ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 bg-slate-400/10'
                      }`}>{log.rateLimitResult}</span>
                    </td>
                    <td className="px-5 py-3">
                      {log.errorCode ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-red-400 font-mono">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {log.errorCode}
                        </span>
                      ) : log.idempotencyState ? (
                        <span className={`text-[10px] font-mono ${log.idempotencyState === 'new' ? 'text-[#06B6D4]' : log.idempotencyState === 'conflict' ? 'text-amber-400' : 'text-slate-400'}`}>
                          idem: {log.idempotencyState}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}