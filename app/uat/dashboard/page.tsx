'use client';

import { useState, useEffect } from 'react';
import { motion } from '@/components/motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase, FileText, ClipboardCheck, Bug, DollarSign, Clock,
  CheckCircle, AlertCircle, ArrowRight, User, Play,
  ChevronRight, Gauge, WalletCards, MonitorSmartphone, Bell,
} from 'lucide-react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import NotificationDropdown from '@/components/uat/NotificationDropdown';

interface TesterProfile {
  id: string; user_id: string; full_name: string; email: string;
  status: string; experience_level: string;
}

interface UatJob {
  id: string; title: string; public_summary: string | null;
  required_devices: string[] | null; required_experience_level: string | null;
  estimated_hours: number | null; pay_amount: number | null; pay_type: string;
  deadline: string | null; project_name?: string;
}

interface Assignment {
  id: string; job_id: string; status: string; agreed_pay: number | null;
  submitted_at: string | null; job_title?: string; project_name?: string;
}

const assignmentStatusColors: Record<string, string> = {
  assigned: 'bg-sky-100 text-sky-700',
  testing: 'bg-emerald-100 text-emerald-700',
  submitted: 'bg-amber-100 text-amber-700',
  approved: 'bg-violet-100 text-violet-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
  expired: 'bg-slate-100 text-slate-600',
};

const feedbackStatusColors: Record<string, string> = {
  new: 'bg-cyan-100 text-cyan-700',
  reviewing: 'bg-violet-100 text-violet-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  duplicate: 'bg-amber-100 text-amber-700',
  rejected: 'bg-rose-100 text-rose-700',
  fixed: 'bg-emerald-100 text-emerald-700',
  retest_needed: 'bg-orange-100 text-orange-700',
  closed: 'bg-slate-100 text-slate-600',
};

const paymentStatusColors: Record<string, string> = {
  unpaid: 'bg-slate-100 text-slate-600',
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-cyan-100 text-cyan-700',
  paid: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

export default function TesterDashboard() {
  const router = useRouter();
  const [tester, setTester] = useState<TesterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [openJobs, setOpenJobs] = useState<UatJob[]>([]);
  const [activeAssignments, setActiveAssignments] = useState<Assignment[]>([]);
  const [recentFeedback, setRecentFeedback] = useState<any[]>([]);
  const [stats, setStats] = useState({
    availableJobs: 0, myApplications: 0, activeTests: 0,
    feedbackCount: 0, totalEarned: 0, pendingPayments: 0,
  });

  const { notifications, toast, unreadCount, markAllRead, markRead, clearAll } = useRealtimeNotifications(tester?.user_id || null);

  useEffect(() => {
    const tid = sessionStorage.getItem('uatTesterId');
    if (!tid) { setTimeout(() => router.push('/uat-testing'), 0); return; }
    loadData(tid);
  }, []);

  const loadData = async (tid: string) => {
    const { data: t } = await supabase.from('uat_testers').select('id, user_id, full_name, email, status, experience_level').eq('id', tid).maybeSingle();
    if (!t) { sessionStorage.removeItem('uatTesterId'); setTimeout(() => router.push('/uat-testing'), 0); return; }

    const testerData = t as any;
    if (testerData.status !== 'approved') { setBlocked(true); setTester(testerData); setLoading(false); return; }
    setTester(testerData);

    const [
      { data: jobs }, { data: apps }, { data: assignments },
      { data: feedback }, { data: payments },
    ] = await Promise.all([
      supabase.from('uat_jobs').select('id, title, public_summary, required_devices, required_experience_level, estimated_hours, pay_amount, pay_type, deadline, project_id').eq('status', 'open').order('created_at', { ascending: false }).limit(5),
      supabase.from('uat_job_applications').select('id, job_id').eq('tester_id', tid),
      supabase.from('uat_assignments').select('id, job_id, status, agreed_pay, submitted_at').eq('tester_id', tid).order('created_at', { ascending: false }),
      supabase.from('uat_feedback').select('id, title, job_id, severity, status, created_at').eq('tester_id', tid).order('created_at', { ascending: false }).limit(5),
      supabase.from('uat_payments').select('id, total_amount, status').eq('tester_id', tid),
    ]);

    const appSet = new Set((apps || []).map((a: any) => a.job_id));
    const activeTests = (assignments || []).filter((a: any) => ['assigned', 'testing', 'submitted', 'approved'].includes(a.status));
    const totalEarned = (payments || []).filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + (p.total_amount || 0), 0);
    const pendingAmt = (payments || []).filter((p: any) => ['unpaid', 'pending', 'approved'].includes(p.status)).reduce((sum: number, p: any) => sum + (p.total_amount || 0), 0);

    setStats({
      availableJobs: (jobs || []).length,
      myApplications: (apps || []).length,
      activeTests: activeTests.length,
      feedbackCount: (feedback || []).length,
      totalEarned,
      pendingPayments: pendingAmt,
    });

    const jobIds = [...new Set([...(jobs || []).map((j: any) => j.project_id).filter(Boolean)])];
    const projMap: Record<string, string> = {};
    if (jobIds.length > 0) {
      const { data: projData } = await supabase.from('uat_projects').select('id, name').in('id', jobIds);
      projData?.forEach((p: any) => { projMap[p.id] = p.name; });
    }

    setOpenJobs((jobs || []).slice(0, 3).map((j: any) => ({ ...j, project_name: projMap[j.project_id] || null })));

    const assignJobIds = [...new Set(activeTests.map((a: any) => a.job_id))];
    const assignJobMap: Record<string, any> = {};
    const assignProjMap: Record<string, string> = {};
    if (assignJobIds.length > 0) {
      const { data: ajData } = await supabase.from('uat_jobs').select('id, title, project_id').in('id', assignJobIds);
      ajData?.forEach((j: any) => { assignJobMap[j.id] = j; });
      const apIds = [...new Set(ajData?.map((j: any) => j.project_id).filter(Boolean) || [])];
      if (apIds.length > 0) {
        const { data: apData } = await supabase.from('uat_projects').select('id, name').in('id', apIds);
        apData?.forEach((p: any) => { assignProjMap[p.id] = p.name; });
      }
    }

    setActiveAssignments(activeTests.slice(0, 3).map((a: any) => ({
      ...a,
      job_title: assignJobMap[a.job_id]?.title || 'Unknown',
      project_name: assignProjMap[assignJobMap[a.job_id]?.project_id] || null,
    })));

    const fbJobIds = [...new Set((feedback || []).map((f: any) => f.job_id))];
    const fbJobMap: Record<string, any> = {};
    if (fbJobIds.length > 0) {
      const { data: fjData } = await supabase.from('uat_jobs').select('id, title').in('id', fbJobIds);
      fjData?.forEach((j: any) => { fbJobMap[j.id] = j; });
    }

    setRecentFeedback((feedback || []).map((f: any) => ({
      ...f,
      job_title: fbJobMap[f.job_id]?.title || null,
    })));

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-[#2878d0]/20 border-t-[#2878d0] rounded-full animate-spin" />
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-8">
        <div className="bg-white border border-slate-100 rounded-3xl p-12 shadow-sm text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-[#17325c] mb-2">Account Not Approved</h3>
          <p className="text-slate-500 mb-6">Your tester account is currently <span className="font-semibold capitalize">{(tester as any)?.status}</span>. You&apos;ll get access once approved.</p>
          <button onClick={() => router.push('/uat-testing')} className="px-5 py-2.5 bg-[#2878d0] rounded-xl text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:bg-[#1e6bc0] transition-colors">Back to Home</button>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Available Jobs', value: stats.availableJobs, icon: Briefcase, color: '#2878d0', bg: 'bg-sky-100', href: '/uat/jobs' },
    { label: 'My Applications', value: stats.myApplications, icon: FileText, color: '#7C3AED', bg: 'bg-violet-100', href: '/uat/applications' },
    { label: 'Active Tests', value: stats.activeTests, icon: ClipboardCheck, color: '#10B981', bg: 'bg-emerald-100', href: '/uat/my-tests' },
    { label: 'Feedback', value: stats.feedbackCount, icon: Bug, color: '#F59E0B', bg: 'bg-amber-100', href: '/uat/my-feedback' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-center text-sm text-amber-900">
        Welcome to your live tester dashboard. All data shown is real and connected to your account.
      </div>

      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-100 bg-white/95 px-5 backdrop-blur lg:px-8">
        <div className="flex items-center gap-5">
          <Link href="/uat-testing" className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#2878d0] whitespace-nowrap">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            UAT Network
          </Link>
          <span className="hidden text-sm font-bold text-[#2878d0] sm:inline">DFP <span className="font-normal text-slate-300">/</span> <span className="font-medium text-[#17325c]">Tester Portal</span></span>
        </div>
        <div className="flex items-center gap-4">
          <NotificationDropdown
            unreadCount={unreadCount}
            notifications={notifications}
            markAllRead={markAllRead}
            markRead={markRead}
            clearAll={clearAll}
          />
          <Link href="/uat/profile" className="flex items-center gap-3 rounded-full bg-white py-1 pl-1 pr-3 hover:bg-slate-50">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f0e1] font-bold text-[#617a50] text-sm">
              {tester?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'TS'}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold">{tester?.full_name || 'Tester'}</span>
              <span className="block text-xs text-[#789265] capitalize">{tester?.status || 'Active'}</span>
            </span>
          </Link>
        </div>
      </header>

      {toast && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-24 right-6 z-50"
        >
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-lg max-w-sm">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${toast.type === 'new_job' ? 'bg-sky-100 text-[#2878d0]' : toast.type === 'application_update' ? 'bg-violet-100 text-[#7C3AED]' : 'bg-emerald-100 text-[#10B981]'}`}>
              {toast.type === 'new_job' ? <Briefcase className="h-5 w-5" /> : toast.type === 'application_update' ? <FileText className="h-5 w-5" /> : <ClipboardCheck className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#17325c]">{toast.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{toast.message}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mx-auto max-w-[1500px] px-5 py-6 sm:px-7 sm:py-8 lg:px-9">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#789265]">Tester Dashboard</p>
            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight sm:text-5xl text-[#17325c]">
              Welcome back{', '}
              <span className="text-[#2878d0]">{tester?.full_name?.split(' ')[0] || 'Tester'}</span>
            </h1>
            <p className="mt-2 text-slate-500">Your testing journey at a glance — jobs, tests, feedback and earnings.</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
            <WalletCards className="h-5 w-5 text-[#10B981]" />
            <div>
              <p className="text-xs text-slate-400">Total earned</p>
              <p className="text-lg font-bold text-[#17325c]">£{stats.totalEarned.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(({ label, value, icon: Icon, color, bg, href }, i) => (
            <motion.button
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => router.push(href)}
              className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm text-left hover:border-[#2878d0]/20 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-full ${bg}`} style={{ color }}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-[#17325c]">{value}</p>
                <p className="text-sm font-semibold text-slate-600">{label}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#2878d0] transition-colors shrink-0" />
            </motion.button>
          ))}
        </div>

        {stats.pendingPayments > 0 && (
          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <Clock className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-800">Payments pending</p>
                <p className="text-xs text-emerald-600">You have £{stats.pendingPayments.toFixed(2)} awaiting payout</p>
              </div>
            </div>
            <Link href="/uat/payments" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900 whitespace-nowrap">View payments <ChevronRight className="inline h-4 w-4" /></Link>
          </div>
        )}

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="font-serif text-2xl font-semibold text-[#17325c]">Available Jobs</h2>
                <Link href="/uat/jobs" className="text-sm font-semibold text-[#2878d0] hover:underline whitespace-nowrap">View all</Link>
              </div>
              {openJobs.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 font-medium text-slate-500">No open jobs right now</p>
                  <p className="mt-1 text-sm text-slate-400">Check back soon for new testing opportunities</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {openJobs.map((job) => (
                    <div key={job.id} className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(200px,1.5fr)_0.8fr_0.6fr_0.5fr_auto] md:items-center">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100">
                          <MonitorSmartphone className="h-5 w-5 text-[#2878d0]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#17325c] truncate">{job.title}</p>
                          <p className="mt-1 text-xs text-slate-500">{job.project_name || 'DFP Project'}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500">{job.required_devices?.join(', ') || 'Any device'}</p>
                      <p className="flex items-center gap-1 text-sm text-slate-500">
                        <Clock className="h-4 w-4" />{job.estimated_hours ? `${job.estimated_hours}h` : '-'}
                      </p>
                      <span className="w-fit rounded-lg bg-[#edf4e8] px-3 py-1 text-sm font-bold text-[#617a50] whitespace-nowrap">
                        {job.pay_amount ? `£${job.pay_amount}` : '-'}
                      </span>
                      <Link href={`/uat/jobs/${job.id}`} className="rounded-xl bg-slate-100 px-4 py-2.5 text-center text-sm font-semibold text-slate-600 hover:bg-[#2878d0] hover:text-white transition-colors whitespace-nowrap">
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {activeAssignments.length > 0 && (
              <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <h2 className="font-serif text-2xl font-semibold text-[#17325c]">Active Tests</h2>
                  <Link href="/uat/my-tests" className="text-sm font-semibold text-[#2878d0] hover:underline whitespace-nowrap">View all</Link>
                </div>
                <div className="divide-y divide-slate-100">
                  {activeAssignments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between px-5 py-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[#17325c] truncate">{a.job_title}</p>
                          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${assignmentStatusColors[a.status] || 'bg-slate-100 text-slate-600'}`}>
                            {a.status}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{a.project_name || 'DFP Project'}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {a.agreed_pay && <span className="text-sm font-bold text-[#617a50]">£{a.agreed_pay}</span>}
                        <Link href={`/uat/my-tests/${a.id}`} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-[#2878d0] hover:text-white transition-colors whitespace-nowrap">Open</Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="font-serif text-2xl font-semibold text-[#17325c]">Recent Feedback</h2>
                <Link href="/uat/my-feedback" className="text-sm font-semibold text-[#2878d0] hover:underline whitespace-nowrap">View all</Link>
              </div>
              {recentFeedback.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <Bug className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 font-medium text-slate-500">No feedback submitted yet</p>
                  <p className="mt-1 text-sm text-slate-400">Submit reports from your active tests</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[620px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-5 py-3">Title</th>
                        <th className="px-5 py-3">Severity</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Submitted</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentFeedback.map((fb) => (
                        <tr key={fb.id}>
                          <td className="px-5 py-4">
                            <p className="font-medium text-[#17325c]">{fb.title}</p>
                            {fb.job_title && <p className="mt-0.5 text-xs text-slate-400">{fb.job_title}</p>}
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-xs font-semibold capitalize text-slate-600">{fb.severity || '-'}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${feedbackStatusColors[fb.status] || 'bg-slate-100 text-slate-600'}`}>
                              {(fb.status || '').replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-500 text-xs">
                            {fb.created_at ? new Date(fb.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-semibold text-[#17325c]">Tester Score</h2>
                <Gauge className="h-5 w-5 text-[#2878d0]" />
              </div>
              <div className="mx-auto mt-5 flex h-36 w-36 flex-col items-center justify-center rounded-full border-[10px] border-[#86a66f] bg-white">
                <span className="text-4xl font-bold text-[#17325c]">--</span>
                <span className="text-[10px] text-slate-400">Building data</span>
              </div>
              <div className="mt-6 space-y-3">
                {[
                  { label: 'Assignments completed', value: stats.activeTests },
                  { label: 'Feedback submitted', value: stats.feedbackCount },
                  { label: 'Applications sent', value: stats.myApplications },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-semibold text-[#17325c]">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-semibold text-[#17325c]">Payments</h2>
                <WalletCards className="h-5 w-5 text-[#10B981]" />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-xs text-slate-500">Total Earned</p>
                  <p className="mt-1 text-xl font-bold text-[#17325c]">£{stats.totalEarned.toFixed(2)}</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-4">
                  <p className="text-xs text-slate-500">Pending</p>
                  <p className="mt-1 text-xl font-bold text-[#17325c]">£{stats.pendingPayments.toFixed(2)}</p>
                </div>
              </div>
              <Link href="/uat/payments" className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:border-[#2878d0] hover:text-[#2878d0] transition-colors whitespace-nowrap">
                View Payment History <ChevronRight className="h-4 w-4" />
              </Link>
            </section>
          </aside>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-[#17325c]">Quick Actions</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              [Play, 'Browse Jobs', 'Find new testing opportunities', '/uat/jobs'],
              [FileText, 'My Applications', 'Track your applications', '/uat/applications'],
              [ClipboardCheck, 'My Tests', 'View active assignments', '/uat/my-tests'],
              [Bug, 'Submit Feedback', 'Report bugs & issues', '/uat/my-feedback'],
            ].map(([Icon, title, copy, href]) => {
              const ActionIcon = Icon as typeof Play;
              return (
                <Link
                  key={title as string}
                  href={href as string}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-[#2878d0] hover:bg-sky-50 cursor-pointer"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-100">
                    <ActionIcon className="h-5 w-5 text-[#2878d0]" />
                  </div>
                  <span>
                    <span className="block font-semibold text-[#17325c]">{title as string}</span>
                    <span className="mt-1 block text-xs text-slate-500">{copy as string}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}