'use client';

import PBXShell from '@/components/pbx/PBXShell';
import PBXStatusBadge from '@/components/pbx/PBXStatusBadge';
import PBXDetailDrawer, { DetailRow } from '@/components/pbx/PBXDetailDrawer';
import { useState } from 'react';
import { PhoneCall, Search, Filter, Download } from 'lucide-react';

// TODO: Replace with Supabase - pbx_call_logs, pbx_call_events, pbx_recordings tables
const mockCalls = [
  { id: '1', time: '2026-07-03 14:32', direction: 'inbound', from: '+44 20 7946 0011', to: '+44 20 7946 0100', tenantNumber: '+44 20 7946 0100', status: 'answered', duration: '4:22', cost: '£0.08', recording: true, aiSummary: 'done', n8nStatus: 'ok' },
  { id: '2', time: '2026-07-03 14:18', direction: 'outbound', from: '+44 20 7946 0100', to: '+44 20 7946 0234', tenantNumber: '+44 20 7946 0100', status: 'answered', duration: '1:05', cost: '£0.02', recording: false, aiSummary: 'done', n8nStatus: 'none' },
  { id: '3', time: '2026-07-03 14:05', direction: 'inbound', from: '+44 20 7946 0456', to: '+44 20 7946 0100', tenantNumber: '+44 20 7946 0100', status: 'missed', duration: '0:00', cost: '£0.00', recording: false, aiSummary: 'none', n8nStatus: 'ok' },
  { id: '4', time: '2026-07-03 13:52', direction: 'inbound', from: '+44 20 7946 0789', to: '+44 20 7946 0100', tenantNumber: '+44 20 7946 0100', status: 'voicemail', duration: '0:48', cost: '£0.03', recording: true, aiSummary: 'done', n8nStatus: 'ok' },
  { id: '5', time: '2026-07-03 13:30', direction: 'inbound', from: '+1 212 555 0199', to: '+44 20 7946 0100', tenantNumber: '+44 20 7946 0100', status: 'answered', duration: '12:05', cost: '£0.22', recording: true, aiSummary: 'pending', n8nStatus: 'ok' },
  { id: '6', time: '2026-07-03 12:15', direction: 'outbound', from: '+44 20 7946 0101', to: '+44 20 7946 0678', tenantNumber: '+44 20 7946 0101', status: 'answered', duration: '3:10', cost: '£0.06', recording: true, aiSummary: 'done', n8nStatus: 'error' },
  { id: '7', time: '2026-07-03 11:45', direction: 'inbound', from: '+44 20 7946 0901', to: '+44 20 7946 0101', tenantNumber: '+44 20 7946 0101', status: 'busy', duration: '0:00', cost: '£0.00', recording: false, aiSummary: 'none', n8nStatus: 'none' },
];

export default function PBXCallLogsPage() {
  const [calls] = useState(mockCalls);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filterDirection, setFilterDirection] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = calls.filter(c => {
    if (search && !c.from.includes(search) && !c.to.includes(search)) return false;
    if (filterDirection !== 'all' && c.direction !== filterDirection) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    return true;
  });

  return (
    <PBXShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-white">Call Logs</h1>
          <p className="text-sm text-slate-400 mt-0.5">View and search all call history</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Search by number..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20" />
          </div>
          <select value={filterDirection} onChange={e => setFilterDirection(e.target.value)} className="px-3 py-2.5 pr-8 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 cursor-pointer appearance-none">
            <option value="all">All Directions</option>
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 pr-8 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 cursor-pointer appearance-none">
            <option value="all">All Statuses</option>
            <option value="answered">Answered</option>
            <option value="missed">Missed</option>
            <option value="voicemail">Voicemail</option>
            <option value="busy">Busy</option>
          </select>
          <button className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm text-slate-400 border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] hover:text-white transition-colors cursor-pointer whitespace-nowrap">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-[rgba(255,255,255,0.06)]">
                  <th className="px-5 py-3 font-medium">Date/Time</th>
                  <th className="px-5 py-3 font-medium">Direction</th>
                  <th className="px-5 py-3 font-medium">From</th>
                  <th className="px-5 py-3 font-medium">To</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Duration</th>
                  <th className="px-5 py-3 font-medium">Cost</th>
                  <th className="px-5 py-3 font-medium">Recording</th>
                  <th className="px-5 py-3 font-medium">AI</th>
                  <th className="px-5 py-3 font-medium">n8n</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((call) => (
                  <tr key={call.id} onClick={() => { setSelectedCall(call); setDetailOpen(true); }} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-white/[0.02] cursor-pointer">
                    <td className="px-5 py-3 text-slate-300 text-xs font-mono">{call.time}</td>
                    <td className="px-5 py-3"><span className={`text-xs font-medium ${call.direction === 'inbound' ? 'text-[#10B981]' : 'text-[#8B5CF6]'}`}>{call.direction === 'inbound' ? '↓ In' : '↑ Out'}</span></td>
                    <td className="px-5 py-3 text-slate-300 font-mono text-xs">{call.from}</td>
                    <td className="px-5 py-3 text-slate-300 font-mono text-xs">{call.to}</td>
                    <td className="px-5 py-3"><PBXStatusBadge status={call.status} /></td>
                    <td className="px-5 py-3 text-slate-400 font-mono text-xs">{call.duration}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{call.cost}</td>
                    <td className="px-5 py-3">{call.recording ? <span className="text-[#F59E0B] text-xs">●</span> : <span className="text-slate-600 text-xs">—</span>}</td>
                    <td className="px-5 py-3"><span className={`text-[10px] font-medium ${call.aiSummary === 'done' ? 'text-[#10B981]' : call.aiSummary === 'pending' ? 'text-[#F59E0B]' : 'text-slate-500'}`}>{call.aiSummary === 'done' ? 'Done' : call.aiSummary === 'pending' ? 'Pending' : '—'}</span></td>
                    <td className="px-5 py-3">{call.n8nStatus === 'ok' ? <span className="text-[#10B981] text-xs">● OK</span> : call.n8nStatus === 'error' ? <span className="text-[#EF4444] text-xs">● Error</span> : <span className="text-slate-600 text-xs">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <PBXDetailDrawer open={detailOpen} onClose={() => setDetailOpen(false)} title="Call Details">
          {selectedCall && (
            <div className="space-y-5">
              <div>
                <p className="text-sm text-slate-400">Call from</p>
                <p className="text-lg font-bold text-white font-mono">{selectedCall.from}</p>
                <p className="text-sm text-slate-400">to {selectedCall.to}</p>
              </div>
              <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Call Info</h4>
                <DetailRow label="Direction" value={selectedCall.direction === 'inbound' ? 'Inbound' : 'Outbound'} />
                <DetailRow label="Duration" value={selectedCall.duration} mono />
                <DetailRow label="Status" value={<PBXStatusBadge status={selectedCall.status} />} />
                <DetailRow label="Cost" value={selectedCall.cost} />
                <DetailRow label="Twilio CallSid" value="CAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" mono />
              </div>
              <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Call Timeline</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex gap-3"><span className="text-slate-500 font-mono w-12 shrink-0">14:32:05</span><span className="text-slate-300">Call initiated — inbound from {selectedCall.from}</span></div>
                  <div className="flex gap-3"><span className="text-slate-500 font-mono w-12 shrink-0">14:32:07</span><span className="text-slate-300">Routed to Sales Ring Group</span></div>
                  <div className="flex gap-3"><span className="text-slate-500 font-mono w-12 shrink-0">14:32:10</span><span className="text-slate-300">Answered by John Doe (Ext 101)</span></div>
                  <div className="flex gap-3"><span className="text-slate-500 font-mono w-12 shrink-0">14:36:27</span><span className="text-slate-300">Call ended</span></div>
                </div>
              </div>
              <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">AI & Automation</h4>
                <DetailRow label="AI Summary" value={selectedCall.aiSummary === 'done' ? 'Caller enquired about enterprise pricing. Lead qualified — high intent.' : 'Pending'} />
                <DetailRow label="Intent" value="Sales Enquiry" />
                <DetailRow label="Lead Score" value="85/100" />
                <DetailRow label="n8n Workflow" value={selectedCall.n8nStatus === 'ok' ? 'Lead Capture — Success' : selectedCall.n8nStatus === 'error' ? 'Failed' : 'None'} />
              </div>
            </div>
          )}
        </PBXDetailDrawer>
      </div>
    </PBXShell>
  );
}