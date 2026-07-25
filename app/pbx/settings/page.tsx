'use client';

import PBXShell from '@/components/pbx/PBXShell';
import { Settings, Shield, Globe, Clock, Phone, Radio, Lock } from 'lucide-react';

// TODO: Replace with Supabase - pbx_tenants, pbx_webhook_logs, pbx_audit_logs tables

export default function PBXSettingsPage() {
  return (
    <PBXShell>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <p className="text-sm text-slate-400 mt-0.5">Configure your PBX system settings</p>
        </div>

        <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-[#06B6D4]" /> Company PBX Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Company Name', value: 'Acme Corp', type: 'text' },
              { label: 'Main Contact', value: 'John Doe', type: 'text' },
              { label: 'Timezone', value: 'Europe/London', type: 'text' },
              { label: 'Default Country', value: 'GB', type: 'text' },
              { label: 'Default Caller ID', value: '+44 20 7946 0100', type: 'text' },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs text-slate-500 mb-1 block">{f.label}</label>
                <input type={f.type} defaultValue={f.value} className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Phone className="w-4 h-4 text-[#F97316]" /> Emergency Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Address Line 1', value: '123 Business Park', type: 'text' },
              { label: 'City', value: 'London', type: 'text' },
              { label: 'Postcode', value: 'EC1A 1BB', type: 'text' },
              { label: 'Country', value: 'United Kingdom', type: 'text' },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs text-slate-500 mb-1 block">{f.label}</label>
                <input type={f.type} defaultValue={f.value} className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[rgba(255,255,255,0.04)]">
            <span className="text-xs text-slate-500">Emergency Calling Status:</span>
            <span className="text-xs font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">Verified — Last verified: 15 Jan 2026</span>
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Radio className="w-4 h-4 text-[#F59E0B]" /> Recording Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between py-1 cursor-pointer">
              <span className="text-sm text-slate-300">Enable Call Recording</span>
              <button className="relative w-9 h-5 rounded-full bg-[#06B6D4] transition-colors duration-200 cursor-pointer">
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white" />
              </button>
            </label>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Consent Message</label>
              <input defaultValue="This call may be recorded for quality and training purposes." className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Retention Period (days)</label>
              <input type="number" defaultValue="90" className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20" />
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-[#10B981]" /> Integration Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Twilio Webhook Status', status: 'online', detail: 'Voice + SMS connected' },
              { label: 'n8n Connected', status: 'online', detail: '3 workflows active' },
              { label: 'AI Agent Connected', status: 'online', detail: 'Responding normally' },
              { label: 'Stripe Billing', status: 'online', detail: 'Subscription active' },
            ].map(i => (
              <div key={i.label} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.03)] last:border-0">
                <div>
                  <span className="text-sm text-slate-300 block">{i.label}</span>
                  <span className="text-xs text-slate-500">{i.detail}</span>
                </div>
                <span className={`w-2 h-2 rounded-full ${i.status === 'online' ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-[#8B5CF6]" /> Security Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-300">Webhook Secret Status</span>
              <span className="text-xs font-mono text-slate-400 bg-white/[0.03] px-2 py-0.5 rounded">••••••••••••••••</span>
            </div>
            <label className="flex items-center justify-between py-1 cursor-pointer">
              <span className="text-sm text-slate-300">Audit Logging</span>
              <button className="relative w-9 h-5 rounded-full bg-[#06B6D4] transition-colors duration-200 cursor-pointer">
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white" />
              </button>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Max Call Duration (min)</label>
                <input type="number" defaultValue="120" className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Max SMS Per Day</label>
                <input type="number" defaultValue="500" className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-[#06B6D4] hover:bg-[#0891B2] transition-colors cursor-pointer whitespace-nowrap">Save Settings</button>
        </div>
      </div>
    </PBXShell>
  );
}