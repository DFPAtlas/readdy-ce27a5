'use client';

import { useState, useEffect } from 'react';
import { motion } from '@/components/motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Clock, DollarSign, Calendar, AlertCircle,
  FileText, CheckCircle, Play, ExternalLink, Bug,
} from 'lucide-react';



interface Assignment {
  id: string; job_id: string; tester_id: string;
  status: string; agreed_pay: number | null;
  access_starts_at: string | null; access_expires_at: string | null;
  started_at: string | null; submitted_at: string | null;
  completed_at: string | null;
  created_at: string;
  job_title?: string; project_name?: string;
  deadline?: string; environment_name?: string;
}

const statusColors: Record<string, string> = {
  assigned: '#06B6D4', testing: '#10B981', submitted: '#F59E0B',
  approved: '#8B5CF6', completed: '#10B981', cancelled: '#EF4444',
  expired: '#6B7280',
};

export default function MyTestsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [testerId, setTesterId] = useState<string | null>(null);
  const [testerName, setTesterName] = useState('');
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const tid = sessionStorage.getItem('uatTesterId');
    if (!tid) { setTimeout(() => router.push('/uat-testing'), 0); return; }
    setTesterId(tid);
    loadData(tid);
  }, []);

  const loadData = async (tid: string) => {
    const { data: t } = await supabase.from('uat_testers').select('*').eq('id', tid).maybeSingle();
    if (!t) { sessionStorage.removeItem('uatTesterId'); setTimeout(() => router.push('/uat-testing'), 0); return; }

    const testerData = t as any;
    if (testerData.status !== 'approved') { setBlocked(true); setTesterName(testerData.full_name); setLoading(false); return; }
    setTesterName(testerData.full_name);

    const { data: assignData, error: assignErr } = await supabase.from('uat_assignments').select('*').eq('tester_id', tid).order('created_at', { ascending: false });
    if (assignErr) { setError('Failed to load assignments.'); setLoading(false); return; }

    if (assignData && assignData.length > 0) {
      const jobIds = [...new Set(assignData.map((a: any) => a.job_id))];
      const { data: jobs } = await supabase.from('uat_jobs').select('id, title, project_id, deadline').in('id', jobIds);
      const jobMap: Record<string, any> = {};
      jobs?.forEach((j: any) => { jobMap[j.id] = j; });

      const projectIds = [...new Set(jobs?.map((j: any) => j.project_id).filter(Boolean) || [])];
      let projectMap: Record<string, string> = {};
      if (projectIds.length > 0) {
        const { data: projects } = await supabase.from('uat_projects').select('id, name').in('id', projectIds);
        projects?.forEach((p: any) => { projectMap[p.id] = p.name; });
      }

      const merged = assignData.map((a: any) => ({
        ...a,
        job_title: jobMap[a.job_id]?.title || 'Unknown',
        project_name: projectMap[jobMap[a.job_id]?.project_id] || null,
        deadline: jobMap[a.job_id]?.deadline || null,
      }));
      setAssignments(merged);
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
          <p className="text-slate-400 mb-6">Your tester account must be approved before accessing tests.</p>
          <button onClick={() => router.push('/uat-testing')} className="px-5 py-2.5 bg-[#06B6D4] rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap">Back to Home</button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-8">
        <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-3xl p-12 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
          <p className="text-slate-400 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  const activeAssignments = assignments.filter((a) => !['cancelled', 'expired', 'completed'].includes(a.status));
  const pastAssignments = assignments.filter((a) => ['cancelled', 'expired', 'completed'].includes(a.status));

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={() => router.push('/uat/dashboard')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#06B6D4] transition-colors mb-6 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">My Tests</h1>
          <p className="text-sm text-slate-400 mt-0.5">Your assigned UAT test assignments</p>
        </div>

        {assignments.length === 0 ? (
          <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-500/10 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Test Assignments</h3>
            <p className="text-sm text-slate-400 mb-6">You haven&apos;t been assigned to any tests yet. Browse available jobs and apply to get started.</p>
            <button onClick={() => router.push('/uat/jobs')} className="px-5 py-2.5 bg-[#06B6D4] rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap">Browse Jobs</button>
          </div>
        ) : (
          <>
            {activeAssignments.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide">Active Tests</h2>
                <div className="space-y-3">
                  {activeAssignments.map((a, i) => (
                    <motion.button
                      key={a.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => router.push(`/uat/my-tests/${a.id}`)}
                      className="w-full bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 text-left hover:border-[#06B6D4]/20 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {a.project_name && (
                              <span className="text-xs font-medium text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-0.5 rounded-lg">{a.project_name}</span>
                            )}
                            <span className="inline-flex px-2 py-0.5 rounded-lg text-xs font-medium capitalize"
                              style={{ color: statusColors[a.status], backgroundColor: statusColors[a.status] + '15', border: '1px solid ' + statusColors[a.status] + '30' }}>
                              {a.status}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-white">{a.job_title}</h3>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-[#06B6D4] transition-colors shrink-0" />
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                        {a.agreed_pay && (
                          <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-slate-500" />${a.agreed_pay}</span>
                        )}
                        {a.deadline && (
                          <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {new Date(a.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                        {a.access_expires_at && (
                          <span className={`flex items-center gap-1.5 ${new Date(a.access_expires_at) < new Date() ? 'text-red-400' : 'text-emerald-400'}`}>
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(a.access_expires_at) < new Date() ? 'Expired' : 'Active until ' + new Date(a.access_expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)]">
                        <button onClick={(e) => { e.stopPropagation(); router.push(`/uat/feedback/${a.id}`); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#06B6D4]/10 text-[#06B6D4] hover:bg-[#06B6D4]/20 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap">
                          <Bug className="w-3 h-3" /> Submit Feedback
                        </button>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {pastAssignments.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">Past Tests</h2>
                <div className="space-y-2">
                  {pastAssignments.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => router.push(`/uat/my-tests/${a.id}`)}
                      className="w-full bg-white/[0.01] border border-[rgba(255,255,255,0.04)] rounded-xl p-4 text-left hover:border-[rgba(255,255,255,0.08)] transition-all cursor-pointer opacity-60 hover:opacity-80"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-medium text-slate-300">{a.job_title}</h3>
                            <span className="text-xs capitalize" style={{ color: statusColors[a.status] }}>{a.status}</span>
                          </div>
                          {a.project_name && <p className="text-xs text-slate-500">{a.project_name}</p>}
                        </div>
                        {a.agreed_pay && <span className="text-xs text-slate-500">${a.agreed_pay}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}