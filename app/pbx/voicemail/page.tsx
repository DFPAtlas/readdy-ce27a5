'use client';

import PBXShell from '@/components/pbx/PBXShell';
import PBXStatusBadge from '@/components/pbx/PBXStatusBadge';
import PBXDetailDrawer, { DetailRow } from '@/components/pbx/PBXDetailDrawer';
import { useState } from 'react';
import { Voicemail, Play, Eye, UserPlus, CheckCircle, Archive, MessageSquare, Ticket } from 'lucide-react';

// TODO: Replace with Supabase - pbx_voicemails table
const mockVoicemails = [
  { id: '1', caller: '+44 20 7946 0456', callerName: 'Sarah Williams', calledNumber: '+44 20 7946 0100', time: '2026-07-03 14:05', duration: '0:48', assignedUser: '—', status: 'new', transcription: 'done', aiSummary: 'done' },
  { id: '2', caller: '+44 20 7946 0234', callerName: 'Unknown', calledNumber: '+44 20 7946 0100', time: '2026-07-03 11:20', duration: '1:12', assignedUser: 'John Doe', status: 'listened', transcription: 'done', aiSummary: 'done' },
  { id: '3', caller: '+44 20 7946 0789', callerName: 'TechCorp Ltd', calledNumber: '+44 20 7946 0100', time: '2026-07-02 16:45', duration: '0:35', assignedUser: 'Sarah Johnson', status: 'actioned', transcription: 'done', aiSummary: 'done' },
  { id: '4', caller: '+1 212 555 0199', callerName: 'James Wilson', calledNumber: '+44 20 7946 0101', time: '2026-07-02 09:15', duration: '2:05', assignedUser: '—', status: 'new', transcription: 'pending', aiSummary: 'none' },
  { id: '5', caller: '+44 20 7946 0321', callerName: 'Unknown', calledNumber: '+44 20 7946 0101', time: '2026-07-01 15:30', duration: '0:22', assignedUser: 'Mike Chen', status: 'archived', transcription: 'done', aiSummary: 'done' },
];

export default function PBXVoicemailPage() {
  const [voicemails, setVoicemails] = useState(mockVoicemails);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? voicemails : voicemails.filter(v => v.status === filter);

  const updateStatus = (id: string, status: string) => {
    setVoicemails(voicemails.map(v => v.id === id ? { ...v, status } : v));
  };

  return (
    <PBXShell>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-white">Voicemail</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage voicemail messages</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[
            { value: 'all', label: 'All' },
            { value: 'new', label: 'New' },
            { value: 'listened', label: 'Listened' },
            { value: 'actioned', label: 'Actioned' },
            { value: 'archived', label: 'Archived' },
          ].map(tab => (
            <button key={tab.value} onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${filter === tab.value ? 'bg-[#06B6D4]/15 text-[#06B6D4]' : 'text-slate-400 bg-white/[0.03] hover:bg-white/5'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((vm) => (
            <div key={vm.id} className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-4 hover:border-[rgba(255,255,255,0.10)] transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Voicemail className="w-4 h-4 text-[#F59E0B]" />
                  <div>
                    <p className="text-sm font-medium text-white">{vm.callerName}</p>
                    <p className="text-xs text-slate-500 font-mono">{vm.caller}</p>
                  </div>
                </div>
                <PBXStatusBadge status={vm.status} />
              </div>
              <div className="space-y-1.5 text-xs mb-3">
                <div className="flex justify-between"><span className="text-slate-500">To</span><span className="text-slate-300 font-mono">{vm.calledNumber}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Time</span><span className="text-slate-300">{vm.time}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Duration</span><span className="text-slate-300">{vm.duration}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Assigned</span><span className="text-slate-300">{vm.assignedUser}</span></div>
              </div>
              <div className="flex items-center gap-1 pt-3 border-t border-[rgba(255,255,255,0.04)]">
                <button className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-[#06B6D4] hover:bg-white/5 cursor-pointer" title="Play"><Play className="w-3.5 h-3.5" /></button>
                <button onClick={() => { setSelected(vm); setDetailOpen(true); }} className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-[#F59E0B] hover:bg-white/5 cursor-pointer" title="View"><Eye className="w-3.5 h-3.5" /></button>
                <button onClick={() => updateStatus(vm.id, 'listened')} className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-[#10B981] hover:bg-white/5 cursor-pointer" title="Mark Listened"><CheckCircle className="w-3.5 h-3.5" /></button>
                <button onClick={() => updateStatus(vm.id, 'archived')} className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-slate-300 hover:bg-white/5 cursor-pointer ml-auto" title="Archive"><Archive className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Voicemail className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No voicemails found</p>
          </div>
        )}

        <PBXDetailDrawer open={detailOpen} onClose={() => setDetailOpen(false)} title="Voicemail Details">
          {selected && (
            <div className="space-y-5">
              <div>
                <p className="text-lg font-bold text-white">{selected.callerName}</p>
                <p className="text-sm text-slate-400 font-mono">{selected.caller}</p>
              </div>
              <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Message Info</h4>
                <DetailRow label="Called Number" value={selected.calledNumber} mono />
                <DetailRow label="Duration" value={selected.duration} />
                <DetailRow label="Status" value={<PBXStatusBadge status={selected.status} />} />
                <DetailRow label="Assigned To" value={selected.assignedUser} />
                <DetailRow label="Transcription" value={selected.transcription === 'done' ? 'Complete' : 'Pending'} />
                <DetailRow label="AI Summary" value={selected.aiSummary === 'done' ? 'Caller following up on contract renewal. Urgent callback requested.' : 'None'} />
              </div>
              <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Transcription</h4>
                <p className="text-sm text-slate-300 leading-relaxed">
                  &quot;Hi, this is Sarah Williams calling about the contract renewal we discussed last week. I need to get the updated pricing by end of day tomorrow. Please call me back on this number. Thanks.&quot;
                </p>
              </div>
              <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-slate-300 border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] transition-colors cursor-pointer"><MessageSquare className="w-3 h-3" /> Send SMS</button>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-slate-300 border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] transition-colors cursor-pointer"><Ticket className="w-3 h-3" /> Create Ticket</button>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-slate-300 border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] transition-colors cursor-pointer"><UserPlus className="w-3 h-3" /> Assign User</button>
                </div>
              </div>
            </div>
          )}
        </PBXDetailDrawer>
      </div>
    </PBXShell>
  );
}