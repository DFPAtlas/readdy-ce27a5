'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from '@/components/motion';
import {
  ArrowLeft, FolderKanban, User, Calendar, DollarSign,
  Target, MessageSquare, FileText, Activity, Map,
  Plus, Edit2, Loader2, CheckCircle, Clock,
  Send, Download, Eye, Building2, Mail, Phone, Globe,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StaffShell from '../../../../components/staff/StaffShell';



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
}

interface Client {
  id: string;
  company_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
}

interface Milestone {
  id: string;
  name: string;
  description: string | null;
  amount: number | null;
  status: string;
  due_date: string | null;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  due_date: string | null;
}

interface Message {
  id: string;
  sender_name: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface ProjectFile {
  id: string;
  name: string;
  file_size: number;
  file_type: string;
  category: string;
  created_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string | null;
}

interface RoadmapItem {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
}

interface Activity {
  id: string;
  description: string;
  activity_type: string | null;
  created_at: string;
}

interface StaffProfile {
  id: string;
  full_name: string | null;
  role: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function ProjectDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [staff, setStaff] = useState<StaffProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newMessage, setNewMessage] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showNewTask, setShowNewTask] = useState(false);
  const [sending, setSending] = useState(false);

  const tabs = [
    { key: 'overview', label: 'Overview', icon: FolderKanban },
    { key: 'milestones', label: 'Milestones', icon: Target, count: milestones.length },
    { key: 'tasks', label: 'Tasks', icon: CheckCircle, count: tasks.filter(t => t.status !== 'done').length },
    { key: 'messages', label: 'Messages', icon: MessageSquare, count: messages.filter(m => !m.read).length },
    { key: 'files', label: 'Files', icon: FileText, count: files.length },
    { key: 'invoices', label: 'Invoices', icon: DollarSign, count: invoices.length },
    { key: 'roadmap', label: 'Roadmap', icon: Map, count: roadmapItems.length },
    { key: 'activity', label: 'Activity', icon: Activity },
  ];

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setTimeout(() => router.replace('/staff/login'), 0); return; }
      const { data: sp } = await supabase.from('staff_profiles').select('id').eq('id', session.user.id).maybeSingle();
      if (!sp) { setTimeout(() => router.replace('/staff/login'), 0); return; }

      const projectId = parseInt(params.id);

      const [projectRes, milestonesRes, tasksRes, messagesRes, filesRes, invoicesRes, roadmapRes, activityRes, staffRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).maybeSingle(),
        supabase.from('milestones').select('*').eq('project_id', projectId).order('created_at', { ascending: true }),
        supabase.from('project_tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('project_messages').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(20),
        supabase.from('project_files').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('invoices').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('technology_roadmap').select('*').eq('project_id', projectId),
        supabase.from('project_activity').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('staff_profiles').select('id, full_name, role'),
      ]);

      if (projectRes.data) {
        setProject(projectRes.data);
        const { data: clientData } = await supabase.from('clients').select('*').eq('id', projectRes.data.client_id).maybeSingle();
        if (clientData) setClient(clientData);
      }

      if (milestonesRes.data) setMilestones(milestonesRes.data);
      if (tasksRes.data) setTasks(tasksRes.data);
      if (messagesRes.data) setMessages(messagesRes.data);
      if (filesRes.data) setFiles(filesRes.data);
      if (invoicesRes.data) setInvoices(invoicesRes.data);
      if (roadmapRes.data) setRoadmapItems(roadmapRes.data);
      if (activityRes.data) setActivity(activityRes.data);
      if (staffRes.data) setStaff(staffRes.data);
      setLoading(false);
    }
    init();
  }, [params.id, router]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !project) return;
    setSending(true);
    const { data: { session } } = await supabase.auth.getSession();
    const senderName = session?.user?.user_metadata?.full_name || 'Staff';

    const { error } = await supabase.from('project_messages').insert({
      project_id: parseInt(project.id),
      sender_name: senderName,
      content: newMessage.trim(),
      read: false,
    });

    if (!error) {
      setMessages(prev => [{
        id: crypto.randomUUID(),
        sender_name: senderName,
        content: newMessage.trim(),
        read: false,
        created_at: new Date().toISOString(),
      }, ...prev]);
      setNewMessage('');
      await supabase.from('project_activity').insert({
        project_id: parseInt(project.id),
        description: `Message sent by ${senderName}`,
        activity_type: 'message_sent',
      });
    }
    setSending(false);
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !project) return;
    const { error } = await supabase.from('project_tasks').insert({
      project_id: parseInt(project.id),
      title: newTaskTitle.trim(),
      status: 'todo',
      priority: 'medium',
    });
    if (!error) {
      setTasks(prev => [{ id: crypto.randomUUID(), title: newTaskTitle.trim(), description: null, status: 'todo', priority: 'medium', assigned_to: null, due_date: null }, ...prev]);
      setNewTaskTitle('');
      setShowNewTask(false);
    }
  };

  const handleTaskStatus = async (taskId: string, newStatus: string) => {
    const { error } = await supabase.from('project_tasks').update({ status: newStatus, completed_at: newStatus === 'done' ? new Date().toISOString() : null }).eq('id', taskId);
    if (!error) setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!project) return;
    const { error } = await supabase.from('projects').update({ status: newStatus }).eq('id', parseInt(project.id));
    if (!error) setProject({ ...project, status: newStatus });
  };

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'urgent': return 'bg-red-50 text-red-600 border-red-100';
      case 'high': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'medium': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'low': return 'bg-gray-50 text-gray-500 border-gray-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
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

  if (!project) {
    return (
      <StaffShell>
        <div className="text-center py-20">
          <FolderKanban className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Project not found</p>
          <Link href="/staff/projects" className="text-[#2563EB] text-sm hover:underline mt-2 inline-block">Back to Projects</Link>
        </div>
      </StaffShell>
    );
  }

  const leadStaff = staff.find(s => s.id === project.project_lead);

  return (
    <StaffShell>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/staff/projects" className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#2563EB] transition-colors cursor-pointer mb-3">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <p className="text-sm text-slate-400 mt-0.5">{client?.company_name || client?.contact_name || 'No client'}</p>
            </div>
            <div className="flex items-center gap-2">
              <select value={project.status} onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white cursor-pointer pr-8"
              >
                {['planning', 'active', 'on_hold', 'completed', 'cancelled'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Budget', value: `£${(project.budget || 0).toLocaleString()}`, icon: DollarSign, color: '#10B981' },
            { label: 'Progress', value: `${project.progress || 0}%`, icon: Target, color: '#8B5CF6' },
            { label: 'Start Date', value: project.start_date ? new Date(project.start_date).toLocaleDateString('en-GB') : '—', icon: Calendar, color: '#2563EB' },
            { label: 'Project Lead', value: leadStaff?.full_name || 'Unassigned', icon: User, color: '#F59E0B' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-2xl p-1.5 mb-6 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${isActive ? 'bg-[#06B6D4] text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>

            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Project Description</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{project.description || 'No description provided.'}</p>
                  </div>
                  {client && (
                    <div className="glass-card rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Client Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'Company', value: client.company_name, icon: Building2 },
                          { label: 'Contact', value: client.contact_name, icon: User },
                          { label: 'Email', value: client.email, icon: Mail },
                          { label: 'Phone', value: client.phone, icon: Phone },
                          { label: 'Website', value: client.website, icon: Globe },
                        ].map(item => (
                          <div key={item.label}>
                            <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                            <div className="flex items-center gap-1.5">
                              <item.icon className="w-3.5 h-3.5 text-slate-400" />
                              <p className="text-sm font-medium text-slate-300">{item.value || '—'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-6">
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Activity Timeline</h3>
                    {activity.length > 0 ? (
                      <div className="space-y-4">
                        {activity.slice(0, 8).map((a, i) => (
                          <div key={a.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-2 h-2 rounded-full bg-[#06B6D4] shrink-0" />
                              {i < activity.slice(0, 8).length - 1 && <div className="w-px flex-1 bg-white/10 mt-1" />}
                            </div>
                            <div className="pb-4">
                              <p className="text-sm text-slate-300">{a.description}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-8">No activity yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'milestones' && (
              <div className="glass-card rounded-2xl overflow-hidden">
                {milestones.length > 0 ? (
                  <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                    {milestones.map(m => (
                      <div key={m.id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.status === 'completed' ? 'bg-[#10B981]/10' : m.status === 'in_progress' ? 'bg-[#F59E0B]/10' : 'bg-white/5'}`}>
                            {m.status === 'completed' ? <CheckCircle className="w-5 h-5 text-[#10B981]" /> : m.status === 'in_progress' ? <Clock className="w-5 h-5 text-[#F59E0B]" /> : <Target className="w-5 h-5 text-slate-400" />}
                          </div>
                          <div>
                            <p className="font-medium text-white">{m.name}</p>
                            <p className="text-xs text-slate-400">{m.description || ''} {m.due_date ? `· Due ${new Date(m.due_date).toLocaleDateString('en-GB')}` : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {m.amount ? <span className="text-sm font-semibold text-slate-300">£{Number(m.amount).toLocaleString()}</span> : null}
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                            m.status === 'completed' ? 'bg-[#10B981]/10 text-[#10B981]' : m.status === 'in_progress' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-white/5 text-slate-400'
                          }`}>{m.status?.replace('_', ' ') || 'pending'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Target className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No milestones yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Tasks ({tasks.length})</h3>
                  <button onClick={() => setShowNewTask(!showNewTask)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#06B6D4]/20 transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" /> Add Task
                  </button>
                </div>
                {showNewTask && (
                  <div className="glass-card rounded-2xl p-4 flex gap-3">
                    <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Task title..." className="flex-1 px-4 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#06B6D4] transition-all"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTask()} />
                    <button onClick={handleAddTask} disabled={!newTaskTitle.trim()}
                      className="px-4 py-2.5 bg-[#06B6D4] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#06B6D4]/20 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap">Add</button>
                    <button onClick={() => { setShowNewTask(false); setNewTaskTitle(''); }}
                      className="px-4 py-2.5 border border-[rgba(255,255,255,0.1)] rounded-xl text-sm text-slate-400 hover:bg-white/5 transition-all cursor-pointer">Cancel</button>
                  </div>
                )}
                <div className="glass-card rounded-2xl overflow-hidden">
                  {tasks.length > 0 ? (
                    <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                      {tasks.map(t => (
                        <div key={t.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                          <button onClick={() => handleTaskStatus(t.id, t.status === 'done' ? 'todo' : 'done')}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all ${t.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 hover:border-slate-400'}`}>
                            {t.status === 'done' && <CheckCircle className="w-3 h-3 text-white" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${t.status === 'done' ? 'text-slate-500 line-through' : 'text-white'}`}>{t.title}</p>
                            {t.description && <p className="text-xs text-slate-400 mt-0.5 truncate">{t.description}</p>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium border ${getPriorityStyle(t.priority)}`}>{t.priority}</span>
                            {t.due_date && <span className="text-xs text-slate-400">{new Date(t.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16"><CheckCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" /><p className="text-slate-400 font-medium">No tasks yet</p></div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="glass-card rounded-2xl p-6">
                    <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4">
                      {messages.length > 0 ? messages.map(msg => (
                        <div key={msg.id} className={`flex ${staff.some(s => s.full_name === msg.sender_name) ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${staff.some(s => s.full_name === msg.sender_name) ? 'bg-[#06B6D4] text-white rounded-br-md' : 'bg-white/5 text-slate-200 rounded-bl-md'}`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className="text-[10px] mt-1 opacity-60">{msg.sender_name} · {new Date(msg.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-10 text-slate-400"><MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" /><p className="text-sm">No messages yet</p></div>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..." className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2563EB] transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                      <button onClick={handleSendMessage} disabled={!newMessage.trim() || sending}
                        className="px-5 py-2.5 bg-[#06B6D4] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#06B6D4]/20 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap flex items-center gap-2">
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'files' && (
              <div className="glass-card rounded-2xl overflow-hidden">
                {files.length > 0 ? (
                  <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                    {files.map(f => (
                      <div key={f.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center"><FileText className="w-5 h-5 text-[#2563EB]" /></div>
                          <div><p className="text-sm font-medium text-slate-900">{f.name}</p><p className="text-xs text-slate-400">{formatBytes(f.file_size)} · {f.category} · {new Date(f.created_at).toLocaleDateString('en-GB')}</p></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#2563EB] transition-colors cursor-pointer"><Eye className="w-4 h-4" /></button>
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#2563EB] transition-colors cursor-pointer"><Download className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16"><FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" /><p className="text-slate-400 font-medium">No files yet</p></div>
                )}
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="glass-card rounded-2xl overflow-hidden">
                {invoices.length > 0 ? (
                  <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                    {invoices.map(inv => (
                      <div key={inv.id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center"><DollarSign className="w-5 h-5 text-[#F59E0B]" /></div>
                          <div><p className="font-medium text-white">{inv.invoice_number}</p><p className="text-xs text-slate-400">Due {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-GB') : 'N/A'}</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-slate-300">£{Number(inv.amount).toLocaleString()}</span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${inv.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : inv.status === 'overdue' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'}`}>{inv.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16"><DollarSign className="w-12 h-12 text-slate-200 mx-auto mb-4" /><p className="text-slate-400 font-medium">No invoices yet</p></div>
                )}
              </div>
            )}

            {activeTab === 'roadmap' && (
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                {roadmapItems.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {roadmapItems.map(item => (
                      <div key={item.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center"><Map className="w-5 h-5 text-[#8B5CF6]" /></div>
                          <div><p className="font-medium text-slate-900">{item.title}</p><p className="text-xs text-slate-400 capitalize">{item.category}</p></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium border ${getPriorityStyle(item.priority)}`}>{item.priority}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-50 text-slate-500 border border-slate-100 capitalize">{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16"><Map className="w-12 h-12 text-slate-200 mx-auto mb-4" /><p className="text-slate-400 font-medium">No roadmap items</p></div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
                {activity.length > 0 ? (
                  <div className="space-y-0">
                    {activity.map(a => (
                      <div key={a.id} className="flex gap-4 py-3 border-b border-slate-50 last:border-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          a.activity_type === 'project_created' ? 'bg-[#2563EB]/10' : a.activity_type === 'message_sent' ? 'bg-[#10B981]/10' : 'bg-slate-100'
                        }`}>
                          {a.activity_type === 'project_created' ? <Plus className="w-4 h-4 text-[#2563EB]" /> :
                           a.activity_type === 'message_sent' ? <MessageSquare className="w-4 h-4 text-[#10B981]" /> :
                           <Activity className="w-4 h-4 text-slate-400" />}
                        </div>
                        <div><p className="text-sm text-slate-600">{a.description}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16"><Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" /><p className="text-slate-400 font-medium">No activity recorded</p></div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </StaffShell>
  );
}