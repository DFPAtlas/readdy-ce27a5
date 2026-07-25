'use client';

import { useState } from 'react';
import PBXShell from '@/components/pbx/PBXShell';
import PBXStatCard from '@/components/pbx/PBXStatCard';
import PBXSetupChecklist from '@/components/pbx/PBXSetupChecklist';
import PBXUsageMeter from '@/components/pbx/PBXUsageMeter';
import PBXStatusBadge from '@/components/pbx/PBXStatusBadge';
import PBXComingSoonBanner from '@/components/pbx/PBXComingSoonBanner';
import PBXBespokeDemo from '@/components/pbx/PBXBespokeDemo';
import PBXEarlyAccessModal from '@/components/pbx/PBXEarlyAccessModal';
import { Phone, PhoneCall, PhoneMissed, Voicemail, MessageSquare, Bot, CreditCard, Activity, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

// TODO: Replace with Supabase queries - pbx_numbers, pbx_call_logs, pbx_voicemails, pbx_sms_messages, pbx_token_usage, pbx_subscriptions
const mockStats = {
  activeNumbers: 5,
  callsToday: 142,
  missedCalls: 8,
  voicemails: 12,
  smsThisMonth: 1240,
  aiTokensUsed: 18500,
  plan: 'Business',
  automationHealth: 'Healthy',
};

const quickActions = [
  { label: 'Add Phone Number', href: '/pbx/numbers', icon: Phone, color: '#06B6D4' },
  { label: 'Add User/Extension', href: '/pbx/users', icon: PhoneCall, color: '#10B981' },
  { label: 'Create Call Route', href: '/pbx/call-routing', icon: Activity, color: '#8B5CF6' },
  { label: 'Configure Hours', href: '/pbx/opening-hours', icon: Voicemail, color: '#F59E0B' },
  { label: 'Set Up AI Receptionist', href: '/pbx/ai-receptionist', icon: Bot, color: '#EC4899' },
  { label: 'View Call Logs', href: '/pbx/call-logs', icon: PhoneCall, color: '#F97316' },
];

const recentCalls = [
  { time: '14:32', direction: 'inbound', from: '+44 20 7946 0011', to: '+44 20 7946 0100', status: 'answered', duration: '4:22', aiSummary: 'done' },
  { time: '14:18', direction: 'outbound', from: '+44 20 7946 0100', to: '+44 20 7946 0234', status: 'answered', duration: '1:05', aiSummary: 'done' },
  { time: '14:05', direction: 'inbound', from: '+44 20 7946 0456', to: '+44 20 7946 0100', status: 'missed', duration: '0:00', aiSummary: 'none' },
  { time: '13:52', direction: 'inbound', from: '+44 20 7946 0789', to: '+44 20 7946 0100', status: 'voicemail', duration: '0:48', aiSummary: 'done' },
  { time: '13:30', direction: 'inbound', from: '+1 212 555 0199', to: '+44 20 7946 0100', status: 'answered', duration: '12:05', aiSummary: 'pending' },
  { time: '13:15', direction: 'outbound', from: '+44 20 7946 0100', to: '+44 20 7946 0321', status: 'answered', duration: '2:33', aiSummary: 'done' },
  { time: '12:58', direction: 'inbound', from: '+44 20 7946 0654', to: '+44 20 7946 0100', status: 'busy', duration: '0:00', aiSummary: 'none' },
];

const setupItems = [
  { id: '1', label: 'Add first number', done: true },
  { id: '2', label: 'Add users/extensions', done: true },
  { id: '3', label: 'Configure opening hours', done: true },
  { id: '4', label: 'Configure default route', done: true },
  { id: '5', label: 'Enable voicemail', done: false, href: '/pbx/settings' },
  { id: '6', label: 'Connect n8n workflow', done: false, href: '/pbx/settings' },
  { id: '7', label: 'Enable AI receptionist', done: false, href: '/pbx/ai-receptionist' },
  { id: '8', label: 'Add billing plan', done: true },
];

export default function PBXDashboardPage() {
  const [earlyAccessOpen, setEarlyAccessOpen] = useState(false);

  return (
    <PBXShell hideComingSoonBar>
      <div className="space-y-6">
        <PBXComingSoonBanner onRequestAccess={() => setEarlyAccessOpen(true)} />

        <PBXBespokeDemo onRequestDemo={() => setEarlyAccessOpen(true)} />

        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Welcome back — here is your PBX overview</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <PBXStatCard title="Active Numbers" value={String(mockStats.activeNumbers)} icon={<Phone className="w-5 h-5" />} color="#06B6D4" trend={{ value: '0', positive: true }} />
          <PBXStatCard title="Calls Today" value={String(mockStats.callsToday)} icon={<PhoneCall className="w-5 h-5" />} color="#10B981" trend={{ value: '12%', positive: true }} />
          <PBXStatCard title="Missed Calls" value={String(mockStats.missedCalls)} icon={<PhoneMissed className="w-5 h-5" />} color="#EF4444" trend={{ value: '5%', positive: false }} />
          <PBXStatCard title="Voicemails" value={String(mockStats.voicemails)} icon={<Voicemail className="w-5 h-5" />} color="#F59E0B" />
          <PBXStatCard title="SMS This Month" value={String(mockStats.smsThisMonth)} icon={<MessageSquare className="w-5 h-5" />} color="#8B5CF6" />
          <PBXStatCard title="AI Tokens Used" value={mockStats.aiTokensUsed.toLocaleString()} icon={<Bot className="w-5 h-5" />} color="#EC4899" />
          <PBXStatCard title="Current Plan" value={mockStats.plan} icon={<CreditCard className="w-5 h-5" />} color="#F97316" subtitle="Next invoice: 15 Jul 2026" />
          <PBXStatCard title="Automation Health" value={mockStats.automationHealth} icon={<Activity className="w-5 h-5" />} color="#22D3EE" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Recent Call Activity</h3>
                <Link href="/pbx/call-logs" className="text-xs text-[#06B6D4] hover:underline flex items-center gap-1 cursor-pointer">
                  View all <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 border-b border-[rgba(255,255,255,0.04)]">
                      <th className="pb-2 font-medium">Time</th>
                      <th className="pb-2 font-medium">Direction</th>
                      <th className="pb-2 font-medium">From</th>
                      <th className="pb-2 font-medium">To</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Duration</th>
                      <th className="pb-2 font-medium">AI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentCalls.map((call, i) => (
                      <tr key={i} className="border-b border-[rgba(255,255,255,0.02)] hover:bg-white/[0.02] cursor-pointer">
                        <td className="py-2.5 text-slate-300 font-mono text-xs">{call.time}</td>
                        <td className="py-2.5">
                          <span className={`text-xs ${call.direction === 'inbound' ? 'text-[#10B981]' : 'text-[#8B5CF6]'}`}>
                            {call.direction === 'inbound' ? '↓ In' : '↑ Out'}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-300 font-mono text-xs">{call.from}</td>
                        <td className="py-2.5 text-slate-300 font-mono text-xs">{call.to}</td>
                        <td className="py-2.5"><PBXStatusBadge status={call.status} /></td>
                        <td className="py-2.5 text-slate-400 font-mono text-xs">{call.duration}</td>
                        <td className="py-2.5">
                          <span className={`text-[10px] font-medium ${call.aiSummary === 'done' ? 'text-[#10B981]' : call.aiSummary === 'pending' ? 'text-[#F59E0B]' : 'text-slate-500'}`}>
                            {call.aiSummary === 'done' ? '✓ Done' : call.aiSummary === 'pending' ? '⏳ Processing' : '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {quickActions.map((action) => (
                  <Link key={action.label} href={action.href}
                    className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-4 hover:border-[rgba(255,255,255,0.12)] transition-all cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: action.color + '18' }}>
                      <action.icon className="w-5 h-5" style={{ color: action.color }} />
                    </div>
                    <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <PBXSetupChecklist items={setupItems} comingSoon />

            <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Usage Overview</h3>
              <div className="space-y-4">
                <PBXUsageMeter label="Call Minutes" used={1240} total={2000} unit=" min" color="#06B6D4" />
                <PBXUsageMeter label="SMS Messages" used={1240} total={2000} color="#8B5CF6" />
                <PBXUsageMeter label="AI Tokens" used={18500} total={25000} color="#EC4899" warningThreshold={70} />
                <PBXUsageMeter label="Numbers" used={5} total={10} color="#10B981" />
                <PBXUsageMeter label="Users" used={8} total={15} color="#F97316" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <PBXEarlyAccessModal open={earlyAccessOpen} onClose={() => setEarlyAccessOpen(false)} />
    </PBXShell>
  );
}