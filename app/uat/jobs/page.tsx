'use client';

import { useState, useEffect } from 'react';
import { motion } from '@/components/motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Briefcase, Search, Clock, DollarSign, Monitor, Smartphone,
  Calendar, Users, ArrowRight, User, AlertCircle,
} from 'lucide-react';



interface UatJob {
  id: string; project_id: string; title: string; public_summary: string | null;
  required_devices: string[] | null; required_browsers: string[] | null;
  required_experience_level: string | null; estimated_hours: number | null;
  pay_amount: number | null; pay_type: string; max_testers: number | null;
  deadline: string | null; status: string; project_name?: string;
  applicant_count?: number;
}

export default function TesterJobsPage() {
  const router = useRouter();
  const [testerId, setTesterId] = useState<string | null>(null);
  const [testerStatus, setTesterStatus] = useState<string>('');
  const [jobs, setJobs] = useState<UatJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<UatJob[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const tid = sessionStorage.getItem('uatTesterId');
    if (!tid) { setTimeout(() => router.push('/uat-testing'), 0); return; }
    setTesterId(tid);
    loadData(tid);
  }, []);

  const loadData = async (tid: string) => {
    const { data: t } = await supabase.from('uat_testers').select('status').eq('id', tid).maybeSingle();
    if (!t) { sessionStorage.removeItem('uatTesterId'); setTimeout(() => router.push('/uat-testing'), 0); return; }
    const s = (t as any).status;
    setTesterStatus(s);
    if (s !== 'approved') { setBlocked(true); setLoading(false); return; }

    const [{ data: jobsData }, { data: appsData }] = await Promise.all([
      supabase.from('uat_jobs').select('*').eq('status', 'open').order('created_at', { ascending: false }),
      supabase.from('uat_job_applications').select('job_id').eq('tester_id', tid),
    ]);

    const appSet = new Set((appsData || []).map((a: any) => a.job_id));
    setAppliedJobIds(appSet);

    const jobIds = (jobsData || []).map((j: any) => j.project_id).filter(Boolean);
    const { data: projData } = jobIds.length > 0
      ? await supabase.from('uat_projects').select('id, name').in('id', [...new Set(jobIds)])
      : { data: [] };
    const projectMap: Record<string, string> = {};
    projData?.forEach((p: any) => { projectMap[p.id] = p.name; });

    const { data: appCountsData } = await supabase.from('uat_job_applications').select('job_id');
    const appCounts: Record<string, number> = {};
    appCountsData?.forEach((a: any) => { appCounts[a.job_id] = (appCounts[a.job_id] || 0) + 1; });

    const merged = (jobsData || []).map((j: any) => ({
      ...j,
      project_name: projectMap[j.project_id] || null,
      applicant_count: appCounts[j.id] || 0,
    }));

    setJobs(merged as UatJob[]);
    setFilteredJobs(merged as UatJob[]);
    setLoading(false);
  };

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredJobs(jobs.filter((j) =>
        j.title.toLowerCase().includes(q) ||
        (j.project_name && j.project_name.toLowerCase().includes(q)) ||
        (j.public_summary && j.public_summary.toLowerCase().includes(q))
      ));
    } else {
      setFilteredJobs(jobs);
    }
  }, [searchQuery, jobs]);

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
          <p className="text-slate-400 mb-6">Your tester account must be approved before you can view and apply for jobs.</p>
          <button onClick={() => router.push('/uat-testing')} className="px-5 py-2.5 bg-[#06B6D4] rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap">Back to Home</button>
        </div>
      </div>
    );
  }

  const payTypeLabels: Record<string, string> = { fixed: 'Fixed', hourly: '/hr', 'bonus-only': 'Bonus' };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => router.push('/uat/dashboard')} className="text-sm text-slate-400 hover:text-[#06B6D4] transition-colors mb-2 cursor-pointer flex items-center gap-1">
              <span>← Dashboard</span>
            </button>
            <h1 className="text-2xl font-bold text-white">Available Jobs</h1>
            <p className="text-sm text-slate-400 mt-0.5">Browse and apply for UAT testing opportunities</p>
          </div>
          <button onClick={() => router.push('/uat/dashboard')} className="px-4 py-2 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-slate-400 hover:text-white cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
            <User className="w-4 h-4" /> Dashboard
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search jobs by title or project..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-3 bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/40 transition-all" />
        </div>

        <div className="space-y-4">
          {filteredJobs.map((job, i) => {
            const hasApplied = appliedJobIds.has(job.id);
            const spotsLeft = job.max_testers ? job.max_testers - (job.applicant_count || 0) : null;
            const isFull = spotsLeft !== null && spotsLeft <= 0;

            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 hover:border-[rgba(255,255,255,0.12)] transition-all cursor-pointer"
                onClick={() => router.push(`/uat/jobs/${job.id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {job.project_name && (
                        <span className="text-xs font-medium text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-0.5 rounded-lg">{job.project_name}</span>
                      )}
                      {hasApplied && (
                        <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-lg">Applied</span>
                      )}
                      {isFull && !hasApplied && (
                        <span className="text-xs font-medium text-red-400 bg-red-400/10 px-2 py-0.5 rounded-lg">Full</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1.5">{job.title}</h3>
                    {job.public_summary && <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">{job.public_summary}</p>}
                  </div>
                  <div className="flex items-center gap-6 shrink-0 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-500" />{job.estimated_hours ? `${job.estimated_hours}h` : '-'}</div>
                    <div className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-slate-500" />{job.pay_amount ? `$${job.pay_amount}${payTypeLabels[job.pay_type] ? ' ' + payTypeLabels[job.pay_type] : ''}` : '-'}</div>
                    <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-slate-500" />{job.applicant_count || 0}{job.max_testers ? `/${job.max_testers}` : ''}</div>
                    {job.deadline && (
                      <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-500" />{new Date(job.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</div>
                    )}
                    <ArrowRight className="w-5 h-5 text-slate-600" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-[rgba(255,255,255,0.04)]">
                  {job.required_devices && job.required_devices.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Monitor className="w-3.5 h-3.5" />{job.required_devices.join(', ')}
                    </div>
                  )}
                  {job.required_browsers && job.required_browsers.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Smartphone className="w-3.5 h-3.5" />{job.required_browsers.join(', ')}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-16">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No jobs available</p>
            <p className="text-sm text-slate-500 mt-1">Check back later for new testing opportunities</p>
          </div>
        )}
      </div>
    </div>
  );
}