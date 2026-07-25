'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from '@/components/motion';
import {
  LayoutDashboard, FolderKanban, CheckCircle, FileText,
  MessageSquare, TrendingUp, Clock, UserCircle, Target,
  DollarSign, Users, Plus, SquareCheckBig,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StaffShell from '../../../components/staff/StaffShell';



interface StatCard { label: string; value: string | number; icon: React.ElementType; color: string; bg: string; href: string; }

export default function StaffDashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ leads: 0, activeProjects: 0, totalClients: 0, pendingTasks: 0, totalRevenue: 0 });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setTimeout(() => router.replace('/staff/login'), 0); return; }

      const { data: sp } = await supabase.from('staff_profiles').select('id,role,full_name').eq('id', session.user.id).maybeSingle();
      if (!sp) { setTimeout(() => router.replace('/staff/login'), 0); return; }
      setUserName(sp.full_name || session.user.email?.split('@')[0] || 'Staff');

      const [leadsRes, projectsRes, clientsRes, tasksRes, invoicesRes, activityRes] = await Promise.all([
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('clients').select('*', { count: 'exact', head: true }),
        supabase.from('project_tasks').select('*', { count: 'exact', head: true }).in('status', ['todo', 'in_progress']).eq('assigned_to', session.user.id),
        supabase.from('invoices').select('amount, status'),
        supabase.from('project_activity').select('*').order('created_at', { ascending: false }).limit(8),
      ]);

      const totalRevenue = invoicesRes.data?.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount || 0), 0) || 0;

      setStats({
        leads: leadsRes.count || 0,
        activeProjects: projectsRes.count || 0,
        totalClients: clientsRes.count || 0,
        pendingTasks: tasksRes.count || 0,
        totalRevenue,
      });

      const { data: leadsData } = await supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5);
      setRecentLeads(leadsData || []);
      setRecentActivity(activityRes.data || []);
      setLoading(false);
    }
    init();
  }, [router]);

  const statCards: StatCard[] = [
    { label: 'New Leads', value: stats.leads, icon: UserCircle, color: '#06B6D4', bg: 'bg-[#06B6D4]/8', href: '/staff/leads' },
    { label: 'Active Projects', value: stats.activeProjects, icon: FolderKanban, color: '#7C3AED', bg: 'bg-[#7C3AED]/8', href: '/staff/projects' },
    { label: 'Total Clients', value: stats.totalClients, icon: Users, color: '#10B981', bg: 'bg-[#10B981]/8', href: '/staff/clients' },
    { label: 'My Tasks', value: stats.pendingTasks, icon: CheckCircle, color: '#F59E0B', bg: 'bg-[#F59E0B]/8', href: '/staff/tasks' },
  ];

  if (loading) {
    return (
      <StaffShell>
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-[#06B6D4]/30 border-t-[#06B6D4] rounded-full animate-spin" />
        </div>
      </StaffShell>
    );
  }

  return (
    <StaffShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                Welcome back, <span className="text-[#06B6D4]">{userName}</span>
              </h1>
              <p className="text-slate-400 mt-1">Here is what is happening today.</p>
            </div>
            <Link href="/staff/projects/new"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#06B6D4]/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              New Project
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-400 font-medium">{card.label}</span>
                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${card.bg}`}>
                    <Icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-white">{card.value}</p>
                <Link href={card.href} className="inline-block mt-3 text-xs text-[#06B6D4] hover:underline cursor-pointer font-medium">View details</Link>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}
            className="lg:col-span-2 glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Recent Leads</h3>
              <Link href="/staff/leads" className="text-xs text-[#06B6D4] hover:underline cursor-pointer font-medium">View all</Link>
            </div>
            {recentLeads.length > 0 ? (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <Link key={lead.id} href="/staff/leads"
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-[#06B6D4]/10 flex items-center justify-center text-xs font-bold text-[#06B6D4] shrink-0">
                        {lead.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-white truncate">{lead.name}</p>
                        <p className="text-xs text-slate-400 truncate">{lead.company_name || lead.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4 shrink-0">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 font-medium">{lead.status || 'new'}</span>
                      <span className="text-xs text-slate-400">{lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">
                <UserCircle className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No leads yet</p>
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-5">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Convert Lead to Client', icon: UserCircle, href: '/staff/leads', color: '#2563EB' },
                { label: 'Create New Project', icon: FolderKanban, href: '/staff/projects/new', color: '#8B5CF6' },
                { label: 'Add Task', icon: SquareCheckBig, href: '/staff/tasks', color: '#F59E0B' },
                { label: 'Send Client Message', icon: MessageSquare, href: '/staff/messages', color: '#10B981' },
                { label: 'Upload Files', icon: FileText, href: '/staff/files', color: '#EC4899' },
              ].map((action) => (
                <Link key={action.label} href={action.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${action.color}12` }}>
                    <action.icon className="w-4 h-4" style={{ color: action.color }} />
                  </div>
                  <span className="text-sm font-medium text-slate-300">{action.label}</span>
                </Link>
              ))}
            </div>

            <div className="mt-6 p-4 bg-gradient-to-br from-[#06B6D4]/5 to-[#22D3EE]/5 border border-[#06B6D4]/10 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-[#06B6D4]" />
                <span className="font-bold text-sm text-white">Revenue This Month</span>
              </div>
              <p className="text-2xl font-bold text-white">£{stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">From paid invoices</p>
            </div>
          </motion.div>
        </div>
      </div>
    </StaffShell>
  );
}