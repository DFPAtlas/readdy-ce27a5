'use client';

import { useState, useEffect } from 'react';
import { motion } from '@/components/motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Briefcase, ClipboardCheck, Clock, DollarSign, FileText,
  AlertCircle, CheckCircle, TrendingUp, ArrowRight, User, Play, Wallet, Award,
} from 'lucide-react';



interface TesterProfile {
  id: string; full_name: string; email: string;
  status: string; experience_level: string;
}

export default function TesterDashboard() {
  const router = useRouter();
  const [tester, setTester] = useState<TesterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [stats, setStats] = useState({
    availableJobs: 0, myApplications: 0, activeTests: 0,
    feedbackSubmitted: 0, paymentsPending: 0, paymentsPaid: 0,
    myFeedback: 0,
  });

  useEffect(() => {
    const testerId = sessionStorage.getItem('uatTesterId');
    if (!testerId) { setTimeout(() => router.push('/uat-testing'), 0); return; }
    loadData(testerId);
  }, []);

  const loadData = async (testerId: string) => {
    const { data: t } = await supabase.from('uat_testers').select('*').eq('id', testerId).maybeSingle();
    if (!t) { sessionStorage.removeItem('uatTesterId'); setTimeout(() => router.push('/uat-testing'), 0); return; }

    const testerData = t as any;
    if (testerData.status !== 'approved') { setBlocked(true); setTester(testerData); setLoading(false); return; }

    setTester(testerData);

    const [{ count: openJobs }, { count: myApps }, { count: myAssignments }, { count: submittedAssignments }, { count: myFeedback }] = await Promise.all([
      supabase.from('uat_jobs').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('uat_job_applications').select('*', { count: 'exact', head: true }).eq('tester_id', testerId),
      supabase.from('uat_assignments').select('*', { count: 'exact', head: true }).eq('tester_id', testerId).in('status', ['assigned', 'testing']),
      supabase.from('uat_assignments').select('*', { count: 'exact', head: true }).eq('tester_id', testerId).in('status', ['submitted', 'approved', 'completed']),
      supabase.from('uat_feedback').select('*', { count: 'exact', head: true }).eq('tester_id', testerId),
    ]);

    setStats({
      availableJobs: openJobs || 0,
      myApplications: myApps || 0,
      activeTests: myAssignments || 0,
      feedbackSubmitted: submittedAssignments || 0,
      paymentsPending: myAssignments || 0,
      paymentsPaid: (myAssignments || 0),
      myFeedback: myFeedback || 0,
    });

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
          <p className="text-slate-400 mb-6">Your tester account must be approved before you can access the dashboard. Please wait for admin approval.</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Available Jobs', value: stats.availableJobs, icon: Briefcase, color: '#06B6D4', onClick: () => router.push('/uat/jobs') },
    { label: 'My Applications', value: stats.myApplications, icon: FileText, color: '#8B5CF6', onClick: () => router.push('/uat/applications') },
    { label: 'Active Tests', value: stats.activeTests, icon: ClipboardCheck, color: '#10B981', onClick: () => router.push('/uat/my-tests') },
    { label: 'Feedback Submitted', value: stats.myFeedback, icon: CheckCircle, color: '#F59E0B', onClick: () => router.push('/uat/my-feedback') },
    { label: 'Feedback Done', value: stats.feedbackSubmitted, icon: CheckCircle, color: '#F59E0B', onClick: () => router.push('/uat/my-tests') },
    { label: 'Payments Pending', value: stats.paymentsPending, icon: Clock, color: '#EC4899', onClick: () => router.push('/uat/payments') },
    { label: 'Paid', value: stats.paymentsPaid, icon: DollarSign, color: '#10B981', onClick: () => router.push('/uat/payments') },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Tester Dashboard</h1>
            <p className="text-sm text-slate-400 mt-0.5">Welcome back, {tester?.full_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-white font-medium">{tester?.full_name}</p>
              <p className="text-xs text-slate-500">{tester?.experience_level}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#06B6D4]/20 flex items-center justify-center">
              <User className="w-4 h-4 text-[#06B6D4]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {statCards.map((card, i) => (
            <motion.button
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={card.onClick}
              className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5 text-left hover:border-[rgba(255,255,255,0.12)] transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: card.color + '15' }}>
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-xs text-slate-400 mt-1">{card.label}</p>
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => router.push('/uat/jobs')}
            className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 text-left hover:border-[#06B6D4]/20 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Browse Jobs</h3>
                <p className="text-sm text-slate-400">Find available UAT testing opportunities</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center group-hover:bg-[#06B6D4]/20 transition-all">
                <Briefcase className="w-6 h-6 text-[#06B6D4]" />
              </div>
            </div>
          </button>
          <button onClick={() => router.push('/uat/applications')}
            className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 text-left hover:border-[#8B5CF6]/20 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">My Applications</h3>
                <p className="text-sm text-slate-400">Track your applications and active tests</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center group-hover:bg-[#8B5CF6]/20 transition-all">
                <FileText className="w-6 h-6 text-[#8B5CF6]" />
              </div>
            </div>
          </button>
          <button onClick={() => router.push('/uat/my-tests')}
            className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 text-left hover:border-[#10B981]/20 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">My Tests</h3>
                <p className="text-sm text-slate-400">View your assigned test packages and instructions</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center group-hover:bg-[#10B981]/20 transition-all">
                <Play className="w-6 h-6 text-[#10B981]" />
              </div>
            </div>
          </button>
          <button onClick={() => router.push('/uat/my-feedback')}
            className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 text-left hover:border-[#F59E0B]/20 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">My Feedback</h3>
                <p className="text-sm text-slate-400">View all bugs and feedback you have submitted</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center group-hover:bg-[#F59E0B]/20 transition-all">
                <CheckCircle className="w-6 h-6 text-[#F59E0B]" />
              </div>
            </div>
          </button>
          <button onClick={() => router.push('/uat/payments')}
            className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 text-left hover:border-[#EC4899]/20 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">My Payments</h3>
                <p className="text-sm text-slate-400">Track your earnings and payment status</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#EC4899]/10 flex items-center justify-center group-hover:bg-[#EC4899]/20 transition-all">
                <Wallet className="w-6 h-6 text-[#EC4899]" />
              </div>
            </div>
          </button>
          <button onClick={() => router.push('/uat/profile')}
            className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6 text-left hover:border-[#06B6D4]/20 transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">My Profile</h3>
                <p className="text-sm text-slate-400">View badges, ratings, and your tester stats</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center group-hover:bg-[#06B6D4]/20 transition-all">
                <Award className="w-6 h-6 text-[#06B6D4]" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}