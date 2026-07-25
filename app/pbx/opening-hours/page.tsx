'use client';

import PBXShell from '@/components/pbx/PBXShell';
import PBXCrudModal, { ModalField, ModalInput, ModalToggle, ModalSelect } from '@/components/pbx/PBXCrudModal';
import { useState } from 'react';
import { Clock, Plus, Pencil, Trash2 } from 'lucide-react';

// TODO: Replace with Supabase - pbx_opening_hours table
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const mockSchedule = weekDays.map((day, i) => ({
  day,
  open: i < 5,
  openTime: '09:00',
  closeTime: '17:30',
  lunchBreak: i < 5,
  lunchStart: '12:30',
  lunchEnd: '13:00',
}));

const mockHolidays = [
  { id: '1', date: '2026-12-25', name: 'Christmas Day', open: false, customHours: false, customOpen: '', customClose: '', route: 'Holiday Voicemail' },
  { id: '2', date: '2026-12-26', name: 'Boxing Day', open: false, customHours: false, customOpen: '', customClose: '', route: 'Holiday Voicemail' },
  { id: '3', date: '2027-01-01', name: 'New Year\'s Day', open: false, customHours: false, customOpen: '', customClose: '', route: 'Holiday Voicemail' },
];

export default function PBXOpeningHoursPage() {
  const [schedule, setSchedule] = useState(mockSchedule);
  const [afterHoursMessage, setAfterHoursMessage] = useState('Thank you for calling. We are currently closed. Please leave a message or call back during business hours.');
  const [afterHoursRoute, setAfterHoursRoute] = useState('voicemail');
  const [emergencyOverride, setEmergencyOverride] = useState(false);
  const [holidays, setHolidays] = useState(mockHolidays);
  const [holidayOpen, setHolidayOpen] = useState(false);
  const [holidayForm, setHolidayForm] = useState({ date: '', name: '', open: false, customHours: false, customOpen: '', customClose: '', route: '' });
  const [editHolidayId, setEditHolidayId] = useState<string | null>(null);

  const toggleDay = (i: number) => {
    const s = [...schedule];
    s[i].open = !s[i].open;
    setSchedule(s);
  };

  const updateTime = (i: number, field: string, value: string) => {
    const s = [...schedule];
    (s[i] as any)[field] = value;
    setSchedule(s);
  };

  const toggleLunch = (i: number) => {
    const s = [...schedule];
    s[i].lunchBreak = !s[i].lunchBreak;
    setSchedule(s);
  };

  const saveHoliday = () => {
    if (!holidayForm.date || !holidayForm.name) return;
    if (editHolidayId) {
      setHolidays(holidays.map(h => h.id === editHolidayId ? { ...h, ...holidayForm } : h));
    } else {
      setHolidays([...holidays, { id: String(Date.now()), ...holidayForm, customHours: holidayForm.customHours || false, customOpen: holidayForm.customOpen || '', customClose: holidayForm.customClose || '' }]);
    }
    setHolidayOpen(false);
    setEditHolidayId(null);
    setHolidayForm({ date: '', name: '', open: false, customHours: false, customOpen: '', customClose: '', route: '' });
  };

  const deleteHoliday = (id: string) => { setHolidays(holidays.filter(h => h.id !== id)); };

  return (
    <PBXShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">Opening Hours</h1>
          <p className="text-sm text-slate-400 mt-0.5">Configure when your business is open for calls</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-[#06B6D4]" /> Business Hours</h3>
            <div className="space-y-1">
              {schedule.map((day, i) => (
                <div key={day.day} className="flex items-center gap-3 py-2.5 border-b border-[rgba(255,255,255,0.03)] last:border-0">
                  <button onClick={() => toggleDay(i)} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors cursor-pointer ${day.open ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' : 'bg-white/[0.03] text-slate-500 border border-[rgba(255,255,255,0.06)]'}`}>
                    {day.open ? 'On' : 'Off'}
                  </button>
                  <span className="text-sm text-slate-300 w-20">{day.day}</span>
                  {day.open ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input type="time" value={day.openTime} onChange={e => updateTime(i, 'openTime', e.target.value)} className="px-2 py-1.5 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#06B6D4]/20 w-28" />
                      <span className="text-slate-500 text-xs">to</span>
                      <input type="time" value={day.closeTime} onChange={e => updateTime(i, 'closeTime', e.target.value)} className="px-2 py-1.5 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#06B6D4]/20 w-28" />
                      <button onClick={() => toggleLunch(i)} className={`ml-auto text-[10px] px-2 py-1 rounded cursor-pointer ${day.lunchBreak ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-white/[0.03] text-slate-500'}`}>
                        {day.lunchBreak ? 'Lunch: ' + day.lunchStart + '-' + day.lunchEnd : '+ Lunch'}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 flex-1">Closed</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
              <h3 className="text-sm font-semibold text-white mb-3">After-Hours Behaviour</h3>
              <ModalField label="After-Hours Message"><textarea value={afterHoursMessage} onChange={e => setAfterHoursMessage(e.target.value)} maxLength={500} className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 resize-none h-20" /></ModalField>
              <ModalField label="After-Hours Route">
                <ModalSelect value={afterHoursRoute} onChange={setAfterHoursRoute} options={[
                  { value: 'voicemail', label: 'Voicemail' },
                  { value: 'ai_receptionist', label: 'AI Receptionist' },
                  { value: 'external', label: 'External Number' },
                  { value: 'n8n', label: 'n8n Workflow' },
                ]} />
              </ModalField>
            </div>

            <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Emergency Override</h3>
              </div>
              <ModalToggle label="Enable Emergency Override" checked={emergencyOverride} onChange={setEmergencyOverride} />
              <p className="text-xs text-slate-500 mt-2">When enabled, all calls follow the emergency route regardless of schedule.</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Holiday Overrides</h3>
            <button onClick={() => { setEditHolidayId(null); setHolidayForm({ date: '', name: '', open: false, customHours: false, customOpen: '', customClose: '', route: '' }); setHolidayOpen(true); }} className="flex items-center gap-1.5 text-xs text-[#06B6D4] hover:underline cursor-pointer">
              <Plus className="w-3 h-3" /> Add Holiday
            </button>
          </div>
          {holidays.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No holiday overrides configured</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 border-b border-[rgba(255,255,255,0.06)]">
                    <th className="px-4 py-2.5 font-medium">Date</th>
                    <th className="px-4 py-2.5 font-medium">Name</th>
                    <th className="px-4 py-2.5 font-medium">Status</th>
                    <th className="px-4 py-2.5 font-medium">Hours</th>
                    <th className="px-4 py-2.5 font-medium">Route</th>
                    <th className="px-4 py-2.5 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.map((h) => (
                    <tr key={h.id} className="border-b border-[rgba(255,255,255,0.03)]">
                      <td className="px-4 py-2.5 text-slate-300 font-mono text-xs">{h.date}</td>
                      <td className="px-4 py-2.5 text-white text-sm">{h.name}</td>
                      <td className="px-4 py-2.5">{h.open ? <span className="text-[#10B981] text-xs">Open</span> : <span className="text-[#EF4444] text-xs">Closed</span>}</td>
                      <td className="px-4 py-2.5 text-slate-400 text-xs">{h.customHours ? `${h.customOpen} - ${h.customClose}` : 'Default'}</td>
                      <td className="px-4 py-2.5 text-slate-400 text-xs">{h.route}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditHolidayId(h.id); setHolidayForm({ date: h.date, name: h.name, open: h.open, customHours: h.customHours, customOpen: h.customOpen, customClose: h.customClose, route: h.route }); setHolidayOpen(true); }} className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-[#F59E0B] cursor-pointer"><Pencil className="w-3 h-3" /></button>
                          <button onClick={() => deleteHoliday(h.id)} className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-[#EF4444] cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <PBXCrudModal open={holidayOpen} onClose={() => { setHolidayOpen(false); setEditHolidayId(null); }} title={editHolidayId ? 'Edit Holiday' : 'Add Holiday'}>
          <form onSubmit={(e) => { e.preventDefault(); saveHoliday(); }}>
            <div className="grid grid-cols-2 gap-3">
              <ModalField label="Date" required><ModalInput type="date" value={holidayForm.date} onChange={e => setHolidayForm({ ...holidayForm, date: e.target.value })} /></ModalField>
              <ModalField label="Name" required><ModalInput placeholder="Christmas Day" value={holidayForm.name} onChange={e => setHolidayForm({ ...holidayForm, name: e.target.value })} /></ModalField>
            </div>
            <div className="bg-white/[0.02] rounded-lg p-3 mb-4">
              <ModalToggle label="Open on this day" checked={holidayForm.open} onChange={v => setHolidayForm({ ...holidayForm, open: v })} />
              <ModalToggle label="Custom Hours" checked={holidayForm.customHours} onChange={v => setHolidayForm({ ...holidayForm, customHours: v })} />
            </div>
            {holidayForm.customHours && (
              <div className="grid grid-cols-2 gap-3">
                <ModalField label="Open Time"><ModalInput type="time" value={holidayForm.customOpen} onChange={e => setHolidayForm({ ...holidayForm, customOpen: e.target.value })} /></ModalField>
                <ModalField label="Close Time"><ModalInput type="time" value={holidayForm.customClose} onChange={e => setHolidayForm({ ...holidayForm, customClose: e.target.value })} /></ModalField>
              </div>
            )}
            <ModalField label="After-Hours Route"><ModalInput placeholder="e.g. Holiday Voicemail" value={holidayForm.route} onChange={e => setHolidayForm({ ...holidayForm, route: e.target.value })} /></ModalField>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => { setHolidayOpen(false); setEditHolidayId(null); }} className="px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors cursor-pointer whitespace-nowrap">{editHolidayId ? 'Save Changes' : 'Add Holiday'}</button>
            </div>
          </form>
        </PBXCrudModal>
      </div>
    </PBXShell>
  );
}