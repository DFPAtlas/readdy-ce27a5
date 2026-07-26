'use client';

import { useState, useEffect } from 'react';
import { motion } from '@/components/motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, DollarSign, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';



interface Payment {
  id: string; assignment_id: string; tester_id: string; job_id: string;
  base_amount: number; bonus_amount: number; total_amount: number;
  status: string; payment_method: string | null; payment_reference: string | null;
  paid_at: string | null; admin_notes: string | null; created_at: string;
  job_title?: string; project_name?: string; assignment_status?: string;
}

const statusColors: Record<string, string> = {
  unpaid: '#94A3B8', pending: '#F59E0B', approved: '#06B6D4', paid: '#10B981', cancelled: '#EF4444',
};

export default function TesterPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const tid = sessionStorage.getItem('uatTesterId');
    if (!tid) { setTimeout(() => router.push('/uat-testing'), 0); return; }
    loadData(tid);
  }, []);

  const loadData = async (tid: string) => {
    const { data: t } = await supabase.from('uat_testers').select('*').eq('id', tid).maybeSingle();
    if (!t) { sessionStorage.removeItem('uatTesterId'); setTimeout(() => router.push('/uat-testing'), 0); return; }
    const testerData = t as any;
    if (testerData.status !== 'approved') { setBlocked(true); setLoading(false); return; }

    const { data: payData } = await supabase.from('uat_payments').select('*').eq('tester_id', tid).order('created_at', { ascending: false });

    if (payData && payData.length > 0) {
      const jobIds = [...new Set(payData.map((p: any) => p.job_id))];
      const assignmentIds = [...new Set(payData.map((p: any) => p.assignment_id))];

      const [{ data: jobs }, { data: assignments }] = await Promise.all([
        supabase.from('uat_jobs').select('id, title, project_id').in('id', jobIds),
        supabase.from('uat_assignments').select('id, status').in('id', assignmentIds),
      ]);

      const jobMap: Record<string, any> = {};
      jobs?.forEach((j: any) => { jobMap[j.id] = j; });
      const assignMap: Record<string, string> = {};
      assignments?.forEach((a: any) => { assignMap[a.id] = a.status; });

      const projectIds = [...new Set(jobs?.map((j: any) => j.project_id).filter(Boolean) || [])];
      const projectMap: Record<string, string> = {};
      if (projectIds.length > 0) {
        const { data: projects } = await supabase.from('uat_projects').select('id, name').in('id', projectIds);
        projects?.forEach((p: any) => { projectMap[p.id] = p.name; });
      }

      const merged = payData.map((p: any) => ({
        ...p,
        job_title: jobMap[p.job_id]?.title || 'Unknown',
        project_name: projectMap[jobMap[p.job_id]?.project_id] || null,
        assignment_status: assignMap[p.assignment_id] || null,
      }));
      setPayments(merged);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#06B6D4]/30 border-t-[#06B6D4] rounded-full animate-spin" />
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-8">
        <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-3xl p-12 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Account Not Approved</h3>
          <p className="text-slate-400 mb-6">Your tester account must be approved before accessing payments.</p>
          <button onClick={() => router.push('/uat-testing')} className="px-5 py-2.5 bg-[#06B6D4] rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap">Back to Home</button>
        </div>
      </div>
    );
  }

  const totalEarned = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.total_amount, 0);
  const totalPending = payments.filter((p) => ['unpaid', 'pending', 'approved'].includes(p.status)).reduce((sum, p) => sum + p.total_amount, 0);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={() => router.push('/uat/dashboard')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#06B6D4] transition-colors mb-6 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">My Payments</h1>
          <p className="text-sm text-slate-400 mt-0.5">Track your UAT testing earnings</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-xs text-slate-400">Total Earned</span>
            </div>
            <p className="text-3xl font-bold text-white">${totalEarned.toFixed(2)}</p>
          </div>
          <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-xs text-slate-400">Pending</span>
            </div>
            <p className="text-3xl font-bold text-white">${totalPending.toFixed(2)}</p>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-500/10 flex items-center justify-center mx-auto mb-6">
              <DollarSign className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Payments Yet</h3>
            <p className="text-sm text-slate-400">Complete test assignments to start earning.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {p.project_name && (
                        <span className="text-xs font-medium text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-0.5 rounded-lg">{p.project_name}</span>
                      )}
                      <span className="inline-flex px-2 py-0.5 rounded-lg text-xs font-medium capitalize"
                        style={{ color: statusColors[p.status], backgroundColor: statusColors[p.status] + '15', border: '1px solid ' + statusColors[p.status] + '30' }}>
                        {p.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{p.job_title}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">${p.total_amount}</p>
                    <p className="text-xs text-slate-500">Base: ${p.base_amount}{p.bonus_amount > 0 ? ` + $${p.bonus_amount} bonus` : ''}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                  {p.assignment_status && <span>Assignment: {p.assignment_status}</span>}
                  {p.paid_at && <span>Paid: {new Date(p.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}