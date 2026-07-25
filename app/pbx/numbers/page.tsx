'use client';

import PBXShell from '@/components/pbx/PBXShell';
import PBXStatusBadge from '@/components/pbx/PBXStatusBadge';
import PBXCrudModal, { ModalField, ModalInput, ModalToggle, ModalSelect } from '@/components/pbx/PBXCrudModal';
import PBXDetailDrawer, { DetailRow } from '@/components/pbx/PBXDetailDrawer';
import PBXEmptyState from '@/components/pbx/PBXEmptyState';
import { useState } from 'react';
import { Plus, Eye, Pencil, Ban, GitBranch, X } from 'lucide-react';

// TODO: Replace with Supabase - pbx_numbers table. Query: supabase.from('pbx_numbers').select('*').eq('tenant_id', tenantId)
const mockNumbers = [
  { id: '1', number: '+44 20 7946 0100', friendlyName: 'Main Sales Line', type: 'Voice + SMS', status: 'active', defaultRoute: 'Sales Ring Group', smsRoute: 'SMS Inbox', emergencyStatus: 'verified', createdDate: '2026-01-15' },
  { id: '2', number: '+44 20 7946 0101', friendlyName: 'Support Desk', type: 'Voice', status: 'active', defaultRoute: 'Support IVR', smsRoute: '—', emergencyStatus: 'verified', createdDate: '2026-02-20' },
  { id: '3', number: '+44 20 7946 0102', friendlyName: 'Accounts', type: 'Voice + SMS', status: 'active', defaultRoute: 'Accounts User', smsRoute: 'Accounts SMS', emergencyStatus: 'pending', createdDate: '2026-03-10' },
  { id: '4', number: '+44 20 7946 0103', friendlyName: 'Marketing Hotline', type: 'SMS', status: 'setup_required', defaultRoute: '—', smsRoute: 'Marketing SMS', emergencyStatus: 'not_set', createdDate: '2026-06-01' },
  { id: '5', number: '+44 20 7946 0104', friendlyName: 'Legacy Line', type: 'Voice', status: 'disabled', defaultRoute: '—', smsRoute: '—', emergencyStatus: 'not_set', createdDate: '2025-11-05' },
];

const routeOptions = [
  { value: 'sales_ring', label: 'Sales Ring Group' },
  { value: 'support_ivr', label: 'Support IVR' },
  { value: 'accounts_user', label: 'Accounts User' },
  { value: 'voicemail_default', label: 'Default Voicemail' },
  { value: 'ai_receptionist', label: 'AI Receptionist' },
];

export default function PBXNumbersPage() {
  const [numbers, setNumbers] = useState(mockNumbers);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<any>(null);
  const [addForm, setAddForm] = useState({ number: '', friendlyName: '', voiceEnabled: true, smsEnabled: true, defaultRoute: '', smsRoute: '', emergencyStatus: 'not_set', notes: '' });
  const [editForm, setEditForm] = useState({ friendlyName: '', voiceEnabled: true, smsEnabled: true, defaultRoute: '', smsRoute: '', status: 'active', notes: '' });

  const handleAdd = () => {
    if (!addForm.number || !addForm.friendlyName) return;
    const newNumber = {
      id: String(Date.now()),
      number: addForm.number,
      friendlyName: addForm.friendlyName,
      type: addForm.voiceEnabled && addForm.smsEnabled ? 'Voice + SMS' : addForm.voiceEnabled ? 'Voice' : 'SMS',
      status: 'active',
      defaultRoute: addForm.defaultRoute || '—',
      smsRoute: addForm.smsRoute || '—',
      emergencyStatus: addForm.emergencyStatus,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setNumbers([...numbers, newNumber]);
    setAddForm({ number: '', friendlyName: '', voiceEnabled: true, smsEnabled: true, defaultRoute: '', smsRoute: '', emergencyStatus: 'not_set', notes: '' });
    setAddOpen(false);
  };

  const handleEdit = () => {
    if (!selectedNumber || !editForm.friendlyName) return;
    setNumbers(numbers.map(n => n.id === selectedNumber.id ? {
      ...n,
      friendlyName: editForm.friendlyName,
      type: editForm.voiceEnabled && editForm.smsEnabled ? 'Voice + SMS' : editForm.voiceEnabled ? 'Voice' : 'SMS',
      status: editForm.status,
      defaultRoute: editForm.defaultRoute || '—',
      smsRoute: editForm.smsRoute || '—',
    } : n));
    setEditOpen(false);
  };

  const handleDisable = (id: string) => {
    setNumbers(numbers.map(n => n.id === id ? { ...n, status: n.status === 'disabled' ? 'active' : 'disabled' } : n));
  };

  const openEdit = (num: any) => {
    setSelectedNumber(num);
    setEditForm({
      friendlyName: num.friendlyName,
      voiceEnabled: num.type.includes('Voice'),
      smsEnabled: num.type.includes('SMS'),
      defaultRoute: num.defaultRoute === '—' ? '' : num.defaultRoute,
      smsRoute: num.smsRoute === '—' ? '' : num.smsRoute,
      status: num.status,
      notes: '',
    });
    setEditOpen(true);
  };

  return (
    <PBXShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Phone Numbers</h1>
            <p className="text-sm text-slate-400 mt-0.5">Manage Twilio numbers assigned to this tenant</p>
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors cursor-pointer whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Number
          </button>
        </div>

        {numbers.length === 0 ? (
          <PBXEmptyState title="No numbers yet" description="Add your first phone number to start receiving calls." actionLabel="Add Number" onAction={() => setAddOpen(true)} />
        ) : (
          <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-[rgba(255,255,255,0.06)]">
                    <th className="px-5 py-3 font-medium">Phone Number</th>
                    <th className="px-5 py-3 font-medium">Friendly Name</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Default Route</th>
                    <th className="px-5 py-3 font-medium">SMS Route</th>
                    <th className="px-5 py-3 font-medium">Emergency</th>
                    <th className="px-5 py-3 font-medium">Created</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {numbers.map((num) => (
                    <tr key={num.id} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-slate-300 font-mono text-xs">{num.number}</td>
                      <td className="px-5 py-3 text-white text-sm">{num.friendlyName}</td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{num.type}</td>
                      <td className="px-5 py-3"><PBXStatusBadge status={num.status} /></td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{num.defaultRoute}</td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{num.smsRoute}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-medium ${num.emergencyStatus === 'verified' ? 'text-[#10B981]' : num.emergencyStatus === 'pending' ? 'text-[#F59E0B]' : 'text-slate-500'}`}>
                          {num.emergencyStatus === 'verified' ? 'Verified' : num.emergencyStatus === 'pending' ? 'Pending' : 'Not Set'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{num.createdDate}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setSelectedNumber(num); setDetailOpen(true); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#06B6D4] hover:bg-white/5 transition-colors cursor-pointer" title="View details">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => openEdit(num)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#F59E0B] hover:bg-white/5 transition-colors cursor-pointer" title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDisable(num.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#EF4444] hover:bg-white/5 transition-colors cursor-pointer" title={num.status === 'disabled' ? 'Enable' : 'Disable'}>
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <PBXCrudModal open={addOpen} onClose={() => setAddOpen(false)} title="Add Phone Number">
          <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
            <ModalField label="Phone Number" required><ModalInput placeholder="+44 20 7946 0XXX" value={addForm.number} onChange={e => setAddForm({ ...addForm, number: e.target.value })} /></ModalField>
            <ModalField label="Friendly Name" required><ModalInput placeholder="e.g. Main Sales Line" value={addForm.friendlyName} onChange={e => setAddForm({ ...addForm, friendlyName: e.target.value })} /></ModalField>
            <div className="bg-white/[0.02] rounded-lg p-3 mb-4">
              <ModalToggle label="Enable Voice" checked={addForm.voiceEnabled} onChange={v => setAddForm({ ...addForm, voiceEnabled: v })} />
              <ModalToggle label="Enable SMS" checked={addForm.smsEnabled} onChange={v => setAddForm({ ...addForm, smsEnabled: v })} />
            </div>
            <ModalField label="Default Inbound Route"><ModalSelect value={addForm.defaultRoute} onChange={v => setAddForm({ ...addForm, defaultRoute: v })} options={routeOptions} placeholder="Select route..." /></ModalField>
            <ModalField label="Default SMS Route"><ModalSelect value={addForm.smsRoute} onChange={v => setAddForm({ ...addForm, smsRoute: v })} options={routeOptions} placeholder="Select route..." /></ModalField>
            <ModalField label="Emergency Address Status"><ModalSelect value={addForm.emergencyStatus} onChange={v => setAddForm({ ...addForm, emergencyStatus: v })} options={[{ value: 'not_set', label: 'Not Set' }, { value: 'pending', label: 'Pending Verification' }, { value: 'verified', label: 'Verified' }]} /></ModalField>
            <ModalField label="Notes"><ModalInput placeholder="Optional notes" value={addForm.notes} onChange={e => setAddForm({ ...addForm, notes: e.target.value })} /></ModalField>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors cursor-pointer whitespace-nowrap">Add Number</button>
            </div>
          </form>
        </PBXCrudModal>

        <PBXCrudModal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Number">
          <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }}>
            {selectedNumber && <p className="text-xs text-slate-500 font-mono mb-4">{selectedNumber.number}</p>}
            <ModalField label="Friendly Name" required><ModalInput value={editForm.friendlyName} onChange={e => setEditForm({ ...editForm, friendlyName: e.target.value })} /></ModalField>
            <div className="bg-white/[0.02] rounded-lg p-3 mb-4">
              <ModalToggle label="Voice Enabled" checked={editForm.voiceEnabled} onChange={v => setEditForm({ ...editForm, voiceEnabled: v })} />
              <ModalToggle label="SMS Enabled" checked={editForm.smsEnabled} onChange={v => setEditForm({ ...editForm, smsEnabled: v })} />
            </div>
            <ModalField label="Default Inbound Route"><ModalSelect value={editForm.defaultRoute} onChange={v => setEditForm({ ...editForm, defaultRoute: v })} options={routeOptions} placeholder="Select route..." /></ModalField>
            <ModalField label="SMS Route"><ModalSelect value={editForm.smsRoute} onChange={v => setEditForm({ ...editForm, smsRoute: v })} options={routeOptions} placeholder="Select route..." /></ModalField>
            <ModalField label="Status"><ModalSelect value={editForm.status} onChange={v => setEditForm({ ...editForm, status: v })} options={[{ value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }, { value: 'disabled', label: 'Disabled' }]} /></ModalField>
            <ModalField label="Notes"><ModalInput value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} /></ModalField>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors cursor-pointer whitespace-nowrap">Save Changes</button>
            </div>
          </form>
        </PBXCrudModal>

        <PBXDetailDrawer open={detailOpen} onClose={() => setDetailOpen(false)} title="Number Details">
          {selectedNumber && (
            <div className="space-y-5">
              <div>
                <p className="text-lg font-bold text-white font-mono">{selectedNumber.number}</p>
                <p className="text-sm text-slate-400">{selectedNumber.friendlyName}</p>
              </div>
              <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Details</h4>
                <DetailRow label="Twilio SID" value="PNXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" mono />
                <DetailRow label="Tenant" value="Acme Corp" />
                <DetailRow label="Type" value={selectedNumber.type} />
                <DetailRow label="Status" value={<PBXStatusBadge status={selectedNumber.status} />} />
                <DetailRow label="Default Route" value={selectedNumber.defaultRoute} />
                <DetailRow label="SMS Route" value={selectedNumber.smsRoute} />
                <DetailRow label="Emergency Address" value={selectedNumber.emergencyStatus === 'verified' ? 'Verified' : selectedNumber.emergencyStatus === 'pending' ? 'Pending' : 'Not Set'} />
                <DetailRow label="Created" value={selectedNumber.createdDate} />
              </div>
              <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Recent Activity</h4>
                <DetailRow label="Recent Calls" value="3 calls today" />
                <DetailRow label="Recent SMS" value="12 messages this month" />
                <DetailRow label="Webhook Status" value={<span className="text-[#10B981] text-xs">● Connected</span>} />
              </div>
            </div>
          )}
        </PBXDetailDrawer>
      </div>
    </PBXShell>
  );
}