'use client';

import { useState, useEffect } from 'react';
import { motion } from '@/components/motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Clock, DollarSign, Monitor, Smartphone, Calendar, Users,
  AlertCircle, CheckCircle, Send, Loader2, Globe, Server, FileText,
} from 'lucide-react';



interface UatJob {
  id: string; project_id: string; environment_id: string | null;
  title: string; description: string | null; public_summary: string | null;
  test_instructions: string | null; required_devices: string[] | null;
  required_browsers: string[] | null; required_experience_level: string | null;
  estimated_hours: number | null; pay_amount: number | null; pay_type: string;
  max_testers: number | null; deadline: string | null; status: string;
  project_name?: string; environment_name?: string; base_url?: string;
  env_version?: string; env_build?: string;
}

export default function TesterJobDetail({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [job, setJob] = useState<UatJob | null>(null);
  const [testerId, setTesterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [existingApp, setExistingApp] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    const tid = sessionStorage.getItem('uatTesterId');
    if (!tid) { setTimeout(() => router.push('/uat-testing'), 0); return; }
    setTesterId(tid);
    loadData(tid);
  }, [jobId]);

  const loadData = async (tid: string) => {
    const { data: t } = await supabase.from('uat_testers').select('status').eq('id', tid).maybeSingle();
    if (!t) { sessionStorage.removeItem('uatTesterId'); setTimeout(() => router.push('/uat-testing'), 0); return; }
    if ((t as any).status !== 'approved') { setBlocked(true); setLoading(false); return; }

    const { data: jobData } = await supabase.from('uat_jobs').select('*').eq('id', jobId).maybeSingle();
    if (!jobData) { setNotFound(true); setLoading(false); return; }

    const pId = jobData.project_id;
    const eId = jobData.environment_id;
    const [{ data: proj }, { data: env }] = await Promise.all([
      pId ? supabase.from('uat_projects').select('name').eq('id', pId).maybeSingle() : Promise.resolve({ data: null }),
      eId ? supabase.from('uat_environments').select('environment_name, base_url, version, current_build').eq('id', eId).maybeSingle() : Promise.resolve({ data: null }),
    ]);

    setJob({
      ...jobData,
      project_name: proj?.name || null,
      environment_name: env?.environment_name || null,
      base_url: env?.base_url || null,
      env_version: env?.version || null,
      env_build: env?.current_build || null,
    } as UatJob);

    const { data: appData } = await supabase.from('uat_job_applications').select('*').eq('job_id', jobId).eq('tester_id', tid).maybeSingle();
    setExistingApp(appData);

    setLoading(false);
  };

  const handleApply = async () => {
    if (!message.trim()) { setApplyError('Please include a brief message with your application.'); return; }
    setApplying(true);
    setApplyError('');

    const { error } = await supabase.from('uat_job_applications').insert({
      job_id: jobId,
      tester_id: testerId,
      status: 'applied',
      application_message: message.trim(),
    });

    if (error) {
      if (error.code === '23505') {
        setApplyError('You have already applied for this job.');
      } else {
        setApplyError('Failed to submit application. Please try again.');
      }
    } else {
      await supabase.from('uat_audit_log').insert({
        action: 'Tester applied',
        entity_type: 'uat_job_application',
        entity_id: jobId,
        new_value: { job_id: jobId, tester_id: testerId, message: message.trim() },
      });
      setApplySuccess(true);
    }
    setApplying(false);
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
          <p className="text-slate-400 mb-6">Your tester account must be approved before applying. Please wait for admin approval.</p>
          <button onClick={() => router.push('/uat-testing')} className="px-5 py-2.5 bg-[#06B6D4] rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap">Back to Home</button>
        </div>
      </div>
    );
  }

  if (notFound || !job) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-8">
        <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-3xl p-12 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Job Not Found</h3>
          <button onClick={() => router.push('/uat/jobs')} className="px-5 py-2.5 bg-[#06B6D4] rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap">Back to Jobs</button>
        </div>
      </div>
    );
  }

  if (job.status !== 'open') {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-8">
        <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-3xl p-12 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-slate-500/10 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Job Not Available</h3>
          <p className="text-slate-400 mb-6">This job is no longer accepting applications.</p>
          <button onClick={() => router.push('/uat/jobs')} className="px-5 py-2.5 bg-[#06B6D4] rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap">Browse Other Jobs</button>
        </div>
      </div>
    );
  }

  const payTypeLabels: Record<string, string> = { fixed: 'Fixed Rate', hourly: 'Per Hour', 'bonus-only': 'Bonus Only' };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <button onClick={() => router.push('/uat/jobs')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#06B6D4] transition-colors mb-6 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to Jobs
        </button>

        <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center gap-2 mb-2">
              {job.project_name && (
                <span className="text-xs font-medium text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-0.5 rounded-lg">{job.project_name}</span>
              )}
              <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-lg uppercase">Open</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">{job.title}</h1>
            {job.public_summary && <p className="text-sm text-slate-400 leading-relaxed">{job.public_summary}</p>}
          </div>

          <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-400"><Clock className="w-4 h-4 text-slate-500" />{job.estimated_hours ? `${job.estimated_hours} hours` : 'Not specified'}</div>
              <div className="flex items-center gap-2 text-slate-400"><DollarSign className="w-4 h-4 text-slate-500" />{job.pay_amount ? `$${job.pay_amount}` : '-'} <span className="text-xs text-slate-500">({payTypeLabels[job.pay_type] || job.pay_type})</span></div>
              <div className="flex items-center gap-2 text-slate-400"><Calendar className="w-4 h-4 text-slate-500" />{job.deadline ? new Date(job.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No deadline'}</div>
              <div className="flex items-center gap-2 text-slate-400"><Users className="w-4 h-4 text-slate-500" />{job.max_testers ? `${job.max_testers} testers needed` : 'Open'}</div>
            </div>

            {job.base_url && (
              <div className="mt-4 p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl flex items-center gap-2 text-xs">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-400">{job.base_url}</span>
                {job.env_version && <span className="text-slate-500">v{job.env_version}</span>}
              </div>
            )}
          </div>

          <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Requirements</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 w-24 shrink-0">Devices:</span>
                <span className="text-slate-400">{job.required_devices?.join(', ') || 'Any'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 w-24 shrink-0">Browsers:</span>
                <span className="text-slate-400">{job.required_browsers?.join(', ') || 'Any'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 w-24 shrink-0">Experience:</span>
                <span className="text-slate-400 capitalize">{job.required_experience_level || 'Any'}</span>
              </div>
            </div>
          </div>

          {job.description && (
            <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Description</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{job.description}</p>
            </div>
          )}

          <div className="p-6">
            {applySuccess ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Application Submitted</h3>
                <p className="text-sm text-slate-400 mb-4">Your application has been sent. You will be notified when the admin reviews it.</p>
                <button onClick={() => router.push('/uat/applications')} className="px-5 py-2.5 bg-[#06B6D4] rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap">View My Applications</button>
              </motion.div>
            ) : existingApp ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Already Applied</h3>
                <p className="text-sm text-slate-400 mb-2">Your application is currently: <span className="font-medium text-blue-400 capitalize">{existingApp.status}</span></p>
                {existingApp.application_message && <p className="text-xs text-slate-500 italic">“{existingApp.application_message}”</p>}
                <button onClick={() => router.push('/uat/applications')} className="mt-4 px-5 py-2.5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-slate-400 hover:text-white cursor-pointer whitespace-nowrap">Track Applications</button>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Apply for this Job</h3>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={500}
                  placeholder="Tell us why you're a good fit and what devices/browsers you'll test with..."
                  className="w-full px-4 py-3 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/40 transition-all resize-none mb-4" />

                {applyError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 mb-4">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <p className="text-xs text-red-400">{applyError}</p>
                  </div>
                )}

                <button onClick={handleApply} disabled={applying}
                  className="w-full px-4 py-3 bg-[#06B6D4] hover:bg-[#0891B2] rounded-xl text-sm font-semibold text-white transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 whitespace-nowrap">
                  {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Application
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
