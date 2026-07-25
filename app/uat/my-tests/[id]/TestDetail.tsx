'use client';

import { useState, useEffect } from 'react';
import { motion } from '@/components/motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Clock, DollarSign, Calendar, AlertCircle, CheckCircle,
  Globe, Server, ExternalLink, FileText, Lock, Send, Loader2,
  Monitor, Smartphone, Users, Ban, Bug,
} from 'lucide-react';



interface AssignmentDetail {
  id: string; job_id: string; tester_id: string; application_id: string | null;
  status: string; agreed_pay: number | null;
  access_starts_at: string | null; access_expires_at: string | null;
  started_at: string | null; submitted_at: string | null;
  completed_at: string | null; admin_notes: string | null;
  created_at: string;
  job_title?: string; job_description?: string;
  job_public_summary?: string; job_test_instructions?: string | null;
  job_required_devices?: string[]; job_required_browsers?: string[];
  job_required_experience_level?: string;
  job_estimated_hours?: number; job_pay_amount?: number;
  job_pay_type?: string; job_max_testers?: number;
  job_deadline?: string; job_status?: string;
  project_name?: string; project_live_url?: string;
  environment_name?: string; environment_type?: string;
  environment_base_url?: string; environment_login_url?: string;
  environment_admin_login_url?: string; environment_tester_login_url?: string;
  environment_current_build?: string; environment_release_candidate?: string;
  environment_version?: string; environment_git_branch?: string;
}

export default function TestDetail({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [testerId, setTesterId] = useState<string | null>(null);
  const [testerStatus, setTesterStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [expired, setExpired] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const tid = sessionStorage.getItem('uatTesterId');
    if (!tid) { setTimeout(() => router.push('/uat-testing'), 0); return; }
    setTesterId(tid);
    loadData(tid);
  }, [assignmentId]);

  const loadData = async (tid: string) => {
    const { data: t } = await supabase.from('uat_testers').select('status').eq('id', tid).maybeSingle();
    if (!t) { sessionStorage.removeItem('uatTesterId'); setTimeout(() => router.push('/uat-testing'), 0); return; }

    const ts = (t as any).status;
    setTesterStatus(ts);
    if (ts !== 'approved') { setBlocked(true); setLoading(false); return; }

    const { data: assign } = await supabase.from('uat_assignments').select('*').eq('id', assignmentId).eq('tester_id', tid).maybeSingle();
    if (!assign) { setNotFound(true); setLoading(false); return; }

    if (assign.status === 'cancelled' || assign.status === 'expired') {
      setBlocked(true);
      setAssignment({
        ...assign,
        job_title: 'Access Revoked',
      } as AssignmentDetail);
      setLoading(false);
      return;
    }

    if (assign.access_expires_at && new Date(assign.access_expires_at) < new Date()) {
      setExpired(true);
    }

    const { data: job } = await supabase.from('uat_jobs').select('*').eq('id', assign.job_id).maybeSingle();
    const jData = job as any;

    let projData: any = null;
    let envData: any = null;
    if (jData?.project_id) {
      const [{ data: p }, { data: e }] = await Promise.all([
        supabase.from('uat_projects').select('name, live_url').eq('id', jData.project_id).maybeSingle(),
        jData.environment_id
          ? supabase.from('uat_environments').select('*').eq('id', jData.environment_id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      projData = p;
      envData = e;
    }

    setAssignment({
      ...assign,
      job_title: jData?.title || null,
      job_description: jData?.description || null,
      job_public_summary: jData?.public_summary || null,
      job_test_instructions: jData?.test_instructions || null,
      job_required_devices: jData?.required_devices || null,
      job_required_browsers: jData?.required_browsers || null,
      job_required_experience_level: jData?.required_experience_level || null,
      job_estimated_hours: jData?.estimated_hours || null,
      job_pay_amount: jData?.pay_amount || null,
      job_pay_type: jData?.pay_type || null,
      job_max_testers: jData?.max_testers || null,
      job_deadline: jData?.deadline || null,
      job_status: jData?.status || null,
      project_name: projData?.name || null,
      project_live_url: projData?.live_url || null,
      environment_name: envData?.environment_name || null,
      environment_type: envData?.environment_type || null,
      environment_base_url: envData?.base_url || null,
      environment_login_url: envData?.login_url || null,
      environment_admin_login_url: envData?.admin_login_url || null,
      environment_tester_login_url: envData?.tester_login_url || null,
      environment_current_build: envData?.current_build || null,
      environment_release_candidate: envData?.release_candidate || null,
      environment_version: envData?.version || null,
      environment_git_branch: envData?.git_branch || null,
    } as AssignmentDetail);

    setLoading(false);
  };

  const handleSubmitFeedback = async () => {
    setSubmitting(true);
    await supabase.from('uat_assignments').update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', assignmentId);
    await supabase.from('uat_audit_log').insert({
      action: 'Tester submitted feedback',
      entity_type: 'uat_assignment',
      entity_id: assignmentId,
      new_value: { status: 'submitted' },
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#06B6D4]/30 border-t-[#06B6D4] rounded-full animate-spin" />
      </div>
    );
  }

  if (blocked && !assignment) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-8">
        <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-3xl p-12 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
          <p className="text-slate-400 mb-6">Your tester account must be approved before accessing tests.</p>
          <button onClick={() => router.push('/uat/dashboard')} className="px-5 py-2.5 bg-[#06B6D4] rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-8">
        <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-3xl p-12 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Assignment Not Found</h3>
          <p className="text-slate-400 mb-6">This test assignment does not exist or does not belong to you.</p>
          <button onClick={() => router.push('/uat/my-tests')} className="px-5 py-2.5 bg-[#06B6D4] rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap">Back to My Tests</button>
        </div>
      </div>
    );
  }

  if (blocked && assignment) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-8">
        <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-3xl p-12 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <Ban className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Access Revoked</h3>
          <p className="text-slate-400 mb-6">This test assignment has been cancelled or has expired.</p>
          <button onClick={() => router.push('/uat/my-tests')} className="px-5 py-2.5 bg-[#06B6D4] rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap">Back to My Tests</button>
        </div>
      </div>
    );
  }

  if (!assignment) return null;

  const sc = {
    assigned: '#06B6D4', testing: '#10B981', submitted: '#F59E0B',
    approved: '#8B5CF6', completed: '#10B981', cancelled: '#EF4444',
    expired: '#6B7280',
  }[assignment.status] || '#94A3B8';

  const payTypeLabels: Record<string, string> = { fixed: 'Fixed Rate', hourly: 'Per Hour', 'bonus-only': 'Bonus Only' };

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={() => router.push('/uat/my-tests')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#06B6D4] transition-colors mb-6 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to My Tests
        </button>

        <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center gap-2 mb-2">
              {assignment.project_name && (
                <span className="text-xs font-medium text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-0.5 rounded-lg">{assignment.project_name}</span>
              )}
              <span className="inline-flex px-2 py-0.5 rounded-lg text-xs font-medium capitalize"
                style={{ color: sc, backgroundColor: sc + '15', border: '1px solid ' + sc + '30' }}>
                {assignment.status}
              </span>
              {expired && (
                <span className="text-xs font-medium text-red-400 bg-red-400/10 px-2 py-0.5 rounded-lg">Expired</span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">{assignment.job_title}</h1>
            {assignment.job_public_summary && (
              <p className="text-sm text-slate-400 leading-relaxed">{assignment.job_public_summary}</p>
            )}
          </div>

          <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {assignment.agreed_pay && (
                <div className="flex items-center gap-2 text-slate-400"><DollarSign className="w-4 h-4 text-slate-500" />${assignment.agreed_pay}</div>
              )}
              {assignment.job_estimated_hours && (
                <div className="flex items-center gap-2 text-slate-400"><Clock className="w-4 h-4 text-slate-500" />{assignment.job_estimated_hours} hours</div>
              )}
              {assignment.job_deadline && (
                <div className="flex items-center gap-2 text-slate-400"><Calendar className="w-4 h-4 text-slate-500" />
                  {new Date(assignment.job_deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              )}
              {assignment.access_expires_at && (
                <div className={`flex items-center gap-2 ${expired ? 'text-red-400' : 'text-emerald-400'}`}>
                  <Clock className="w-4 h-4" />
                  {expired ? 'Access expired' : 'Access until ' + new Date(assignment.access_expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </div>
              )}
            </div>
          </div>

          {assignment.environment_name && (
            <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Test Environment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.06)] rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">Environment</p>
                  <p className="text-sm text-white font-medium">{assignment.environment_name} <span className="text-xs text-slate-500 capitalize ml-1">({assignment.environment_type})</span></p>
                </div>
                {assignment.environment_version && (
                  <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.06)] rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">Version</p>
                    <p className="text-sm text-white font-medium">v{assignment.environment_version}</p>
                  </div>
                )}
                {assignment.environment_current_build && (
                  <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.06)] rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">Current Build</p>
                    <p className="text-sm text-white font-mono">{assignment.environment_current_build}</p>
                  </div>
                )}
                {assignment.environment_release_candidate && (
                  <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.06)] rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">Release Candidate</p>
                    <p className="text-sm text-white font-mono">{assignment.environment_release_candidate}</p>
                  </div>
                )}
              </div>

              {!expired && assignment.status !== 'cancelled' && (
                <div className="flex flex-wrap gap-2">
                  {assignment.environment_base_url && (
                    <a href={assignment.environment_base_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] rounded-xl text-sm font-semibold text-white transition-colors cursor-pointer whitespace-nowrap">
                      <Globe className="w-4 h-4" /> Test Site
                    </a>
                  )}
                  {assignment.environment_tester_login_url && (
                    <a href={assignment.environment_tester_login_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] rounded-xl text-sm text-slate-300 transition-colors cursor-pointer whitespace-nowrap">
                      <ExternalLink className="w-4 h-4" /> Tester Login
                    </a>
                  )}
                  {assignment.environment_login_url && (
                    <a href={assignment.environment_login_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] rounded-xl text-sm text-slate-300 transition-colors cursor-pointer whitespace-nowrap">
                      <Server className="w-4 h-4" /> Login Page
                    </a>
                  )}
                </div>
              )}
              {expired && (
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-sm text-red-400">This test access has expired.</p>
                </div>
              )}
            </div>
          )}

          {assignment.job_required_devices && assignment.job_required_devices.length > 0 && (
            <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Test Requirements</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-400">Devices: {assignment.job_required_devices.join(', ')}</span>
                </div>
                {assignment.job_required_browsers && assignment.job_required_browsers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-400">Browsers: {assignment.job_required_browsers.join(', ')}</span>
                  </div>
                )}
                {assignment.job_required_experience_level && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-400 capitalize">Experience: {assignment.job_required_experience_level}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!expired && assignment.status !== 'cancelled' && assignment.job_test_instructions && (
            <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-amber-400">Test Instructions</h3>
                <span className="text-[10px] text-amber-500/70 bg-amber-500/5 px-2 py-0.5 rounded-full">Confidential</span>
              </div>
              <div className="bg-amber-500/[0.03] border border-amber-500/10 rounded-xl p-4">
                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">{assignment.job_test_instructions}</pre>
              </div>
            </div>
          )}

          {expired && assignment.job_test_instructions && (
            <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
              <h3 className="text-sm font-semibold text-slate-500 mb-3">Test Instructions</h3>
              <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-sm text-red-400">This test access has expired. Test instructions are no longer available.</p>
              </div>
            </div>
          )}

          {assignment.job_description && (
            <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Job Description</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{assignment.job_description}</p>
            </div>
          )}

          <div className="p-6">
            {submitted || assignment.status === 'submitted' || assignment.status === 'approved' || assignment.status === 'completed' ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Feedback Submitted</h3>
                <p className="text-sm text-slate-400 mb-4">Your test feedback has been submitted. An admin will review it shortly.</p>
                <button onClick={() => router.push('/uat/my-tests')} className="px-5 py-2.5 bg-[#06B6D4] rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap">Back to My Tests</button>
              </motion.div>
            ) : !expired && assignment.status !== 'cancelled' ? (
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-4">Report bugs, usability issues, and other feedback for this test.</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => router.push(`/uat/feedback/${assignmentId}`)}
                    className="px-6 py-3 bg-[#06B6D4] hover:bg-[#0891B2] rounded-xl text-sm font-semibold text-white transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap">
                    <Bug className="w-4 h-4" /> Submit Detailed Feedback
                  </button>
                  <button onClick={handleSubmitFeedback} disabled={submitting}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-sm font-semibold text-white transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-60 whitespace-nowrap">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Quick Submit
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}