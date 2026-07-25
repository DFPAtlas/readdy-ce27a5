'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from '@/components/motion';
import {
  Search, RefreshCw, CheckCircle, Clock, AlertCircle,
  Plus, ChevronDown, Loader2, Calendar, X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import StaffShell from '../../../components/staff/StaffShell';



interface Task {
  id: string;
  project_id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  project_name?: string;
}

export default function StaffTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskProject, setNewTaskProject] = useState('');
  const [showNewTask, setShowNewTask] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

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
    const [tasksRes, projectsRes] = await Promise.all([
      supabase.from('project_tasks').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('id, name'),
    ]);

    if (projectsRes.data) setProjects(projectsRes.data);

    if (tasksRes.data) {
      const enriched = tasksRes.data.map(t => ({
        ...t,
        project_name: projectsRes.data?.find(p => String(p.id) === String(t.project_id))?.name || 'Unknown',
      }));
      setTasks(enriched);
      setFilteredTasks(enriched);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    let filtered = tasks;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(q) || (t.description?.toLowerCase().includes(q)));
    }
    if (statusFilter !== 'all') filtered = filtered.filter(t => t.status === statusFilter);
    if (priorityFilter !== 'all') filtered = filtered.filter(t => t.priority === priorityFilter);
    setFilteredTasks(filtered);
  }, [searchQuery, statusFilter, priorityFilter, tasks]);

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from('project_tasks').update({
      status,
      completed_at: status === 'done' ? new Date().toISOString() : null,
    }).eq('id', id);
    if (!error) setTasks(prev => prev.map(t => t.id === id ? { ...t, status, completed_at: status === 'done' ? new Date().toISOString() : null } : t));
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !newTaskProject) return;
    const { error } = await supabase.from('project_tasks').insert({
      project_id: parseInt(newTaskProject),
      title: newTaskTitle.trim(),
      status: 'todo',
      priority: 'medium',
    });
    if (!error) {
      const projectName = projects.find(p => String(p.id) === newTaskProject)?.name || 'Unknown';
      setTasks(prev => [{ id: crypto.randomUUID(), project_id: parseInt(newTaskProject), title: newTaskTitle.trim(), description: null, status: 'todo', priority: 'medium', assigned_to: null, due_date: null, completed_at: null, created_at: new Date().toISOString(), project_name: projectName }, ...prev]);
      setNewTaskTitle('');
      setShowNewTask(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'done': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: CheckCircle, dot: '#10B981' };
      case 'in_progress': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: Clock, dot: '#F59E0B' };
      case 'review': return { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100', icon: AlertCircle, dot: '#8B5CF6' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-100', icon: Clock, dot: '#9CA3AF' };
    }
  };

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'urgent': return 'bg-red-50 text-red-600 border-red-100';
      case 'high': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'medium': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  };

  if (loading) {
    return (
      <StaffShell>
        <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-3 border-[#2563EB]/30 border-t-[#2563EB] rounded-full animate-spin" /></div>
      </StaffShell>
    );
  }

  return (
    <StaffShell>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Tasks</h1>
            <p className="text-sm text-slate-400 mt-0.5">Track and manage all project tasks</p>
          </div>
          <button onClick={() => setShowNewTask(!showNewTask)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#06B6D4]/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'All Tasks', value: stats.total, color: '#64748B' },
            { label: 'To Do', value: stats.todo, color: '#9CA3AF' },
            { label: 'In Progress', value: stats.inProgress, color: '#F59E0B' },
            { label: 'Done', value: stats.done, color: '#10B981' },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-2xl p-4">
              <p className="text-xs text-slate-400 font-medium mb-1">{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {showNewTask && (
          <div className="glass-card rounded-2xl p-5 mb-6 flex flex-col sm:flex-row gap-3">
            <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title..." className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2563EB] transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()} />
            <select value={newTaskProject} onChange={(e) => setNewTaskProject(e.target.value)}
              className="px-4 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white cursor-pointer pr-8">
              <option value="">Select Project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={handleAddTask} disabled={!newTaskTitle.trim() || !newTaskProject}
              className="px-5 py-2.5 bg-[#06B6D4] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#06B6D4]/20 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap">Add</button>
            <button onClick={() => { setShowNewTask(false); setNewTaskTitle(''); }} className="px-5 py-2.5 border border-[rgba(255,255,255,0.1)] rounded-xl text-sm text-slate-400 hover:bg-white/5 transition-all cursor-pointer">Cancel</button>
          </div>
        )}

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 lg:p-5 border-b border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search tasks..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/15 focus:border-[#06B6D4]/30 transition-all" />
            </div>
            <div className="flex gap-2">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 pr-8 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm cursor-pointer appearance-none">
                <option value="all">All Status</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 pr-8 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm cursor-pointer appearance-none">
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <button onClick={() => { setRefreshing(true); fetchData(); }} disabled={refreshing}
                className="px-4 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-slate-400 hover:text-[#06B6D4] transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider w-10"></th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Task</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Project</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Priority</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Due</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => {
                  const statusStyle = getStatusStyle(task.status);
                  return (
                    <tr key={task.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5">
                        <button onClick={() => handleStatusChange(task.id, task.status === 'done' ? 'todo' : 'done')}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${task.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-slate-400'}`}>
                          {task.status === 'done' && <CheckCircle className="w-3 h-3 text-white" />}
                        </button>
                      </td>
                      <td className="py-4 px-5">
                        <p className={`text-sm font-medium ${task.status === 'done' ? 'text-slate-500 line-through' : 'text-white'}`}>{task.title}</p>
                        {task.description && <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>}
                      </td>
                      <td className="py-4 px-5 text-sm text-slate-400">{task.project_name}</td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium border ${getPriorityStyle(task.priority)}`}>{task.priority}</span>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusStyle.dot }} />
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-500">{task.due_date ? new Date(task.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredTasks.length === 0 && (
            <div className="text-center py-16">
              <CheckCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">No tasks found</p>
              <p className="text-sm text-slate-500 mt-1">{searchQuery || statusFilter !== 'all' ? 'Try adjusting filters' : 'Add your first task'}</p>
            </div>
          )}
        </div>
      </div>
    </StaffShell>
  );
}