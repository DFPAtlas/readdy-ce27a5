'use client';

import PBXShell from '@/components/pbx/PBXShell';
import PBXStatusBadge from '@/components/pbx/PBXStatusBadge';
import PBXUsageMeter from '@/components/pbx/PBXUsageMeter';
import PBXCrudModal, { ModalField, ModalInput, ModalSelect } from '@/components/pbx/PBXCrudModal';
import { useState } from 'react';
import { MessageSquare, Plus, Pencil } from 'lucide-react';

// TODO: Replace with Supabase - pbx_sms_messages table
const mockMessages = [
  { id: '1', time: '2026-07-03 15:10', direction: 'inbound', from: '+44 7700 900111', to: '+44 20 7946 0100', preview: 'Hi, do you offer weekend support?', status: 'received', relatedCall: 'none', n8nStatus: 'none' },
  { id: '2', time: '2026-07-03 14:55', direction: 'outbound', from: '+44 20 7946 0100', to: '+44 7700 900111', preview: 'Yes, we offer 24/7 support for Business and Pro plans.', status: 'delivered', relatedCall: 'none', n8nStatus: 'ok' },
  { id: '3', time: '2026-07-03 14:05', direction: 'outbound', from: '+44 20 7946 0100', to: '+44 20 7946 0456', preview: 'Sorry we missed your call! We will get back to you shortly.', status: 'delivered', relatedCall: 'missed', n8nStatus: 'ok' },
  { id: '4', time: '2026-07-03 11:30', direction: 'inbound', from: '+44 7700 900222', to: '+44 20 7946 0101', preview: 'Invoice #INV-2045 paid. Please confirm receipt.', status: 'received', relatedCall: 'none', n8nStatus: 'ok' },
  { id: '5', time: '2026-07-02 16:20', direction: 'outbound', from: '+44 20 7946 0101', to: '+44 7700 900333', preview: 'Your appointment is confirmed for July 5th at 10:00 AM.', status: 'delivered', relatedCall: 'none', n8nStatus: 'ok' },
];

const smsTemplates = [
  { id: '1', name: 'Missed Call Auto-reply', trigger: 'missed_call', body: 'Sorry we missed your call! We will get back to you shortly.', active: true, optOutFooter: true },
  { id: '2', name: 'Voicemail Received', trigger: 'voicemail', body: 'We received your voicemail. A team member will follow up within 2 hours.', active: true, optOutFooter: true },
  { id: '3', name: 'Appointment Follow-up', trigger: 'appointment', body: 'Your appointment is confirmed. Reply STOP to opt out.', active: true, optOutFooter: true },
  { id: '4', name: 'Lead Follow-up', trigger: 'lead', body: 'Thanks for your interest! Would you like to schedule a demo?', active: false, optOutFooter: true },
  { id: '5', name: 'Support Acknowledgement', trigger: 'support', body: 'Your support ticket has been created. Reference: #TICKET_ID', active: true, optOutFooter: true },
];

export default function PBXSMSPage() {
  const [messages] = useState(mockMessages);
  const [templates, setTemplates] = useState(smsTemplates);
  const [templateOpen, setTemplateOpen] = useState(false);

  return (
    <PBXShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">SMS</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage SMS messages and templates</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-4 text-center">
            <p className="text-2xl font-bold text-white">1,240</p>
            <p className="text-xs text-slate-400">Sent This Month</p>
          </div>
          <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-4 text-center">
            <p className="text-2xl font-bold text-white">386</p>
            <p className="text-xs text-slate-400">Received This Month</p>
          </div>
          <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-4 text-center">
            <p className="text-2xl font-bold text-[#06B6D4]">£12.40</p>
            <p className="text-xs text-slate-400">Estimated Cost</p>
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">SMS Inbox</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-[rgba(255,255,255,0.06)]">
                  <th className="px-4 py-2.5 font-medium">Time</th>
                  <th className="px-4 py-2.5 font-medium">Direction</th>
                  <th className="px-4 py-2.5 font-medium">From</th>
                  <th className="px-4 py-2.5 font-medium">To</th>
                  <th className="px-4 py-2.5 font-medium">Message</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Call</th>
                  <th className="px-4 py-2.5 font-medium">n8n</th>
                </tr>
              </thead>
              <tbody>
                {messages.map(msg => (
                  <tr key={msg.id} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5 text-slate-400 text-xs font-mono">{msg.time}</td>
                    <td className="px-4 py-2.5"><span className={`text-xs ${msg.direction === 'inbound' ? 'text-[#10B981]' : 'text-[#8B5CF6]'}`}>{msg.direction === 'inbound' ? '↓ In' : '↑ Out'}</span></td>
                    <td className="px-4 py-2.5 text-slate-300 font-mono text-xs">{msg.from}</td>
                    <td className="px-4 py-2.5 text-slate-300 font-mono text-xs">{msg.to}</td>
                    <td className="px-4 py-2.5 text-slate-300 text-xs max-w-[200px] truncate">{msg.preview}</td>
                    <td className="px-4 py-2.5"><PBXStatusBadge status={msg.status} /></td>
                    <td className="px-4 py-2.5 text-slate-500 text-xs">{msg.relatedCall === 'none' ? '—' : msg.relatedCall}</td>
                    <td className="px-4 py-2.5">{msg.n8nStatus === 'ok' ? <span className="text-[#10B981] text-xs">OK</span> : <span className="text-slate-600 text-xs">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">SMS Templates</h3>
            <button onClick={() => setTemplateOpen(true)} className="flex items-center gap-1 text-xs text-[#06B6D4] hover:underline cursor-pointer"><Plus className="w-3 h-3" /> Add Template</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.map(t => (
              <div key={t.id} className="bg-white/[0.02] rounded-lg p-3 border border-[rgba(255,255,255,0.03)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-white">{t.name}</span>
                  <div className="flex items-center gap-1.5">
                    {t.active ? <span className="text-[#10B981] text-[10px]">Active</span> : <span className="text-slate-500 text-[10px]">Inactive</span>}
                    <button onClick={() => setTemplateOpen(true)} className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-[#F59E0B] cursor-pointer"><Pencil className="w-3 h-3" /></button>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-1">{t.body}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">Trigger: {t.trigger.replace(/_/g, ' ')}</span>
                  {t.optOutFooter && <span className="text-[10px] text-slate-600 bg-white/[0.03] px-1.5 py-0.5 rounded">Opt-out included</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
          <h3 className="text-sm font-semibold text-white mb-4">SMS Usage</h3>
          <div className="space-y-3">
            <PBXUsageMeter label="Plan Allowance" used={1240} total={2000} unit=" msgs" color="#06B6D4" />
            <PBXUsageMeter label="Sent" used={890} total={1240} unit=" msgs" color="#8B5CF6" />
            <PBXUsageMeter label="Received" used={350} total={1240} unit=" msgs" color="#10B981" />
          </div>
          <div className="mt-4 p-3 rounded-lg bg-[#F97316]/5 border border-[#F97316]/10">
            <p className="text-xs text-[#F97316]">You have used 62% of your monthly SMS allowance with 23 days remaining.</p>
          </div>
        </div>

        <PBXCrudModal open={templateOpen} onClose={() => setTemplateOpen(false)} title="SMS Template">
          <form onSubmit={(e) => { e.preventDefault(); setTemplateOpen(false); }}>
            <ModalField label="Template Name" required><ModalInput placeholder="Missed Call Auto-reply" /></ModalField>
            <ModalField label="Message Body" required><textarea maxLength={500} className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 resize-none h-20" /></ModalField>
            <ModalField label="Trigger Type"><ModalSelect value="missed_call" onChange={() => {}} options={[{ value: 'missed_call', label: 'Missed Call' }, { value: 'voicemail', label: 'Voicemail Received' }, { value: 'appointment', label: 'Appointment Follow-up' }, { value: 'lead', label: 'Lead Follow-up' }, { value: 'support', label: 'Support Acknowledgement' }]} /></ModalField>
            <label className="flex items-center gap-2 py-2 cursor-pointer"><input type="checkbox" defaultChecked className="rounded border-slate-600 bg-white/[0.03]" /><span className="text-sm text-slate-300">Include opt-out footer</span></label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setTemplateOpen(false)} className="px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors cursor-pointer whitespace-nowrap">Save</button>
            </div>
          </form>
        </PBXCrudModal>
      </div>
    </PBXShell>
  );
}