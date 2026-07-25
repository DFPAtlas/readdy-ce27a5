'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Award, Calendar, Mail, Shield, Star } from 'lucide-react';



interface TesterProfile {
  id: string;
  full_name: string;
  email: string;
  status: string;
  experience_level: string;
  created_at: string;
}

interface Badge {
  id: string;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  badge_type: string;
}

interface Rating {
  id: string;
  overall_score: number;
  created_at: string;
  job_title?: string | null;
}

export default function TesterProfilePage() {
  const router = useRouter();
  const [tester, setTester] = useState<TesterProfile | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const [stats, setStats] = useState({ testsCompleted: 0, totalBugs: 0, avgRating: 0 });

  useEffect(() => {
    const testerId = sessionStorage.getItem('uatTesterId');
    if (!testerId) {
      router.push('/uat-testing');
      return;
    }
    loadData(testerId);
  }, [router]);

  const loadData = async (testerId: string) => {
    const { data: testerData } = await supabase.from('uat_testers').select('*').eq('id', testerId).maybeSingle();

    if (!testerData) {
      sessionStorage.removeItem('uatTesterId');
      router.push('/uat-testing');
      return;
    }

    const profile = testerData as TesterProfile;
    setTester(profile);

    if (profile.status !== 'approved') {
      setBlocked(true);
      setLoading(false);
      return;
    }

    const [{ data: badgeRows }, { data: ratingRows }, { count: completedCount }, { count: feedbackCount }] = await Promise.all([
      supabase.from('uat_tester_badges').select('*, uat_badges!inner(name, description, icon, badge_type)').eq('tester_id', testerId),
      supabase.from('uat_tester_ratings').select('*').eq('tester_id', testerId).order('created_at', { ascending: false }),
      supabase.from('uat_assignments').select('*', { count: 'exact', head: true }).eq('tester_id', testerId).eq('status', 'completed'),
      supabase.from('uat_feedback').select('*', { count: 'exact', head: true }).eq('tester_id', testerId),
    ]);

    const badgeList: Badge[] = (badgeRows || []).map((badge: any) => ({
      id: badge.id,
      badge_name: badge.uat_badges?.name || 'Unknown',
      badge_description: badge.uat_badges?.description || '',
      badge_icon: badge.uat_badges?.icon || 'ri-medal-line',
      badge_type: badge.uat_badges?.badge_type || '',
    }));

    const ratingList: Rating[] = (ratingRows || []).map((rating: any) => ({
      id: rating.id,
      overall_score: rating.overall_score || 0,
      created_at: rating.created_at,
      job_title: null,
    }));

    const avgRating = ratingList.length > 0
      ? ratingList.reduce((sum, rating) => sum + rating.overall_score, 0) / ratingList.length
      : 0;

    setBadges(badgeList);
    setRatings(ratingList);
    setStats({
      testsCompleted: completedCount ?? 0,
      totalBugs: feedbackCount ?? 0,
      avgRating: Math.round(avgRating * 10) / 10,
    });
    setLoading(false);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0F172A] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#06B6D4]/30 border-t-[#06B6D4] rounded-full animate-spin" /></div>;
  }

  if (blocked) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-8">
        <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-3xl p-12 text-center max-w-md">
          <Shield className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Account Not Approved</h3>
          <p className="text-slate-400">Your tester account must be approved before accessing your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button onClick={() => router.push('/uat/dashboard')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#06B6D4] transition-colors mb-6 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#06B6D4] to-[#22D3EE] flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {tester?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{tester?.full_name}</h1>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1.5 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {tester?.email}</span>
                <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> {tester?.experience_level}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Joined {tester?.created_at ? new Date(tester.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : '-'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Tests Done" value={stats.testsCompleted} />
          <StatCard label="Bugs Found" value={stats.totalBugs} />
          <StatCard label="Avg Rating" value={stats.avgRating || '-'} />
        </div>

        {badges.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide flex items-center gap-2"><Award className="w-4 h-4" /> Badges Earned</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {badges.map((badge) => <div key={badge.id} className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 text-center"><p className="text-sm font-medium text-white">{badge.badge_name}</p><p className="text-[10px] text-slate-500 mt-0.5">{badge.badge_description}</p></div>)}
            </div>
          </section>
        )}

        {ratings.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide flex items-center gap-2"><Star className="w-4 h-4" /> Recent Ratings</h2>
            <div className="space-y-3">
              {ratings.map((rating) => <div key={rating.id} className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 flex items-center justify-between"><span className="text-xs text-slate-500">{new Date(rating.created_at).toLocaleDateString('en-GB')}</span><span className="text-lg font-bold text-white">{rating.overall_score}</span></div>)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-4 text-center"><p className="text-2xl font-bold text-white">{value}</p><p className="text-xs text-slate-400 mt-1">{label}</p></div>;
}
