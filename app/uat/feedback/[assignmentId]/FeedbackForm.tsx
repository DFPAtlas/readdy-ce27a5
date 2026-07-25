'use client';

import { useState, useEffect } from 'react';
import { motion } from '@/components/motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, AlertCircle, CheckCircle, Loader2, Send,
  Bug, Monitor, Smartphone, Globe, ChevronDown,
} from 'lucide-react';



const feedbackTypes = [
  { value: 'bug', label: 'Bug', icon: Bug },
  { value: 'usability issue', label: 'Usability Issue' },
  { value: 'broken link', label: 'Broken Link' },
  { value: 'payment issue', label: 'Payment Issue' },
  { value: 'login issue', label: 'Login Issue' },
  { value: 'design feedback', label: 'Design Feedback' },
  { value: 'mobile issue', label: 'Mobile Issue' },
  { value: 'accessibility issue', label: 'Accessibility Issue' },
  { value: 'performance issue', label: 'Performance Issue' },
  { value: 'other', label: 'Other' },
];

const severityLevels = ['critical', 'high', 'medium', 'low'];

const browserOptions = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera', 'Brave', 'Other'];
const deviceOptions = ['Desktop', 'Laptop', 'Tablet', 'Mobile Phone'];

interface FormData {
  feedback_type: string; severity: string; category: string;
  page_url: string; device: string; browser: string; os_version: string;
  screen_size: string; title: string; description: string;
  steps_to_reproduce: string; expected_result: string; actual_result: string;
}

export default function FeedbackForm({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const [testerId, setTesterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');
  const [expired, setExpired] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [projectName, setProjectName] = useState('');
  const [existingFeedback, setExistingFeedback] = useState<any[]>([]);
  const [typeOpen, setTypeOpen] = useState(false);
  const [severityOpen, setSeverityOpen] = useState(false);
  const [deviceOpen, setDeviceOpen] = useState(false);
  const [browserOpen, setBrowserOpen] = useState(false);

  const [form, setForm] = useState<FormData>({
    feedback_type: 'bug', severity: 'medium', category: '',
    page_url: '', device: 'Desktop', browser: 'Chrome', os_version: '',
    screen_size: '', title: '', description: '',
    steps_to_reproduce: '', expected_result: '', actual_result: '',
  });

  const updateForm = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const tid = sessionStorage.getItem('uatTesterId');
    if (!tid) { setTimeout(() => router.push('/uat-testing'), 0); return; }
    setTesterId(tid);
    loadData(tid);
  }, [assignmentId]);

  const loadData = async (tid: string) => {
    const { data: t } = await supabase.from('uat_testers').select('status').eq('id', tid).maybeSingle();
    if (!t) { sessionStorage.removeItem('uatTesterId'); setTimeout(() => router.push('/uat-testing'), 0); return; }
    if ((t as any).status !== 'approved') { setBlocked(true); setBlockMessage('Your tester account must be approved before submitting feedback.'); setLoading(false); return; }

    const { data: assign } = await supabase.from('uat_assignments').select('*, uat_jobs!inner(title, project_id)').eq('id', assignmentId).eq('tester_id', tid).maybeSingle();
    if (!assign) { setBlocked(true); setBlockMessage('This assignment does not exist or does not belong to you.'); setLoading(false); return; }

    const aData = assign as any;

    if (aData.status === 'cancelled' || aData.status === 'expired') {
      setBlocked(true); setBlockMessage('This test assignment has been cancelled or expired.'); setLoading(false); return;
    }

    if (aData.access_expires_at && new Date(aData.access_expires_at) < new Date() && aData.status !== 'submitted') {
      setBlocked(true); setBlockMessage('This test access has expired.'); setExpired(true); setLoading(false); return;
    }

    if (aData.uat_jobs) {
      setJobTitle(aData.uat_jobs.title || '');
      if (aData.uat_jobs.project_id) {
        const { data: proj } = await supabase.from('uat_projects').select('name').eq('id', aData.uat_jobs.project_id).maybeSingle();
        if (proj) setProjectName((proj as any).name || '');
      }
    }

    const { data: feedback } = await supabase.from('uat_feedback').select('*').eq('assignment_id', assignmentId).eq('tester_id', tid).order('created_at', { ascending: false });
    setExistingFeedback(feedback || []);

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;

    setSubmitting(true);
    setSubmitError('');

    const { data: assign } = await supabase.from('uat_assignments').select('job_id').eq('id', assignmentId).maybeSingle();
    const aData = assign as any;
    const jobId = aData?.job_id;

    const { data: job } = jobId ? await supabase.from('uat_jobs').select('project_id, environment_id').eq('id', jobId).maybeSingle() : { data: null };
    const jData = job as any;

    const payload = {
      assignment_id: assignmentId,
      job_id: jobId,
      project_id: jData?.project_id || null,
      environment_id: jData?.environment_id || null,
      tester_id: testerId,
      feedback_type: form.feedback_type,
      severity: form.severity,
      category: form.category || null,
      title: form.title,
      description: form.description,
      steps_to_reproduce: form.steps_to_reproduce || null,
      expected_result: form.expected_result || null,
      actual_result: form.actual_result || null,
      page_url: form.page_url || null,
      device: form.device || null,
      browser: form.browser || null,
      os_version: form.os_version || null,
      screen_size: form.screen_size || null,
      status: 'new',
    };

    const { error } = await supabase.from('uat_feedback').insert(payload);

    if (error) {
      setSubmitError(error.message || 'Failed to submit feedback.');
      setSubmitting(false);
      return;
    }

    await supabase.from('uat_audit_log').insert({
      action: 'Feedback submitted',
      entity_type: 'uat_feedback',
      entity_id: assignmentId,
      new_value: { title: form.title, feedback_type: form.feedback_type, severity: form.severity },
    });

    setSubmitting(false);
    setSubmitted(true);
    setExistingFeedback((prev) => [{ ...payload, created_at: new Date().toISOString() }, ...prev]);
    setForm({
      feedback_type: 'bug', severity: 'medium', category: '',
      page_url: '', device: 'Desktop', browser: 'Chrome', os_version: '',
      screen_size: '', title: '', description: '',
      steps_to_reproduce: '', expected_result: '', actual_result: '',
    });
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
          <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
          <p className="text-slate-400 mb-6">{blockMessage}</p>
          <button onClick={() => router.push('/uat/my-tests')} className="px-5 py-2.5 bg-[#06B6D4] rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap">Back to My Tests</button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-3xl p-12 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Feedback Submitted</h3>
          <p className="text-slate-400 mb-6">Your feedback has been recorded. An admin will review it shortly.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => setSubmitted(false)} className="px-5 py-2.5 bg-[#06B6D4] rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap">Submit Another</button>
            <button onClick={() => router.push('/uat/my-tests')} className="px-5 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-slate-400 hover:text-white cursor-pointer whitespace-nowrap">Back to My Tests</button>
          </div>
        </motion.div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/40 transition-all";
  const labelClass = "block text-sm font-medium text-slate-300 mb-1.5";

  const dropdownTrigger = (value: string, options: string[], isOpen: boolean, toggle: () => void) => (
    <button type="button" onClick={toggle}
      className="w-full px-4 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/40 transition-all">
      <span>{value}</span>
      <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );

  const dropdownMenu = (isOpen: boolean, options: string[], onSelect: (v: string) => void, close: () => void) => (
    isOpen && (
      <div className="absolute z-20 mt-2 w-full bg-[#1E293B] border border-[rgba(255,255,255,0.1)] rounded-xl shadow-xl overflow-hidden">
        {options.map((opt) => (
          <button key={opt} type="button" onClick={() => { onSelect(opt); close(); }}
            className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer first:rounded-t-xl last:rounded-b-xl capitalize">
            {opt}
          </button>
        ))}
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <button onClick={() => router.push('/uat/my-tests')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#06B6D4] transition-colors mb-6 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to My Tests
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Submit Feedback</h1>
          {projectName && <p className="text-sm text-[#06B6D4] mt-0.5">{projectName} — {jobTitle}</p>}
          {!projectName && jobTitle && <p className="text-sm text-slate-400 mt-0.5">{jobTitle}</p>}
        </div>

        {existingFeedback.length > 0 && (
          <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">Previous Feedback ({existingFeedback.length})</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {existingFeedback.map((fb: any) => (
                <div key={fb.id} className="flex items-center justify-between bg-white/[0.02] rounded-xl px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{fb.title}</p>
                    <p className="text-xs text-slate-500">{fb.feedback_type} — {fb.severity}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-lg capitalize shrink-0 ml-3"
                    style={{
                      color: fb.status === 'new' ? '#06B6D4' : fb.status === 'fixed' ? '#10B981' : '#F59E0B',
                      backgroundColor: (fb.status === 'new' ? '#06B6D4' : fb.status === 'fixed' ? '#10B981' : '#F59E0B') + '15',
                    }}>
                    {fb.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Issue Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="relative">
                  <label className={labelClass}>Feedback Type</label>
                  {dropdownTrigger(form.feedback_type.replace(/\b\w/g, (l) => l.toUpperCase()), feedbackTypes.map((ft) => ft.label), typeOpen, () => { setTypeOpen(!typeOpen); setSeverityOpen(false); setDeviceOpen(false); setBrowserOpen(false); })}
                  {dropdownMenu(typeOpen, feedbackTypes.map((ft) => ft.label), (v) => {
                    const found = feedbackTypes.find((ft) => ft.label === v);
                    updateForm('feedback_type', found ? found.value : v.toLowerCase());
                  }, () => setTypeOpen(false))}
                </div>
                <div className="relative">
                  <label className={labelClass}>Severity</label>
                  {dropdownTrigger(form.severity.charAt(0).toUpperCase() + form.severity.slice(1), severityLevels.map((s) => s.charAt(0).toUpperCase() + s.slice(1)), severityOpen, () => { setSeverityOpen(!severityOpen); setTypeOpen(false); setDeviceOpen(false); setBrowserOpen(false); })}
                  {dropdownMenu(severityOpen, severityLevels.map((s) => s.charAt(0).toUpperCase() + s.slice(1)), (v) => updateForm('severity', v.toLowerCase()), () => setSeverityOpen(false))}
                </div>
              </div>

              <div className="mb-4">
                <label className={labelClass}>Title <span className="text-red-400">*</span></label>
                <input type="text" value={form.title} onChange={(e) => updateForm('title', e.target.value)} required
                  placeholder="Brief summary of the issue..." className={inputClass} />
              </div>
              <div className="mb-4">
                <label className={labelClass}>Description <span className="text-red-400">*</span></label>
                <textarea value={form.description} onChange={(e) => updateForm('description', e.target.value)} required
                  placeholder="Describe the issue in detail..." rows={4} className={inputClass + ' resize-none'} />
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <input type="text" value={form.category} onChange={(e) => updateForm('category', e.target.value)}
                  placeholder="e.g. Navigation, Checkout, Dashboard..." className={inputClass} />
              </div>
            </div>

            <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Reproduction Details</h3>
              <div className="mb-4">
                <label className={labelClass}>Steps to Reproduce</label>
                <textarea value={form.steps_to_reproduce} onChange={(e) => updateForm('steps_to_reproduce', e.target.value)}
                  placeholder="Step-by-step instructions to reproduce the issue..." rows={3} className={inputClass + ' resize-none'} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Expected Result</label>
                  <textarea value={form.expected_result} onChange={(e) => updateForm('expected_result', e.target.value)}
                    placeholder="What should happen..." rows={2} className={inputClass + ' resize-none'} />
                </div>
                <div>
                  <label className={labelClass}>Actual Result</label>
                  <textarea value={form.actual_result} onChange={(e) => updateForm('actual_result', e.target.value)}
                    placeholder="What actually happened..." rows={2} className={inputClass + ' resize-none'} />
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">Environment Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelClass}>Page URL</label>
                  <input type="url" value={form.page_url} onChange={(e) => updateForm('page_url', e.target.value)}
                    placeholder="https://..." className={inputClass} />
                </div>
                <div className="relative">
                  <label className={labelClass}>Device</label>
                  {dropdownTrigger(form.device, deviceOptions, deviceOpen, () => { setDeviceOpen(!deviceOpen); setTypeOpen(false); setSeverityOpen(false); setBrowserOpen(false); })}
                  {dropdownMenu(deviceOpen, deviceOptions, (v) => updateForm('device', v), () => setDeviceOpen(false))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <label className={labelClass}>Browser</label>
                  {dropdownTrigger(form.browser, browserOptions, browserOpen, () => { setBrowserOpen(!browserOpen); setTypeOpen(false); setSeverityOpen(false); setDeviceOpen(false); })}
                  {dropdownMenu(browserOpen, browserOptions, (v) => updateForm('browser', v), () => setBrowserOpen(false))}
                </div>
                <div>
                  <label className={labelClass}>OS Version</label>
                  <input type="text" value={form.os_version} onChange={(e) => updateForm('os_version', e.target.value)}
                    placeholder="e.g. Windows 11, macOS 14..." className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Screen Size</label>
                  <input type="text" value={form.screen_size} onChange={(e) => updateForm('screen_size', e.target.value)}
                    placeholder="e.g. 1920x1080..." className={inputClass} />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[rgba(255,255,255,0.08)] bg-white/[0.01]">
              {submitError && (
                <div className="mb-4 p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-sm text-red-400">{submitError}</p>
                </div>
              )}
              <p className="text-xs text-slate-500 mb-4">
                * Screenshot and video upload are not available in this version. TODO: Implement file upload with Supabase Storage.
              </p>
              <button type="submit" disabled={submitting || !form.title.trim() || !form.description.trim()}
                className="px-6 py-3 bg-[#06B6D4] hover:bg-[#0891B2] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-semibold text-white transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Feedback
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}