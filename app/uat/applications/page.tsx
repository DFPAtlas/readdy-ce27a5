'use client';

import { useState, useEffect } from 'react';
import { motion } from '@/components/motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  FileText, AlertCircle, CheckCircle, Clock, XCircle, Eye, User,
  ArrowLeft,
} from 'lucide-react';



interface Application {
  id: string; job_id: string; status: string;
  application_message: string | null; admin_notes: string | null;
  created_at: string;
  job_title?: string; project_name?: string;
}

export default function TesterApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [testerId, setTesterId] = useState<string | null>(null);

  useEffect(() => {
    const tid = sessionStorage.getItem('uatTesterId');
    if (!tid) { setTimeout(() => router.push('/uat-testing'), 0); return; }
    setTesterId(tid);
    loadData(tid);
  }, []);

  const loadData = async (tid: string) => {
    const { data: t } = await supabase.from('uat_testers').select('status').eq('id', tid).maybeSingle();
    if (!t) { sessionStorage.removeItem('uatTesterId'); setTimeout(() => router.push('/uat-testing'), 0); return; }
    if ((t as any).status !== 'approved') { setBlocked(true); setLoading(false); return; }

    const { data: appData } = await supabase.from('uat_job_applications').select('*').eq('tester_id', tid).order('created_at', { ascending: false });
    if (!appData) { setLoading(false); return; }

    const jobIds = [...new Set(appData.map((a: any) => a.job_id).filter(Boolean))];
    const { data: jobsData } = jobIds.length > 0
      ? await supabase.from('uat_jobs').select('id, title, project_id').in('id', jobIds)
      : { data: [] };

    const jobMap: Record<string, any> = {};
    jobsData?.forEach((j: any) => { jobMap[j.id] = j; });

    const projIds = [...new Set(jobsData?.map((j: any) => j.project_id).filter(Boolean) || [])];
    const { data: projData } = projIds.length > 0
      ? await supabase.from('uat_projects').select('id, name').in('id', projIds)
      : { data: [] };
    const projMap: Record<string, string> = {};
    projData?.forEach((p: any) => { projMap[p.id] = p.name; });

    const merged = appData.map((a: any) => ({
      ...a,
      job_title: jobMap[a.job_id]?.title || 'Unknown',
      project_name: projMap[jobMap[a.job_id]?.project_id] || null,
    }));

    setApplications(merged);
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
          <h3 className="text-xl font-bold text-white mb-2">Access Restricted</h3>
          <p className="text-slate-400 mb-6">Your tester account must be approved first.</p>
          <button onClick={() => router.push('/uat-testing')} className="px-5 py-2.5 bg-[#06B6D4] rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap">Back to Home</button>
        </div>
      </div>
    );
  }

  const statusIcons: Record<string, any> = {
    applied: { icon: Clock, color: '#3B82F6', bg: 'bg-blue-500/10', label: 'Pending Review' },
    accepted: { icon: CheckCircle, color: '#10B981', bg: 'bg-emerald-500/10', label: 'Accepted' },
    rejected: { icon: XCircle, color: '#EF4444', bg: 'bg-red-500/10', label: 'Rejected' },
    completed: { icon: CheckCircle, color: '#8B5CF6', bg: 'bg-violet-500/10', label: 'Completed' },
  };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <button onClick={() => router.push('/uat/dashboard')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#06B6D4] transition-colors mb-6 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Applications</h1>
            <p className="text-sm text-slate-400 mt-0.5">Track your UAT job applications</p>
          </div>
          <button onClick={() => router.push('/uat/jobs')} className="px-4 py-2 bg-[#06B6D4] rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap">Browse Jobs</button>
        </div>

        {applications.length === 0 ? (
          <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-2xl p-12 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No applications yet</p>
            <p className="text-sm text-slate-500 mt-1">Browse available jobs to start applying</p>
            <button onClick={() => router.push('/uat/jobs')} className="mt-6 px-5 py-2.5 bg-[#06B6D4] rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap">View Jobs</button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app, i) => {
              const si = statusIcons[app.status] || statusIcons.applied;
              const Icon = si.icon;
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 hover:border-[rgba(255,255,255,0.12)] transition-all cursor-pointer"
                  onClick={() => router.push(`/uat/jobs/${app.job_id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {app.project_name && (
                          <span className="text-xs font-medium text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-0.5 rounded-lg">{app.project_name}</span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1">{app.job_title}</h3>
                      {app.application_message && (
                        <p className="text-xs text-slate-500 italic">"{app.application_message}"</p>
                      )}
                      {app.admin_notes && (
                        <p className="text-xs text-slate-500 mt-1">Admin: {app.admin_notes}</p>
                      )}
                      <p className="text-xs text-slate-600 mt-2">
                        Applied {new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: si.bg, color: si.color }}>
                        <Icon className="w-3.5 h-3.5" />
                        {si.label}
                      </span>
                      <Eye className="w-4 h-4 text-slate-600" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}