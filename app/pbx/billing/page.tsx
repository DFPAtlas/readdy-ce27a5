'use client';

import PBXShell from '@/components/pbx/PBXShell';
import PBXUsageMeter from '@/components/pbx/PBXUsageMeter';
import PBXStatusBadge from '@/components/pbx/PBXStatusBadge';
import { CreditCard, Download } from 'lucide-react';

// TODO: Replace with Supabase - pbx_billing_plans, pbx_subscriptions, pbx_usage_records tables
const currentPlan = {
  name: 'Business',
  status: 'active',
  price: '£149/mo',
  includedNumbers: 5,
  includedUsers: 15,
  includedTokens: 25000,
  callMinutes: 2000,
  smsAllowance: 2000,
};

const usage = {
  usedNumbers: 5,
  usedUsers: 8,
  usedTokens: 18500,
  usedMinutes: 1240,
  usedSms: 1240,
};

const plans = [
  { name: 'Starter', price: '£49', numbers: 1, users: 3, tokens: '5,000', minutes: '500', sms: '500', highlighted: false },
  { name: 'Business', price: '£149', numbers: 5, users: 15, tokens: '25,000', minutes: '2,000', sms: '2,000', highlighted: true },
  { name: 'Pro', price: '£349', numbers: 15, users: 50, tokens: '100,000', minutes: '10,000', sms: '10,000', highlighted: false },
  { name: 'Agency', price: '£749', numbers: 50, users: 'Unlimited', tokens: '500,000', minutes: '50,000', sms: '50,000', highlighted: false },
];

const usageBreakdown = [
  { item: 'Phone Numbers', included: currentPlan.includedNumbers, used: usage.usedNumbers, overage: 0, cost: '£0.00' },
  { item: 'Users', included: currentPlan.includedUsers, used: usage.usedUsers, overage: 0, cost: '£0.00' },
  { item: 'Call Minutes', included: currentPlan.callMinutes, used: usage.usedMinutes, overage: 0, cost: '£0.00' },
  { item: 'SMS Messages', included: currentPlan.smsAllowance, used: usage.usedSms, overage: 0, cost: '£0.00' },
  { item: 'AI Tokens', included: currentPlan.includedTokens, used: usage.usedTokens, overage: 0, cost: '£0.00' },
];

const invoices = [
  { date: '2026-07-01', number: 'INV-2026-0701', amount: '£149.00', status: 'paid' },
  { date: '2026-06-01', number: 'INV-2026-0601', amount: '£149.00', status: 'paid' },
  { date: '2026-05-01', number: 'INV-2026-0501', amount: '£149.00', status: 'paid' },
  { date: '2026-04-01', number: 'INV-2026-0401', amount: '£149.00', status: 'paid' },
];

export default function PBXBillingPage() {
  return (
    <PBXShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">Billing</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage your subscription and view usage</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F97316]/10 flex items-center justify-center"><CreditCard className="w-5 h-5 text-[#F97316]" /></div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{currentPlan.name} Plan</h3>
                    <p className="text-xs text-slate-400">{currentPlan.price} · Next invoice: 15 Jul 2026</p>
                  </div>
                </div>
                <PBXStatusBadge status={currentPlan.status} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white/[0.02] rounded-lg p-3"><p className="text-xs text-slate-500">Numbers</p><p className="text-sm font-bold text-white">{usage.usedNumbers}/{currentPlan.includedNumbers}</p></div>
                <div className="bg-white/[0.02] rounded-lg p-3"><p className="text-xs text-slate-500">Users</p><p className="text-sm font-bold text-white">{usage.usedUsers}/{currentPlan.includedUsers}</p></div>
                <div className="bg-white/[0.02] rounded-lg p-3"><p className="text-xs text-slate-500">AI Tokens</p><p className="text-sm font-bold text-white">{(usage.usedTokens/1000).toFixed(1)}k/{(currentPlan.includedTokens/1000).toFixed(1)}k</p></div>
                <div className="bg-white/[0.02] rounded-lg p-3"><p className="text-xs text-slate-500">Minutes</p><p className="text-sm font-bold text-white">{usage.usedMinutes}/{currentPlan.callMinutes}</p></div>
                <div className="bg-white/[0.02] rounded-lg p-3"><p className="text-xs text-slate-500">SMS</p><p className="text-sm font-bold text-white">{usage.usedSms}/{currentPlan.smsAllowance}</p></div>
                <div className="bg-white/[0.02] rounded-lg p-3"><p className="text-xs text-slate-500">Stripe Status</p><p className="text-sm font-bold text-[#10B981]">Connected</p></div>
              </div>
            </div>

            <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Usage Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs text-slate-500 border-b border-[rgba(255,255,255,0.06)]"><th className="py-2 font-medium">Item</th><th className="py-2 font-medium">Included</th><th className="py-2 font-medium">Used</th><th className="py-2 font-medium">Overage</th><th className="py-2 font-medium text-right">Cost</th></tr></thead>
                  <tbody>
                    {usageBreakdown.map((u, i) => (
                      <tr key={i} className="border-b border-[rgba(255,255,255,0.03)]">
                        <td className="py-2.5 text-slate-300">{u.item}</td>
                        <td className="py-2.5 text-slate-400">{typeof u.included === 'number' ? u.included.toLocaleString() : u.included}</td>
                        <td className="py-2.5 text-white">{u.used.toLocaleString()}</td>
                        <td className="py-2.5 text-slate-400">{u.overage}</td>
                        <td className="py-2.5 text-slate-300 text-right">{u.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#1E293B] rounded-xl border border-[rgba(255,255,255,0.06)] p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Invoices</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs text-slate-500 border-b border-[rgba(255,255,255,0.06)]"><th className="py-2 font-medium">Date</th><th className="py-2 font-medium">Invoice</th><th className="py-2 font-medium">Amount</th><th className="py-2 font-medium">Status</th><th className="py-2 font-medium text-right">Download</th></tr></thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.number} className="border-b border-[rgba(255,255,255,0.03)]">
                        <td className="py-2.5 text-slate-300 text-xs">{inv.date}</td>
                        <td className="py-2.5 text-slate-400 font-mono text-xs">{inv.number}</td>
                        <td className="py-2.5 text-white">{inv.amount}</td>
                        <td className="py-2.5"><PBXStatusBadge status={inv.status} /></td>
                        <td className="py-2.5 text-right"><button className="text-[#06B6D4] hover:underline text-xs cursor-pointer flex items-center gap-1 justify-end"><Download className="w-3 h-3" /> PDF</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Available Plans</h3>
            {plans.map((plan) => (
              <div key={plan.name} className={`rounded-xl border p-5 ${plan.highlighted ? 'bg-[#06B6D4]/5 border-[#06B6D4]/20 ring-1 ring-[#06B6D4]/10' : 'bg-[#1E293B] border-[rgba(255,255,255,0.06)]'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-white">{plan.name}</h4>
                  <span className="text-lg font-bold text-[#06B6D4]">{plan.price}<span className="text-xs text-slate-400 font-normal">/mo</span></span>
                </div>
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs"><span className="text-slate-400">Numbers</span><span className="text-slate-300">{plan.numbers}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-400">Users</span><span className="text-slate-300">{plan.users}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-400">AI Tokens</span><span className="text-slate-300">{plan.tokens}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-400">Minutes</span><span className="text-slate-300">{plan.minutes}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-400">SMS</span><span className="text-slate-300">{plan.sms}</span></div>
                </div>
                <button className={`w-full py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${plan.highlighted ? 'bg-[#06B6D4] text-white hover:bg-[#0891B2]' : 'bg-white/[0.05] text-slate-300 hover:bg-white/10'}`}>
                  {plan.highlighted ? 'Current Plan' : 'Upgrade'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PBXShell>
  );
}