'use client';

import PBXShell from '@/components/pbx/PBXShell';
import PBXCrudModal, { ModalField, ModalInput, ModalToggle, ModalSelect } from '@/components/pbx/PBXCrudModal';
import PBXStatusBadge from '@/components/pbx/PBXStatusBadge';
import PBXUsageMeter from '@/components/pbx/PBXUsageMeter';
import { useState } from 'react';
import { Bot, Shield, Plus, Pencil, Trash2, Play } from 'lucide-react';

// TODO: Replace with Supabase - pbx_ai_agents, pbx_token_usage tables
const mockTransfers = [
  { id: '1', name: 'Sales Team', type: 'Ring group', destination: 'Sales Ring Group', status: 'active' },
  { id: '2', name: 'John Doe', type: 'User', destination: 'Ext 101', status: 'active' },
  { id: '3', name: 'Support Line', type: 'External number', destination: '+44 20 7946 0958', status: 'active' },
];

const mockSmsTemplates = [
  { id: '1', name: 'Missed Call Auto-reply', body: 'Sorry we missed your call! We will get back to you shortly.', trigger: 'missed_call', status: 'active' },
  { id: '2', name: 'Voicemail Received', body: 'We received your voicemail. A team member will follow up within 2 hours.', trigger: 'voicemail', status: 'active' },
];

const allowedActions = [
  { key: 'summarise_calls', label: 'Summarise calls', checked: true },
  { key: 'summarise_voicemails', label: 'Summarise voicemails', checked: true },
  { key: 'detect_intent', label: 'Detect caller intent', checked: true },
  { key: 'score_leads', label: 'Score leads', checked: true },
  { key: 'route_users', label: 'Route to approved users', checked: true },
  { key: 'send_sms', label: 'Send approved SMS templates', checked: false },
  { key: 'create_ticket', label: 'Create support ticket via n8n', checked: true },
  { key: 'trigger_workflow', label: 'Trigger approved n8n workflow', checked: true },
];

const blockedActions = [
  'Cannot call arbitrary numbers',
  'Cannot change billing',
  'Cannot delete customer data',
  'Cannot expose recordings to unauthorised users',
  'Cannot bypass tenant permissions',
  'Cannot send unapproved SMS',
  'Cannot route to unapproved destinations',
];

export default function PBXAIReceptionistPage() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState('off');
  const [greeting, setGreeting] = useState('Hello! Thank you for calling Acme Corp. How can I help you today?');
  const [businessDesc, setBusinessDesc] = useState('We provide enterprise SaaS solutions for businesses of all sizes.');
  const [voice, setVoice] = useState('professional_female');
  const [language, setLanguage] = useState('en-GB');
  const [actions, setActions] = useState(allowedActions);
  const [transfers, setTransfers] = useState(mockTransfers);
  const [smsTemplates, setSmsTemplates] = useState(mockSmsTemplates);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({ name: '', type: 'User', destination: '', status: 'active' });
  const [editTransferId, setEditTransferId] = useState<string | null>(null);
  const [smsOpen, setSmsOpen] = useState(false);
  const [smsForm, setSmsForm] = useState({ name: '', body: '', trigger: 'missed_call', status: 'active' });
  const [editSmsId, setEditSmsId] = useState<string | null>(null);

  const toggleAction = (key: string) => {
    setActions(actions.map(a => a.key === key ? { ...a, checked: !a.checked } : a));
  };

  const saveTransfer = () => {
    if (!transferForm.name || !transferForm.destination) return;
    if (editTransferId) {
      setTransfers(transfers.map(t => t.id === editTransferId ? { ...t, ...transferForm } : t));
    } else {
      setTransfers([...transfers, { id: String(Date.now()), ...transferForm }]);
    }
    setTransferOpen(false);
    setEditTransferId(null);
    setTransferForm({ name: '', type: 'User', destination: '', status: 'active' });
  };

  const deleteTransfer = (id: string) => { setTransfers(transfers.filter(t => t.id !== id)); };

  const saveSms = () => {
    if (!smsForm.name || !smsForm.body) return;
    if (editSmsId) {
      setSmsTemplates(smsTemplates.map(t => t.id === editSmsId ? { ...t, ...smsForm } : t));
    } else {
      setSmsTemplates([...smsTemplates, { id: String(Date.now()), ...smsForm }]);
    }
    setSmsOpen(false);
    setEditSmsId(null);
    setSmsForm({ name: '', body: '', trigger: 'missed_call', status: 'active' });
  };

  const deleteSms = (id: string) => { setSmsTemplates(smsTemplates.filter(t => t.id !== id)); };

  return (
    <PBXShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">AI Receptionist</h1>
          <p className="text-sm text-slate-400 mt-0.5">Configure your AI-powered virtual receptionist</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#EC4899]/10 flex items-center justify-center"><Bot className="w-5 h-5 text-[#EC4899]" /></div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">AI Receptionist Status</h3>
                    <p className="text-xs text-slate-400">{enabled ? (mode === 'assist' ? 'Assist Mode' : 'Live Receptionist') : 'Off'}</p>
                  </div>
                </div>
                <button onClick={() => setEnabled(!enabled)} className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${enabled ? 'bg-[#EC4899]' : 'bg-white/10'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              {enabled && (
                <div className="flex gap-2">
                  {['assist', 'live'].map(m => (
                    <button key={m} onClick={() => setMode(m)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${mode === m ? 'bg-[#EC4899]/15 text-[#EC4899] border border-[#EC4899]/20' : 'text-slate-400 bg-white/[0.03] border border-[rgba(255,255,255,0.06)]'}`}>
                      {m === 'assist' ? 'Assist Only' : 'Live Receptionist'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Greeting & Personality</h3>
              <ModalField label="Greeting Message"><textarea value={greeting} onChange={e => setGreeting(e.target.value)} maxLength={500} className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#EC4899]/20 resize-none h-20" /></ModalField>
              <ModalField label="Business Description"><textarea value={businessDesc} onChange={e => setBusinessDesc(e.target.value)} maxLength={500} className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#EC4899]/20 resize-none h-16" /></ModalField>
              <div className="grid grid-cols-2 gap-3">
                <ModalField label="Voice / Personality"><ModalSelect value={voice} onChange={setVoice} options={[{ value: 'professional_female', label: 'Professional Female' }, { value: 'professional_male', label: 'Professional Male' }, { value: 'friendly_female', label: 'Friendly Female' }]} /></ModalField>
                <ModalField label="Language"><ModalSelect value={language} onChange={setLanguage} options={[{ value: 'en-GB', label: 'English (UK)' }, { value: 'en-US', label: 'English (US)' }, { value: 'fr-FR', label: 'French' }, { value: 'de-DE', label: 'German' }]} /></ModalField>
              </div>
            </div>

            <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Allowed Actions</h3>
              <div className="space-y-1">
                {actions.map(a => (
                  <div key={a.key} className="flex items-center gap-3 py-1.5">
                    <button onClick={() => toggleAction(a.key)} className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${a.checked ? 'bg-[#10B981] border-[#10B981]' : 'border-slate-600'}`}>
                      {a.checked && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </button>
                    <span className="text-sm text-slate-300">{a.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
              <div className="flex items-center gap-2 mb-4"><Shield className="w-4 h-4 text-[#EF4444]" /><h3 className="text-sm font-semibold text-white">Safety Guardrails</h3></div>
              <div className="space-y-2">
                {blockedActions.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0"><i className="ri-close-circle-line text-[#EF4444] text-sm" /></div>
                    {b}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Token Usage</h3>
              <div className="text-3xl font-bold text-white mb-1">18,500</div>
              <p className="text-xs text-slate-400 mb-4">of 25,000 tokens this month</p>
              <PBXUsageMeter label="AI Tokens" used={18500} total={25000} color="#EC4899" warningThreshold={70} />
            </div>

            <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Test AI Agent</h3>
              <ModalField label="Caller Message"><textarea className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#EC4899]/20 resize-none h-20" placeholder="I need help with my account..." /></ModalField>
              <ModalField label="Caller Number"><input className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#EC4899]/20" placeholder="+44 20 7946 0958" /></ModalField>
              <ModalField label="Called Number"><input className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#EC4899]/20" placeholder="+44 20 7946 0100" /></ModalField>
              <button className="w-full mt-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#EC4899] hover:bg-[#DB2777] transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"><Play className="w-4 h-4" /> Test Agent</button>
              <div className="mt-4 space-y-2">
                <div className="bg-white/[0.02] rounded-lg p-3"><span className="text-[10px] text-slate-500 block">Intent</span><span className="text-sm text-white">Account Support</span></div>
                <div className="bg-white/[0.02] rounded-lg p-3"><span className="text-[10px] text-slate-500 block">Confidence</span><span className="text-sm text-white">92%</span></div>
                <div className="bg-white/[0.02] rounded-lg p-3"><span className="text-[10px] text-slate-500 block">Action</span><span className="text-sm text-white">Route to Support Ring Group</span></div>
                <div className="bg-white/[0.02] rounded-lg p-3"><span className="text-[10px] text-slate-500 block">Tokens</span><span className="text-sm text-white">~45 tokens</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Approved Transfer Destinations</h3>
              <button onClick={() => { setEditTransferId(null); setTransferForm({ name: '', type: 'User', destination: '', status: 'active' }); setTransferOpen(true); }} className="flex items-center gap-1 text-xs text-[#06B6D4] hover:underline cursor-pointer"><Plus className="w-3 h-3" /> Add</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-left text-xs text-slate-500"><th className="py-2 font-medium">Name</th><th className="py-2 font-medium">Type</th><th className="py-2 font-medium">Destination</th><th className="py-2 font-medium">Status</th><th className="py-2 font-medium text-right">Actions</th></tr></thead>
                <tbody>
                  {transfers.map(t => (
                    <tr key={t.id} className="border-t border-[rgba(255,255,255,0.03)]">
                      <td className="py-2 text-white text-sm">{t.name}</td><td className="py-2 text-slate-400 text-xs">{t.type}</td><td className="py-2 text-slate-300 font-mono text-xs">{t.destination}</td>
                      <td className="py-2"><PBXStatusBadge status={t.status} /></td>
                      <td className="py-2"><div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditTransferId(t.id); setTransferForm({ name: t.name, type: t.type, destination: t.destination, status: t.status }); setTransferOpen(true); }} className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-[#F59E0B] cursor-pointer"><Pencil className="w-3 h-3" /></button>
                        <button onClick={() => deleteTransfer(t.id)} className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-[#EF4444] cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Approved SMS Templates</h3>
              <button onClick={() => { setEditSmsId(null); setSmsForm({ name: '', body: '', trigger: 'missed_call', status: 'active' }); setSmsOpen(true); }} className="flex items-center gap-1 text-xs text-[#06B6D4] hover:underline cursor-pointer"><Plus className="w-3 h-3" /> Add</button>
            </div>
            <div className="space-y-3">
              {smsTemplates.map(t => (
                <div key={t.id} className="bg-white/[0.02] rounded-lg p-3 border border-[rgba(255,255,255,0.03)]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{t.name}</span>
                    <div className="flex items-center gap-1">
                      <PBXStatusBadge status={t.status} />
                      <button onClick={() => { setEditSmsId(t.id); setSmsForm({ name: t.name, body: t.body, trigger: t.trigger, status: t.status }); setSmsOpen(true); }} className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-[#F59E0B] cursor-pointer"><Pencil className="w-3 h-3" /></button>
                      <button onClick={() => deleteSms(t.id)} className="w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-[#EF4444] cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">{t.body}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">Trigger: {t.trigger.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <PBXCrudModal open={transferOpen} onClose={() => setTransferOpen(false)} title={editTransferId ? 'Edit Transfer' : 'Add Transfer Destination'} size="sm">
          <form onSubmit={(e) => { e.preventDefault(); saveTransfer(); }}>
            <ModalField label="Name" required><ModalInput value={transferForm.name} onChange={e => setTransferForm({ ...transferForm, name: e.target.value })} /></ModalField>
            <ModalField label="Type"><ModalSelect value={transferForm.type} onChange={v => setTransferForm({ ...transferForm, type: v })} options={[{ value: 'User', label: 'User' }, { value: 'Ring group', label: 'Ring Group' }, { value: 'External number', label: 'External Number' }]} /></ModalField>
            <ModalField label="Destination" required><ModalInput value={transferForm.destination} onChange={e => setTransferForm({ ...transferForm, destination: e.target.value })} /></ModalField>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setTransferOpen(false)} className="px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors cursor-pointer whitespace-nowrap">{editTransferId ? 'Save' : 'Add'}</button>
            </div>
          </form>
        </PBXCrudModal>

        <PBXCrudModal open={smsOpen} onClose={() => setSmsOpen(false)} title={editSmsId ? 'Edit SMS Template' : 'Add SMS Template'}>
          <form onSubmit={(e) => { e.preventDefault(); saveSms(); }}>
            <ModalField label="Template Name" required><ModalInput value={smsForm.name} onChange={e => setSmsForm({ ...smsForm, name: e.target.value })} /></ModalField>
            <ModalField label="Message Body" required><textarea value={smsForm.body} onChange={e => setSmsForm({ ...smsForm, body: e.target.value })} maxLength={500} className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 resize-none h-20" /></ModalField>
            <ModalField label="Trigger Type"><ModalSelect value={smsForm.trigger} onChange={v => setSmsForm({ ...smsForm, trigger: v })} options={[{ value: 'missed_call', label: 'Missed Call' }, { value: 'voicemail', label: 'Voicemail Received' }, { value: 'appointment', label: 'Appointment Follow-up' }, { value: 'lead', label: 'Lead Follow-up' }, { value: 'support', label: 'Support Acknowledgement' }]} /></ModalField>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setSmsOpen(false)} className="px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors cursor-pointer whitespace-nowrap">{editSmsId ? 'Save' : 'Add'}</button>
            </div>
          </form>
        </PBXCrudModal>
      </div>
    </PBXShell>
  );
}