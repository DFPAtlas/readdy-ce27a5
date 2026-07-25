'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from '@/components/motion';
import {
  Search, Filter, RefreshCw, ChevronDown, ArrowUpRight,
  FolderKanban, Calendar, DollarSign, User, X, Plus,
  Clock, CheckCircle, AlertCircle, Pause,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StaffShell from '../../../components/staff/StaffShell';



interface Project {
  id: string;
  name: string;
  description: string | null;
  client_id: string;
  status: string;
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  progress: number | null;
  project_lead: string | null;
  created_at: string;
  client_name?: string;
  milestone_count?: number;
  task_count?: number;
}

interface Client { id: string; company_name: string | null; contact_name: string | null; }
interface StaffProfile { id: string; full_name: string | null; }

export default function StaffProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setTimeout(() => router.replace('/staff/login'), 0); return; }
      const { data: sp } = await supabase.from('staff_profiles').select('id').eq('id', session.user.id).maybeSingle();
      if (!sp) { setTimeout(() => router.replace('/staff/login'), 0); return; }
      await fetchData();
    }
    init();
  }, [router]);

  const fetchData = async () => {
    const [projectsRes, clientsRes, staffRes, milestonesRes, tasksRes] = await Promise.all([
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, company_name, contact_name'),
      supabase.from('staff_profiles').select('id, full_name'),
      supabase.from('milestones').select('project_id'),
      supabase.from('project_tasks').select('project_id'),
    ]);

    if (clientsRes.data) setClients(clientsRes.data);
    if (staffRes.data) setStaff(staffRes.data);

    if (projectsRes.data) {
      const mCounts: Record<string, number> = {};
      const tCounts: Record<string, number> = {};
      milestonesRes.data?.forEach(m => { mCounts[m.project_id] = (mCounts[m.project_id] || 0) + 1; });
      tasksRes.data?.forEach(t => { tCounts[t.project_id] = (tCounts[t.project_id] || 0) + 1; });

      const enriched = projectsRes.data.map(p => {
        const client = clientsRes.data?.find(c => c.id === p.client_id);
        return {
          ...p,
          client_name: client?.company_name || client?.contact_name || 'Unknown',
          milestone_count: mCounts[p.id] || 0,
          task_count: tCounts[p.id] || 0,
        };
      });
      setProjects(enriched);
      setFilteredProjects(enriched);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    let filtered = projects;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q)) ||
        (p.client_name?.toLowerCase().includes(q))
      );
    }
    if (statusFilter !== 'all') filtered = filtered.filter(p => p.status === statusFilter);
    setFilteredProjects(filtered);
  }, [searchQuery, statusFilter, projects]);

  const getStatusStyle = (status: string): { bg: string; text: string; border: string; icon: React.ElementType; dot: string } => {
    switch (status) {
      case 'planning': return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', icon: Clock, dot: '#9CA3AF' };
      case 'active': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: CheckCircle, dot: '#10B981' };
      case 'on_hold': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: Pause, dot: '#F59E0B' };
      case 'completed': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', icon: CheckCircle, dot: '#2563EB' };
      case 'cancelled': return { bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-100', icon: AlertCircle, dot: '#EF4444' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', icon: Clock, dot: '#9CA3AF' };
    }
  };

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    totalBudget: projects.reduce((s, p) => s + Number(p.budget || 0), 0),
  };

  if (loading) {
    return (
      <StaffShell>
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin" />
        </div>
      </StaffShell>
    );
  }

  return (
    <StaffShell>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Projects</h1>
            <p className="text-sm text-slate-400 mt-0.5">Track timelines, budgets, and deliverables</p>
          </div>
          <Link href="/staff/projects/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2563EB] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#2563EB]/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Projects', value: stats.total, color: '#94A3B8' },
            { label: 'Active', value: stats.active, color: '#10B981' },
            { label: 'Completed', value: stats.completed, color: '#06B6D4' },
            { label: 'Total Budget', value: `£${stats.totalBudget.toLocaleString()}`, color: '#7C3AED' },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-4">
              <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 lg:p-5 border-b border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects by name, client, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/15 focus:border-[#06B6D4]/30 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 pr-8 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/15 cursor-pointer appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
              <button onClick={() => { setRefreshing(true); fetchData(); }} disabled={refreshing}
                className="px-4 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-slate-400 hover:text-[#06B6D4] hover:border-[#06B6D4]/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Project</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Client</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Budget</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Timeline</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tasks</th>
                  <th className="text-right py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => {
                  const statusStyle = getStatusStyle(project.status);
                  const leadStaff = staff.find(s => s.id === project.project_lead);
                  return (
                    <tr key={project.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C3AED]/10 to-[#EC4899]/10 flex items-center justify-center text-xs font-bold text-[#7C3AED]">
                            <FolderKanban className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{project.name}</p>
                            <p className="text-xs text-slate-400">{project.milestone_count || 0} milestones · {project.task_count || 0} tasks</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <User className="w-3.5 h-3.5" />
                          {project.client_name}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusStyle.dot }} />
                          {project.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-sm font-medium text-slate-300">£{(project.budget || 0).toLocaleString()}</td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          {project.start_date ? new Date(project.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'} → {project.end_date ? new Date(project.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="w-24">
                          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#06B6D4] to-[#06B6D4]" style={{ width: `${project.progress || 0}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <Link href={`/staff/projects/${project.id}`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 hover:text-[#06B6D4] transition-colors cursor-pointer ml-auto"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-16">
              <FolderKanban className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 font-medium mb-1">No projects found</p>
              <p className="text-sm text-slate-500">{searchQuery || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first project'}</p>
            </div>
          )}
        </div>
      </div>
    </StaffShell>
  );
}