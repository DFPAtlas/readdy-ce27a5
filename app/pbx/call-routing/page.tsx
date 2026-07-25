'use client';

import PBXShell from '@/components/pbx/PBXShell';
import PBXStatusBadge from '@/components/pbx/PBXStatusBadge';
import PBXCrudModal, { ModalField, ModalInput, ModalToggle, ModalSelect } from '@/components/pbx/PBXCrudModal';
import PBXEmptyState from '@/components/pbx/PBXEmptyState';
import { useState } from 'react';
import { Plus, Pencil, Trash2, GitBranch, Users } from 'lucide-react';

// TODO: Replace with Supabase - pbx_call_routes, pbx_ring_groups tables
const mockRoutes = [
  { id: '1', name: 'Sales Ring Group', number: '+44 20 7946 0100', type: 'ring_group', destination: 'Sales Team (3 members)', fallback: 'Sales Voicemail', maxRing: '20s', hoursLinked: true, aiEnabled: true, status: 'active' },
  { id: '2', name: 'Support IVR', number: '+44 20 7946 0101', type: 'ivr', destination: 'IVR Menu — Press 1 for Tech, 2 for Billing', fallback: 'AI Receptionist', maxRing: '30s', hoursLinked: true, aiEnabled: true, status: 'active' },
  { id: '3', name: 'After Hours', number: 'All Numbers', type: 'voicemail', destination: 'General Voicemail Box', fallback: '—', maxRing: '15s', hoursLinked: true, aiEnabled: false, status: 'active' },
  { id: '4', name: 'VIP Direct', number: '+44 20 7946 0100', type: 'forward', destination: 'John Doe (Ext 101)', fallback: 'John Voicemail', maxRing: '15s', hoursLinked: false, aiEnabled: false, status: 'active' },
  { id: '5', name: 'Marketing SMS', number: '+44 20 7946 0103', type: 'n8n_workflow', destination: 'Lead Capture Workflow', fallback: 'SMS Auto-reply', maxRing: '—', hoursLinked: false, aiEnabled: true, status: 'inactive' },
];

const routeTypeOptions = [
  { value: 'forward', label: 'Forward to User' },
  { value: 'ring_group', label: 'Ring Group' },
  { value: 'ivr', label: 'IVR Menu' },
  { value: 'voicemail', label: 'Voicemail' },
  { value: 'ai_receptionist', label: 'AI Receptionist' },
  { value: 'n8n_workflow', label: 'n8n Workflow' },
  { value: 'external', label: 'External Number' },
];

const mockRingGroups = [
  { id: '1', name: 'Sales Team', members: 3, strategy: 'ring_all', maxRing: '20s', fallback: 'Sales Voicemail', status: 'active' },
  { id: '2', name: 'Support Team', members: 4, strategy: 'sequential', maxRing: '25s', fallback: 'Support Voicemail', status: 'active' },
  { id: '3', name: 'Management', members: 2, strategy: 'ring_all', maxRing: '15s', fallback: 'AI Receptionist', status: 'active' },
];

export default function PBXCallRoutingPage() {
  const [routes, setRoutes] = useState(mockRoutes);
  const [ringGroups, setRingGroups] = useState(mockRingGroups);
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [editRoute, setEditRoute] = useState<any>(null);
  const [routeForm, setRouteForm] = useState({ name: '', number: '', type: 'forward', destination: '', maxRing: '', fallback: '', hoursLinked: false, aiEnabled: false, recordingEnabled: false, status: 'active' });

  const handleSaveRoute = () => {
    if (!routeForm.name) return;
    if (editRoute) {
      setRoutes(routes.map(r => r.id === editRoute.id ? { ...r, ...routeForm, number: routeForm.number || r.number, destination: routeForm.destination || '—', fallback: routeForm.fallback || '—', maxRing: routeForm.maxRing || '—' } : r));
    } else {
      setRoutes([...routes, { id: String(Date.now()), ...routeForm, number: routeForm.number || 'All Numbers', destination: routeForm.destination || '—', fallback: routeForm.fallback || '—', maxRing: routeForm.maxRing || '—' }]);
    }
    setRouteModalOpen(false);
    setEditRoute(null);
    setRouteForm({ name: '', number: '', type: 'forward', destination: '', maxRing: '', fallback: '', hoursLinked: false, aiEnabled: false, recordingEnabled: false, status: 'active' });
  };

  const deleteRoute = (id: string) => { setRoutes(routes.filter(r => r.id !== id)); };

  const openEdit = (route: any) => {
    setEditRoute(route);
    setRouteForm({
      name: route.name, number: route.number === 'All Numbers' ? '' : route.number,
      type: route.type, destination: route.destination === '—' ? '' : route.destination,
      maxRing: route.maxRing === '—' ? '' : route.maxRing,
      fallback: route.fallback === '—' ? '' : route.fallback,
      hoursLinked: route.hoursLinked, aiEnabled: route.aiEnabled, recordingEnabled: false, status: route.status,
    });
    setRouteModalOpen(true);
  };

  return (
    <PBXShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Call Routing</h1>
            <p className="text-sm text-slate-400 mt-0.5">Configure inbound call routing rules and ring groups</p>
          </div>
          <button onClick={() => { setEditRoute(null); setRouteForm({ name: '', number: '', type: 'forward', destination: '', maxRing: '', fallback: '', hoursLinked: false, aiEnabled: false, recordingEnabled: false, status: 'active' }); setRouteModalOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors cursor-pointer whitespace-nowrap">
            <Plus className="w-4 h-4" /> Create Route
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {routes.map((route) => (
            <div key={route.id} className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5 hover:border-[rgba(255,255,255,0.10)] transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-[#06B6D4]" />
                  <span className="text-sm font-semibold text-white">{route.name}</span>
                </div>
                <PBXStatusBadge status={route.status} />
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Number</span><span className="text-slate-300 font-mono">{route.number}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="text-slate-300">{routeTypeOptions.find(o => o.value === route.type)?.label || route.type}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Destination</span><span className="text-slate-300">{route.destination}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Fallback</span><span className="text-slate-300">{route.fallback}</span></div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[rgba(255,255,255,0.04)]">
                {route.hoursLinked && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#8B5CF6]/10 text-[#8B5CF6]">Hours</span>}
                {route.aiEnabled && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EC4899]/10 text-[#EC4899]">AI</span>}
                <div className="ml-auto flex gap-1">
                  <button onClick={() => openEdit(route)} className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-[#F59E0B] cursor-pointer"><Pencil className="w-3 h-3" /></button>
                  <button onClick={() => deleteRoute(route.id)} className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-[#EF4444] cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Route Table</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-[rgba(255,255,255,0.06)]">
                  <th className="px-5 py-2.5 font-medium">Route Name</th>
                  <th className="px-5 py-2.5 font-medium">Number</th>
                  <th className="px-5 py-2.5 font-medium">Type</th>
                  <th className="px-5 py-2.5 font-medium">Destination</th>
                  <th className="px-5 py-2.5 font-medium">Fallback</th>
                  <th className="px-5 py-2.5 font-medium">Ring</th>
                  <th className="px-5 py-2.5 font-medium">Hours</th>
                  <th className="px-5 py-2.5 font-medium">AI</th>
                  <th className="px-5 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr key={route.id} className="border-b border-[rgba(255,255,255,0.03)] hover:bg-white/[0.02] cursor-pointer" onClick={() => openEdit(route)}>
                    <td className="px-5 py-2.5 text-white text-sm">{route.name}</td>
                    <td className="px-5 py-2.5 text-slate-400 font-mono text-xs">{route.number}</td>
                    <td className="px-5 py-2.5 text-slate-300 text-xs">{routeTypeOptions.find(o => o.value === route.type)?.label || route.type}</td>
                    <td className="px-5 py-2.5 text-slate-300 text-xs">{route.destination}</td>
                    <td className="px-5 py-2.5 text-slate-400 text-xs">{route.fallback}</td>
                    <td className="px-5 py-2.5 text-slate-400 font-mono text-xs">{route.maxRing}</td>
                    <td className="px-5 py-2.5">{route.hoursLinked ? <span className="text-[#8B5CF6] text-xs">●</span> : <span className="text-slate-600 text-xs">—</span>}</td>
                    <td className="px-5 py-2.5">{route.aiEnabled ? <span className="text-[#EC4899] text-xs">●</span> : <span className="text-slate-600 text-xs">—</span>}</td>
                    <td className="px-5 py-2.5"><PBXStatusBadge status={route.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-[#06B6D4]" /> Ring Groups</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 border-b border-[rgba(255,255,255,0.06)]">
                  <th className="px-4 py-2.5 font-medium">Group</th>
                  <th className="px-4 py-2.5 font-medium">Members</th>
                  <th className="px-4 py-2.5 font-medium">Strategy</th>
                  <th className="px-4 py-2.5 font-medium">Max Ring</th>
                  <th className="px-4 py-2.5 font-medium">Fallback</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {ringGroups.map((rg) => (
                  <tr key={rg.id} className="border-b border-[rgba(255,255,255,0.03)]">
                    <td className="px-4 py-2.5 text-white text-sm">{rg.name}</td>
                    <td className="px-4 py-2.5 text-slate-300 text-xs">{rg.members}</td>
                    <td className="px-4 py-2.5 text-slate-300 text-xs capitalize">{rg.strategy.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-2.5 text-slate-400 font-mono text-xs">{rg.maxRing}</td>
                    <td className="px-4 py-2.5 text-slate-400 text-xs">{rg.fallback}</td>
                    <td className="px-4 py-2.5"><PBXStatusBadge status={rg.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Route Test Panel</h3>
          <p className="text-xs text-slate-500 mb-4">Simulate how a call would be routed based on time, date, and caller.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Caller Number</label>
              <input className="w-full px-3 py-2 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20" placeholder="+44 20 7946 0958" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Called Number</label>
              <input className="w-full px-3 py-2 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20" placeholder="+44 20 7946 0100" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Time / Date</label>
              <input type="datetime-local" className="w-full px-3 py-2 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20" />
            </div>
          </div>
          <button className="mt-4 px-4 py-2 rounded-lg text-sm font-medium text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors cursor-pointer whitespace-nowrap">Test Route</button>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white/[0.02] rounded-lg p-3"><span className="text-[10px] text-slate-500 block mb-1">Expected Result</span><span className="text-sm text-white">Sales Ring Group</span></div>
            <div className="bg-white/[0.02] rounded-lg p-3"><span className="text-[10px] text-slate-500 block mb-1">Fallback</span><span className="text-sm text-white">Sales Voicemail</span></div>
            <div className="bg-white/[0.02] rounded-lg p-3"><span className="text-[10px] text-slate-500 block mb-1">AI / n8n</span><span className="text-sm text-white">AI used · n8n not triggered</span></div>
          </div>
        </div>

        <PBXCrudModal open={routeModalOpen} onClose={() => { setRouteModalOpen(false); setEditRoute(null); }} title={editRoute ? 'Edit Route' : 'Create Route'}>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveRoute(); }}>
            <ModalField label="Route Name" required><ModalInput placeholder="e.g. Sales Ring Group" value={routeForm.name} onChange={e => setRouteForm({ ...routeForm, name: e.target.value })} /></ModalField>
            <ModalField label="Applies to Number"><ModalInput placeholder="Leave blank for all numbers" value={routeForm.number} onChange={e => setRouteForm({ ...routeForm, number: e.target.value })} /></ModalField>
            <ModalField label="Route Type"><ModalSelect value={routeForm.type} onChange={v => setRouteForm({ ...routeForm, type: v })} options={routeTypeOptions} /></ModalField>
            <ModalField label="Destination"><ModalInput placeholder="User / Group / IVR / Number" value={routeForm.destination} onChange={e => setRouteForm({ ...routeForm, destination: e.target.value })} /></ModalField>
            <div className="grid grid-cols-2 gap-3">
              <ModalField label="Max Ring Time"><ModalInput placeholder="20s" value={routeForm.maxRing} onChange={e => setRouteForm({ ...routeForm, maxRing: e.target.value })} /></ModalField>
              <ModalField label="Fallback Route"><ModalInput placeholder="Voicemail / etc" value={routeForm.fallback} onChange={e => setRouteForm({ ...routeForm, fallback: e.target.value })} /></ModalField>
            </div>
            <div className="bg-white/[0.02] rounded-lg p-3 mb-4">
              <ModalToggle label="Use Opening Hours" checked={routeForm.hoursLinked} onChange={v => setRouteForm({ ...routeForm, hoursLinked: v })} />
              <ModalToggle label="Enable AI Intent Detection" checked={routeForm.aiEnabled} onChange={v => setRouteForm({ ...routeForm, aiEnabled: v })} />
              <ModalToggle label="Enable Call Recording" checked={routeForm.recordingEnabled} onChange={v => setRouteForm({ ...routeForm, recordingEnabled: v })} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setRouteModalOpen(false); setEditRoute(null); }} className="px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors cursor-pointer whitespace-nowrap">{editRoute ? 'Save Changes' : 'Create Route'}</button>
            </div>
          </form>
        </PBXCrudModal>
      </div>
    </PBXShell>
  );
}