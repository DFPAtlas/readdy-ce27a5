'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, CheckCircle, XCircle, Copy, RefreshCw, X,
  Play, Ban, ExternalLink, Loader2, AlertCircle,
} from 'lucide-react';
import AdminShell from '../../../../../components/admin/AdminShell';



const statusColors: Record<string, string> = {
  new: '#06B6D4', reviewing: '#8B5CF6', accepted: '#10B981',
  duplicate: '#F59E0B', rejected: '#EF4444', fixed: '#10B981',
  retest_needed: '#F97316', closed: '#6B7280',
};

const severityColors: Record<string, string> = {
  critical: '#EF4444', high: '#F97316', medium: '#F59E0B', low: '#6B7280',
};

export default function AdminFeedbackDetail({ feedbackId }: { feedbackId: string }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [feedbackId]);

  const fetchData = async () => {
    const { data: fb } = await supabase.from('uat_feedback').select('*').eq('id', feedbackId).maybeSingle();
    if (!fb) { setNotFound(true); setLoading(false); return; }

    const fData = fb as any;

    const [{ data: tester }, { data: job }, { data: proj }] = await Promise.all([
      supabase.from('uat_testers').select('full_name, email').eq('id', fData.tester_id).maybeSingle(),
      fData.job_id ? supabase.from('uat_jobs').select('title').eq('id', fData.job_id).maybeSingle() : Promise.resolve({ data: null }),
      fData.project_id ? supabase.from('uat_projects').select('name').eq('id', fData.project_id).maybeSingle() : Promise.resolve({ data: null }),
    ]);

    setFeedback({
      ...fData,
      tester_name: (tester as any)?.full_name || 'Unknown',
      tester_email: (tester as any)?.email || '',
      job_title: (job as any)?.title || null,
      project_name: (proj as any)?.name || null,
    });
    setAdminNote(fData.admin_notes || '');
    setLoading(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    setStatusUpdating(true);
    setError('');
    const { error: err } = await supabase.from('uat_feedback').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', feedbackId);
    if (err) { setError(err.message); setStatusUpdating(false); return; }

    await supabase.from('uat_audit_log').insert({
      action: `Feedback ${newStatus}`,
      entity_type: 'uat_feedback',
      entity_id: feedbackId,
      new_value: { status: newStatus },
    });
    setStatusUpdating(false);
    setFeedback((prev: any) => ({ ...prev, status: newStatus }));
  };

  const handleSaveNote = async () => {
    setNoteSaving(true);
    await supabase.from('uat_feedback').update({ admin_notes: adminNote, updated_at: new Date().toISOString() }).eq('id', feedbackId);
    await supabase.from('uat_audit_log').insert({
      action: 'Admin note updated',
      entity_type: 'uat_feedback',
      entity_id: feedbackId,
      new_value: { admin_notes: adminNote },
    });
    setNoteSaving(false);
    setFeedback((prev: any) => ({ ...prev, admin_notes: adminNote }));
  };

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-[#06B6D4]/30 border-t-[#06B6D4] rounded-full animate-spin" />
        </div>
      </AdminShell>
    );
  }

  if (notFound) {
    return (
      <AdminShell>
        <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-2xl p-12 text-center max-w-md mx-auto mt-16">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Feedback Not Found</h3>
          <p className="text-sm text-slate-400 mb-6">This feedback entry does not exist.</p>
          <button onClick={() => router.push('/admin/uat/feedback')} className="px-5 py-2.5 bg-[#06B6D4] rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap">Back to Feedback</button>
        </div>
      </AdminShell>
    );
  }

  if (!feedback) return null;

  const statusActions = (() => {
    switch (feedback.status) {
      case 'new': return ['reviewing', 'accepted', 'rejected', 'duplicate'];
      case 'reviewing': return ['accepted', 'rejected', 'duplicate'];
      case 'accepted': return ['fixed', 'closed'];
      case 'fixed': return ['retest_needed', 'closed'];
      case 'retest_needed': return ['closed'];
      case 'duplicate': case 'rejected': return ['closed'];
      default: return [];
    }
  })();

  const actionLabelMap: Record<string, string> = {
    reviewing: 'Start Review', accepted: 'Accept', rejected: 'Reject',
    duplicate: 'Mark Duplicate', fixed: 'Mark Fixed',
    retest_needed: 'Retest Needed', closed: 'Close',
  };

  const actionIcons: Record<string, any> = {
    reviewing: Play, accepted: CheckCircle, rejected: Ban,
    duplicate: Copy, fixed: CheckCircle, retest_needed: RefreshCw, closed: X,
  };

  const actionColors: Record<string, string> = {
    reviewing: '#8B5CF6', accepted: '#10B981', rejected: '#EF4444',
    duplicate: '#F59E0B', fixed: '#10B981', retest_needed: '#F97316', closed: '#6B7280',
  };

  return (
    <AdminShell>
      <div className="max-w-3xl mx-auto">
        <button onClick={() => router.push('/admin/uat/feedback')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#06B6D4] transition-colors mb-6 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to Feedback
        </button>

        <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize"
                style={{ color: statusColors[feedback.status] || '#94A3B8', backgroundColor: (statusColors[feedback.status] || '#94A3B8') + '15' }}>
                {feedback.status.replace('_', ' ')}
              </span>
              <span className="inline-flex px-2.5 py-0.5 rounded-lg text-xs font-medium capitalize"
                style={{ color: severityColors[feedback.severity] || '#6B7280', backgroundColor: (severityColors[feedback.severity] || '#6B7280') + '15' }}>
                {feedback.severity}
              </span>
              <span className="text-xs text-slate-500 capitalize">{feedback.feedback_type}</span>
            </div>
            <h1 className="text-xl font-bold text-white">{feedback.title}</h1>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-sm text-slate-400">
              <span>Tester: {feedback.tester_name} ({feedback.tester_email})</span>
              {feedback.project_name && <span>Project: {feedback.project_name}</span>}
              {feedback.job_title && <span>Job: {feedback.job_title}</span>}
              {feedback.category && <span>Category: {feedback.category}</span>}
            </div>
          </div>

          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {feedback.device && (
                <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.06)] rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-0.5">Device</p>
                  <p className="text-slate-300">{feedback.device}</p>
                </div>
              )}
              {feedback.browser && (
                <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.06)] rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-0.5">Browser</p>
                  <p className="text-slate-300">{feedback.browser}</p>
                </div>
              )}
              {feedback.os_version && (
                <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.06)] rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-0.5">OS</p>
                  <p className="text-slate-300">{feedback.os_version}</p>
                </div>
              )}
              {feedback.screen_size && (
                <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.06)] rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-0.5">Screen</p>
                  <p className="text-slate-300">{feedback.screen_size}</p>
                </div>
              )}
            </div>

            {feedback.page_url && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Page URL</p>
                <a href={feedback.page_url} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-[#06B6D4] hover:underline break-all flex items-center gap-1.5">
                  {feedback.page_url} <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <div>
              <p className="text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Description</p>
              <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{feedback.description}</p>
              </div>
            </div>

            {feedback.steps_to_reproduce && (
              <div>
                <p className="text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Steps to Reproduce</p>
                <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
                  <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{feedback.steps_to_reproduce}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedback.expected_result && (
                <div>
                  <p className="text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Expected Result</p>
                  <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{feedback.expected_result}</p>
                  </div>
                </div>
              )}
              {feedback.actual_result && (
                <div>
                  <p className="text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Actual Result</p>
                  <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{feedback.actual_result}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide">Admin Notes</p>
              <div className="flex gap-2">
                <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Add internal notes..."
                  className="flex-1 px-4 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/40 transition-all resize-none"
                  rows={3} />
                <button onClick={handleSaveNote} disabled={noteSaving || adminNote === (feedback.admin_notes || '')}
                  className="px-4 py-2 bg-[#06B6D4] hover:bg-[#0891B2] disabled:opacity-40 rounded-xl text-sm font-semibold text-white transition-colors cursor-pointer whitespace-nowrap self-end">
                  {noteSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
                </button>
              </div>
            </div>

            {statusActions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                {statusActions.map((status) => {
                  const Icon = actionIcons[status] || Play;
                  return (
                    <button key={status} onClick={() => handleStatusChange(status)} disabled={statusUpdating}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer whitespace-nowrap flex items-center gap-2 transition-colors disabled:opacity-50"
                      style={{ color: actionColors[status], backgroundColor: actionColors[status] + '15', border: '1px solid ' + actionColors[status] + '30' }}>
                      <Icon className="w-4 h-4" />
                      {actionLabelMap[status]}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}