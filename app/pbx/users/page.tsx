'use client';

import PBXShell from '@/components/pbx/PBXShell';
import PBXStatusBadge from '@/components/pbx/PBXStatusBadge';
import PBXCrudModal, { ModalField, ModalInput, ModalToggle, ModalSelect } from '@/components/pbx/PBXCrudModal';
import PBXDetailDrawer, { DetailRow } from '@/components/pbx/PBXDetailDrawer';
import PBXEmptyState from '@/components/pbx/PBXEmptyState';
import { useState } from 'react';
import { Plus, Eye, Pencil, Ban } from 'lucide-react';

// TODO: Replace with Supabase - pbx_users, pbx_extensions tables
const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@acmecorp.com', extension: '101', directDial: '+44 20 7946 0201', forwarding: '+44 7700 900001', role: 'Owner', voicemailEnabled: true, recordingEnabled: true, aiAccess: true, status: 'active' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@acmecorp.com', extension: '102', directDial: '+44 20 7946 0202', forwarding: '+44 7700 900002', role: 'Admin', voicemailEnabled: true, recordingEnabled: false, aiAccess: true, status: 'active' },
  { id: '3', name: 'Mike Chen', email: 'mike@acmecorp.com', extension: '103', directDial: '+44 20 7946 0203', forwarding: '+44 7700 900003', role: 'User', voicemailEnabled: true, recordingEnabled: false, aiAccess: false, status: 'active' },
  { id: '4', name: 'Emma Wilson', email: 'emma@acmecorp.com', extension: '104', directDial: '+44 20 7946 0204', forwarding: '—', role: 'User', voicemailEnabled: false, recordingEnabled: false, aiAccess: false, status: 'active' },
  { id: '5', name: 'Tom Harris', email: 'tom@acmecorp.com', extension: '105', directDial: '—', forwarding: '+44 7700 900005', role: 'User', voicemailEnabled: true, recordingEnabled: true, aiAccess: true, status: 'disabled' },
];

const roleOptions = [
  { value: 'Owner', label: 'Owner' },
  { value: 'Admin', label: 'Admin' },
  { value: 'User', label: 'User' },
];

export default function PBXUsersPage() {
  const [users, setUsers] = useState(mockUsers);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [addForm, setAddForm] = useState({ name: '', email: '', extension: '', directDial: '', forwarding: '', role: 'User', voicemailEnabled: true, recordingEnabled: false, aiAccess: false, status: 'active' });
  const [editForm, setEditForm] = useState({ name: '', email: '', extension: '', directDial: '', forwarding: '', role: 'User', voicemailEnabled: true, recordingEnabled: false, aiAccess: false, status: 'active' });

  const handleAdd = () => {
    if (!addForm.name || !addForm.email || !addForm.extension) return;
    const newUser = {
      id: String(Date.now()),
      name: addForm.name,
      email: addForm.email,
      extension: addForm.extension,
      directDial: addForm.directDial || '—',
      forwarding: addForm.forwarding || '—',
      role: addForm.role,
      voicemailEnabled: addForm.voicemailEnabled,
      recordingEnabled: addForm.recordingEnabled,
      aiAccess: addForm.aiAccess,
      status: addForm.status,
    };
    setUsers([...users, newUser]);
    setAddOpen(false);
    setAddForm({ name: '', email: '', extension: '', directDial: '', forwarding: '', role: 'User', voicemailEnabled: true, recordingEnabled: false, aiAccess: false, status: 'active' });
  };

  const handleEdit = () => {
    if (!selectedUser) return;
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...editForm, directDial: editForm.directDial || '—', forwarding: editForm.forwarding || '—' } : u));
    setEditOpen(false);
  };

  const handleDisable = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'disabled' ? 'active' : 'disabled' } : u));
  };

  const openEdit = (user: any) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name, email: user.email, extension: user.extension,
      directDial: user.directDial === '—' ? '' : user.directDial,
      forwarding: user.forwarding === '—' ? '' : user.forwarding,
      role: user.role, voicemailEnabled: user.voicemailEnabled,
      recordingEnabled: user.recordingEnabled, aiAccess: user.aiAccess, status: user.status,
    });
    setEditOpen(true);
  };

  return (
    <PBXShell>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Users & Extensions</h1>
            <p className="text-sm text-slate-400 mt-0.5">Manage PBX users, extensions, and their settings</p>
          </div>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors cursor-pointer whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>

        {users.length === 0 ? (
          <PBXEmptyState title="No users yet" description="Add your first PBX user to get started." actionLabel="Add User" onAction={() => setAddOpen(true)} />
        ) : (
          <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-[rgba(255,255,255,0.06)]">
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Ext</th>
                    <th className="px-5 py-3 font-medium">Direct Dial</th>
                    <th className="px-5 py-3 font-medium">Forwarding</th>
                    <th className="px-5 py-3 font-medium">Role</th>
                    <th className="px-5 py-3 font-medium">Voicemail</th>
                    <th className="px-5 py-3 font-medium">Recording</th>
                    <th className="px-5 py-3 font-medium">AI</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-white text-sm font-medium">{user.name}</td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{user.email}</td>
                      <td className="px-5 py-3 text-slate-300 font-mono text-xs">{user.extension}</td>
                      <td className="px-5 py-3 text-slate-400 font-mono text-xs">{user.directDial}</td>
                      <td className="px-5 py-3 text-slate-400 font-mono text-xs">{user.forwarding}</td>
                      <td className="px-5 py-3 text-slate-300 text-xs">{user.role}</td>
                      <td className="px-5 py-3">{user.voicemailEnabled ? <span className="text-[#10B981] text-xs">● Yes</span> : <span className="text-slate-500 text-xs">—</span>}</td>
                      <td className="px-5 py-3">{user.recordingEnabled ? <span className="text-[#F59E0B] text-xs">● On</span> : <span className="text-slate-500 text-xs">—</span>}</td>
                      <td className="px-5 py-3">{user.aiAccess ? <span className="text-[#EC4899] text-xs">● Yes</span> : <span className="text-slate-500 text-xs">—</span>}</td>
                      <td className="px-5 py-3"><PBXStatusBadge status={user.status} /></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setSelectedUser(user); setDetailOpen(true); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#06B6D4] hover:bg-white/5 transition-colors cursor-pointer" title="View"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => openEdit(user)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#F59E0B] hover:bg-white/5 transition-colors cursor-pointer" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDisable(user.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-[#EF4444] hover:bg-white/5 transition-colors cursor-pointer" title={user.status === 'disabled' ? 'Enable' : 'Disable'}><Ban className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <PBXCrudModal open={addOpen} onClose={() => setAddOpen(false)} title="Add User">
          <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
            <ModalField label="Full Name" required><ModalInput placeholder="John Doe" value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} /></ModalField>
            <ModalField label="Email" required><ModalInput type="email" placeholder="john@company.com" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} /></ModalField>
            <div className="grid grid-cols-2 gap-3">
              <ModalField label="Extension Number" required><ModalInput placeholder="101" value={addForm.extension} onChange={e => setAddForm({ ...addForm, extension: e.target.value })} /></ModalField>
              <ModalField label="Direct Dial"><ModalInput placeholder="+44 20 7946 0XXX" value={addForm.directDial} onChange={e => setAddForm({ ...addForm, directDial: e.target.value })} /></ModalField>
            </div>
            <ModalField label="Forwarding / Mobile"><ModalInput placeholder="+44 7700 900000" value={addForm.forwarding} onChange={e => setAddForm({ ...addForm, forwarding: e.target.value })} /></ModalField>
            <ModalField label="Role"><ModalSelect value={addForm.role} onChange={v => setAddForm({ ...addForm, role: v })} options={roleOptions} /></ModalField>
            <div className="bg-white/[0.02] rounded-lg p-3 mb-4">
              <ModalToggle label="Enable Voicemail" checked={addForm.voicemailEnabled} onChange={v => setAddForm({ ...addForm, voicemailEnabled: v })} />
              <ModalToggle label="Enable Call Recording" checked={addForm.recordingEnabled} onChange={v => setAddForm({ ...addForm, recordingEnabled: v })} />
              <ModalToggle label="Enable AI Access" checked={addForm.aiAccess} onChange={v => setAddForm({ ...addForm, aiAccess: v })} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors cursor-pointer whitespace-nowrap">Add User</button>
            </div>
          </form>
        </PBXCrudModal>

        <PBXCrudModal open={editOpen} onClose={() => setEditOpen(false)} title="Edit User">
          <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }}>
            <ModalField label="Full Name" required><ModalInput value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></ModalField>
            <ModalField label="Email" required><ModalInput type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /></ModalField>
            <div className="grid grid-cols-2 gap-3">
              <ModalField label="Extension" required><ModalInput value={editForm.extension} onChange={e => setEditForm({ ...editForm, extension: e.target.value })} /></ModalField>
              <ModalField label="Direct Dial"><ModalInput value={editForm.directDial} onChange={e => setEditForm({ ...editForm, directDial: e.target.value })} /></ModalField>
            </div>
            <ModalField label="Forwarding / Mobile"><ModalInput value={editForm.forwarding} onChange={e => setEditForm({ ...editForm, forwarding: e.target.value })} /></ModalField>
            <ModalField label="Role"><ModalSelect value={editForm.role} onChange={v => setEditForm({ ...editForm, role: v })} options={roleOptions} /></ModalField>
            <div className="bg-white/[0.02] rounded-lg p-3 mb-4">
              <ModalToggle label="Enable Voicemail" checked={editForm.voicemailEnabled} onChange={v => setEditForm({ ...editForm, voicemailEnabled: v })} />
              <ModalToggle label="Enable Call Recording" checked={editForm.recordingEnabled} onChange={v => setEditForm({ ...editForm, recordingEnabled: v })} />
              <ModalToggle label="Enable AI Access" checked={editForm.aiAccess} onChange={v => setEditForm({ ...editForm, aiAccess: v })} />
            </div>
            <ModalField label="Status"><ModalSelect value={editForm.status} onChange={v => setEditForm({ ...editForm, status: v })} options={[{ value: 'active', label: 'Active' }, { value: 'disabled', label: 'Disabled' }]} /></ModalField>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors cursor-pointer whitespace-nowrap">Save Changes</button>
            </div>
          </form>
        </PBXCrudModal>

        <PBXDetailDrawer open={detailOpen} onClose={() => setDetailOpen(false)} title="User Details">
          {selectedUser && (
            <div className="space-y-5">
              <div>
                <p className="text-lg font-bold text-white">{selectedUser.name}</p>
                <p className="text-sm text-slate-400">{selectedUser.email} · Ext {selectedUser.extension} · {selectedUser.role}</p>
              </div>
              <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Extension Settings</h4>
                <DetailRow label="Extension" value={selectedUser.extension} mono />
                <DetailRow label="Direct Dial" value={selectedUser.directDial} mono />
                <DetailRow label="Forwarding" value={selectedUser.forwarding} mono />
                <DetailRow label="Voicemail" value={selectedUser.voicemailEnabled ? 'Enabled' : 'Disabled'} />
                <DetailRow label="Call Recording" value={selectedUser.recordingEnabled ? 'Enabled' : 'Disabled'} />
                <DetailRow label="AI Access" value={selectedUser.aiAccess ? 'Enabled' : 'Disabled'} />
              </div>
              <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Recent Activity</h4>
                <DetailRow label="Recent Calls" value="8 calls today" />
                <DetailRow label="Voicemails" value="2 new" />
                <DetailRow label="AI Usage" value="120 tokens today" />
              </div>
            </div>
          )}
        </PBXDetailDrawer>
      </div>
    </PBXShell>
  );
}