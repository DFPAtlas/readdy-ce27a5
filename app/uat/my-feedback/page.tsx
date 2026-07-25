'use client';

import { useState, useEffect } from 'react';
import { motion } from '@/components/motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, AlertCircle, FileText, Search, RefreshCw,
  Bug, Eye, ChevronLeft, ChevronRight, Filter, ChevronDown,
} from 'lucide-react';



const severityColors: Record<string, string> = {
  critical: '#EF4444', high: '#F97316', medium: '#F59E0B', low: '#6B7280',
};

const statusColors: Record<string, string> = {
  new: '#06B6D4', reviewing: '#8B5CF6', accepted: '#10B981',
  duplicate: '#F59E0B', rejected: '#EF4444', fixed: '#10B981',
  retest_needed: '#F97316', closed: '#6B7280',
};

const typeIcons: Record<string, string> = {
  bug: 'ri-bug-line', 'usability issue': 'ri-emotion-unhappy-line',
  'broken link': 'ri-link-unlink', 'payment issue': 'ri-money-dollar-circle-line',
  'login issue': 'ri-lock-line', 'design feedback': 'ri-palette-line',
  'mobile issue': 'ri-smartphone-line', 'accessibility issue': 'ri-eye-line',
  'performance issue': 'ri-speed-up-line', other: 'ri-question-line',
};

export default function MyFeedbackPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<any[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<any[]>([]);
  const [testerId, setTesterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFb, setSelectedFb] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

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

    const { data: fb } = await supabase.from('uat_feedback').select('*').eq('tester_id', tid).order('created_at', { ascending: false });

    if (fb && fb.length > 0) {
      const jobIds = [...new Set(fb.map((f: any) => f.job_id).filter(Boolean))];
      const projectIds = [...new Set(fb.map((f: any) => f.project_id).filter(Boolean))];

      const [{ data: jobs }, { data: projects }] = await Promise.all([
        jobIds.length > 0 ? supabase.from('uat_jobs').select('id, title').in('id', jobIds as any) : Promise.resolve({ data: [] }),
        projectIds.length > 0 ? supabase.from('uat_projects').select('id, name').in('id', projectIds as any) : Promise.resolve({ data: [] }),
      ]);

      const jobMap: Record<string, string> = {};
      jobs?.forEach((j: any) => { jobMap[j.id] = j.title; });
      const projMap: Record<string, string> = {};
      projects?.forEach((p: any) => { projMap[p.id] = p.name; });

      const merged = fb.map((f: any) => ({
        ...f,
        job_title: jobMap[f.job_id] || null,
        project_name: projMap[f.project_id] || null,
      }));
      setFeedback(merged);
      setFilteredFeedback(merged);
    }

    setLoading(false);
  };

  useEffect(() => {
    let filtered = feedback;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((f) =>
        (f.title && f.title.toLowerCase().includes(q)) ||
        (f.description && f.description.toLowerCase().includes(q)) ||
        (f.project_name && f.project_name.toLowerCase().includes(q)) ||
        (f.job_title && f.job_title.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== 'all') filtered = filtered.filter((f) => f.status === statusFilter);
    setFilteredFeedback(filtered);
  }, [searchQuery, statusFilter, feedback]);

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
          <p className="text-slate-400 mb-6">Your tester account must be approved before you can view feedback.</p>
          <button onClick={() => router.push('/uat/dashboard')} className="px-5 py-2.5 bg-[#06B6D4] rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <button onClick={() => router.push('/uat/dashboard')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#06B6D4] transition-colors mb-6 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">My Feedback</h1>
          <p className="text-sm text-slate-400 mt-0.5">All the bugs, issues, and feedback you&apos;ve submitted</p>
        </div>

        <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" placeholder="Search feedback..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/40 transition-all" />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-9 pr-8 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20 focus:border-[#06B6D4]/40 cursor-pointer appearance-none">
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="accepted">Accepted</option>
                  <option value="duplicate">Duplicate</option>
                  <option value="rejected">Rejected</option>
                  <option value="fixed">Fixed</option>
                  <option value="retest_needed">Retest Needed</option>
                  <option value="closed">Closed</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              </div>
              <button onClick={() => { setLoading(true); loadData(testerId!); }}
                className="px-4 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-slate-400 hover:text-[#06B6D4] transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>

          {filteredFeedback.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-slate-500/10 flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Feedback Yet</h3>
              <p className="text-sm text-slate-400 mb-6">
                {feedback.length === 0 ? 'You haven\'t submitted any feedback. Go to an active test to report issues.' : 'No feedback matches your filters.'}
              </p>
              {feedback.length === 0 && (
                <button onClick={() => router.push('/uat/my-tests')} className="px-5 py-2.5 bg-[#06B6D4] rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap">Go to My Tests</button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)]">
                    <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Title</th>
                    <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Type</th>
                    <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Severity</th>
                    <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Project</th>
                    <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-slate-500 px-6 py-3">Date</th>
                    <th className="text-right text-xs font-medium text-slate-500 px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedback.map((fb: any) => (
                    <tr key={fb.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-white max-w-xs truncate">{fb.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <i className={`${typeIcons[fb.feedback_type] || 'ri-question-line'} text-sm text-slate-500`}></i>
                          <span className="text-xs text-slate-400 capitalize">{fb.feedback_type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-0.5 rounded-lg text-xs font-medium capitalize"
                          style={{ color: severityColors[fb.severity] || '#6B7280', backgroundColor: (severityColors[fb.severity] || '#6B7280') + '15' }}>
                          {fb.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-400">{fb.project_name || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-0.5 rounded-lg text-xs font-medium capitalize"
                          style={{ color: statusColors[fb.status] || '#94A3B8', backgroundColor: (statusColors[fb.status] || '#94A3B8') + '15' }}>
                          {fb.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-500">{new Date(fb.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setSelectedFb(fb); setDetailOpen(true); }}
                          className="p-1.5 rounded-lg bg-white/5 border border-[rgba(255,255,255,0.06)] text-slate-400 hover:text-[#06B6D4] hover:border-[#06B6D4]/20 cursor-pointer">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {detailOpen && selectedFb && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setDetailOpen(false)}>
          <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex px-2 py-0.5 rounded-lg text-xs font-medium capitalize"
                  style={{ color: statusColors[selectedFb.status] || '#94A3B8', backgroundColor: (statusColors[selectedFb.status] || '#94A3B8') + '15' }}>
                  {selectedFb.status.replace('_', ' ')}
                </span>
                <button onClick={() => setDetailOpen(false)} className="text-slate-500 hover:text-white cursor-pointer text-xl leading-none">&times;</button>
              </div>
              <h2 className="text-lg font-bold text-white mb-1">{selectedFb.title}</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs text-slate-400 capitalize">{selectedFb.feedback_type}</span>
                <span className="inline-flex px-1.5 py-0.5 rounded text-xs font-medium capitalize"
                  style={{ color: severityColors[selectedFb.severity] || '#6B7280', backgroundColor: (severityColors[selectedFb.severity] || '#6B7280') + '15' }}>
                  {selectedFb.severity}
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Description</p>
                  <p className="text-slate-300 whitespace-pre-wrap">{selectedFb.description}</p>
                </div>
                {selectedFb.steps_to_reproduce && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Steps to Reproduce</p>
                    <p className="text-slate-300 whitespace-pre-wrap">{selectedFb.steps_to_reproduce}</p>
                  </div>
                )}
                {selectedFb.expected_result && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Expected Result</p>
                    <p className="text-slate-300 whitespace-pre-wrap">{selectedFb.expected_result}</p>
                  </div>
                )}
                {selectedFb.actual_result && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Actual Result</p>
                    <p className="text-slate-300 whitespace-pre-wrap">{selectedFb.actual_result}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-3 text-xs text-slate-500 pt-2 border-t border-[rgba(255,255,255,0.06)] mt-3">
                  {selectedFb.device && <span>Device: {selectedFb.device}</span>}
                  {selectedFb.browser && <span>Browser: {selectedFb.browser}</span>}
                  {selectedFb.os_version && <span>OS: {selectedFb.os_version}</span>}
                  {selectedFb.screen_size && <span>Screen: {selectedFb.screen_size}</span>}
                  {selectedFb.page_url && <span className="block w-full truncate">URL: {selectedFb.page_url}</span>}
                </div>
                {selectedFb.admin_notes && (
                  <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] mt-3">
                    <p className="text-xs text-slate-500 mb-1">Admin Notes</p>
                    <p className="text-slate-300 whitespace-pre-wrap">{selectedFb.admin_notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}