'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from '@/components/motion';
import {
  ArrowLeft, FolderKanban, Target, MessageSquare, FileText,
  DollarSign, Map, Calendar, Send, Loader2, CheckCircle, Clock,
  Eye, Download, ChevronRight, Building2, User, Mail, Phone, Globe,
} from 'lucide-react';
import Link from 'next/link';
import PortalShell from '../../PortalShell';



function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  budget: number | null;
  progress: number | null;
  start_date: string | null;
  end_date: string | null;
  project_lead: string | null;
}

interface ClientData {
  company_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
}

interface MilestoneData {
  id: string;
  name: string;
  description: string | null;
  amount: number | null;
  status: string;
  due_date: string | null;
}

interface MessageData {
  id: string;
  sender_name: string;
  content: string;
  created_at: string;
}

interface FileData {
  id: string;
  name: string;
  file_size: number;
  file_type: string;
  category: string;
  created_at: string;
}

interface InvoiceData {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string | null;
}

interface RoadmapData {
  id: string;
  title: string;
  category: string;
  priority: string;
  status: string;
}

interface StaffProfile {
  full_name: string | null;
}

export default function ProjectDetail({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<ProjectData | null>(null);
  const [client, setClient] = useState<ClientData | null>(null);
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapData[]>([]);
  const [leadName, setLeadName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [userName, setUserName] = useState('');

  const tabs = [
    { key: 'overview', label: 'Overview', icon: FolderKanban },
    { key: 'milestones', label: 'Milestones', icon: Target, count: milestones.length },
    { key: 'messages', label: 'Messages', icon: MessageSquare },
    { key: 'files', label: 'Files', icon: FileText, count: files.length },
    { key: 'invoices', label: 'Invoices', icon: DollarSign, count: invoices.length },
    { key: 'roadmap', label: 'Roadmap', icon: Map, count: roadmapItems.length },
  ];

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Client');

      const projectIdNum = parseInt(projectId);

      const { data: projectData } = await supabase.from('projects').select('*').eq('id', projectIdNum).maybeSingle();
      if (!projectData) { setLoading(false); return; }
      setProject(projectData);

      const [
        milestonesRes, messagesRes, filesRes, invoicesRes, roadmapRes,
      ] = await Promise.all([
        supabase.from('milestones').select('*').eq('project_id', projectIdNum).order('created_at', { ascending: true }),
        supabase.from('project_messages').select('*').eq('project_id', projectIdNum).order('created_at', { ascending: false }),
        supabase.from('project_files').select('*').eq('project_id', projectIdNum).order('created_at', { ascending: false }),
        supabase.from('invoices').select('*').eq('project_id', projectIdNum).order('created_at', { ascending: false }),
        supabase.from('technology_roadmap').select('*').eq('project_id', projectIdNum),
      ]);

      if (milestonesRes.data) setMilestones(milestonesRes.data);
      if (messagesRes.data) setMessages(messagesRes.data);
      if (filesRes.data) setFiles(filesRes.data);
      if (invoicesRes.data) setInvoices(invoicesRes.data);
      if (roadmapRes.data) setRoadmapItems(roadmapRes.data);

      const { data: clientData } = await supabase.from('clients').select('*').eq('id', projectData.client_id).maybeSingle();
      if (clientData) setClient(clientData);

      if (projectData.project_lead) {
        const { data: leadData } = await supabase.from('staff_profiles').select('full_name').eq('id', projectData.project_lead).maybeSingle();
        if (leadData?.full_name) setLeadName(leadData.full_name);
      }

      setLoading(false);
    }
    init();
  }, [projectId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !project) return;
    setSending(true);

    const { error } = await supabase.from('project_messages').insert({
      project_id: parseInt(project.id),
      sender_name: userName,
      content: newMessage.trim(),
      read: false,
    });

    if (!error) {
      setMessages(prev => [{
        id: crypto.randomUUID(),
        sender_name: userName,
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
      }, ...prev]);
      setNewMessage('');
    }
    setSending(false);
  };

  if (loading) {
    return (
      <PortalShell>
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-[#06B6D4]/30 border-t-[#06B6D4] rounded-full animate-spin" />
        </div>
      </PortalShell>
    );
  }

  if (!project) {
    return (
      <PortalShell>
        <div className="text-center py-20">
          <FolderKanban className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Project not found</p>
          <Link href="/portal/projects" className="text-[#06B6D4] text-sm hover:underline mt-2 inline-block">Back to Projects</Link>
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link href="/portal/projects" className="flex items-center gap-2 text-sm text-slate-400 hover:text-[#06B6D4] transition-colors cursor-pointer mb-3">
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <p className="text-sm text-slate-400 mt-0.5">{client?.company_name || 'Your Project'}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${
              project.status === 'active' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20'
              : project.status === 'completed' ? 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20'
              : project.status === 'on_hold' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
              : 'bg-white/5 text-slate-400 border-[rgba(255,255,255,0.08)]'
            }`}>
              {project.status?.charAt(0).toUpperCase() + project.status?.slice(1).replace('_', ' ') || 'Unknown'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Progress', value: `${project.progress || 0}%`, icon: Target, color: '#8B5CF6' },
            { label: 'Budget', value: `£${(project.budget || 0).toLocaleString()}`, icon: DollarSign, color: '#10B981' },
            { label: 'Start Date', value: project.start_date ? new Date(project.start_date).toLocaleDateString('en-GB') : '—', icon: Calendar, color: '#06B6D4' },
            { label: 'Project Lead', value: leadName || 'Assigned', icon: User, color: '#F59E0B' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-white/5 border border-[rgba(255,255,255,0.06)] rounded-2xl p-1.5 mb-6 overflow-x-auto">
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
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-400'}`}>{tab.count}</span>
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
                  <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Project Overview</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{project.description || 'No description provided.'}</p>
                  </div>

                  <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Progress</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${project.progress || 0}%` }} transition={{ duration: 0.8 }}
                          className="h-full rounded-full bg-gradient-to-r from-[#06B6D4] to-[#10B981]"
                        />
                      </div>
                      <span className="text-lg font-bold text-white">{project.progress || 0}%</span>
                    </div>
                  </div>

                  {client && (
                    <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Company Details</h3>
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
                              <item.icon className="w-3.5 h-3.5 text-slate-500" />
                              <p className="text-sm font-medium text-slate-300">{item.value || '—'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Timeline</h3>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/10 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-[#06B6D4]" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Start Date</p>
                          <p className="text-sm font-medium text-white">{project.start_date ? new Date(project.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set'}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-[#10B981]" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Target Completion</p>
                          <p className="text-sm font-medium text-white">{project.end_date ? new Date(project.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Recent Milestones</h3>
                    {milestones.length > 0 ? (
                      <div className="space-y-3">
                        {milestones.slice(0, 5).map(m => (
                          <div key={m.id} className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full shrink-0 ${m.status === 'completed' ? 'bg-[#10B981]' : m.status === 'in_progress' ? 'bg-[#F59E0B]' : 'bg-white/20'}`} />
                            <div className="min-w-0">
                              <p className="text-sm text-slate-300 truncate">{m.name}</p>
                              <p className="text-xs text-slate-500">{m.status?.replace('_', ' ') || 'pending'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">No milestones yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'milestones' && (
              <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
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

            {activeTab === 'messages' && (
              <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
                <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4">
                  {messages.length > 0 ? [...messages].reverse().map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_name === userName ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${msg.sender_name === userName ? 'bg-[#06B6D4] text-white rounded-br-md' : 'bg-white/5 text-slate-200 rounded-bl-md'}`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-[10px] mt-1 opacity-60">{msg.sender_name} · {new Date(msg.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 text-slate-400">
                      <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No messages yet</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#06B6D4] transition-all"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button onClick={handleSendMessage} disabled={!newMessage.trim() || sending}
                    className="px-5 py-2.5 bg-[#06B6D4] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#06B6D4]/20 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap flex items-center gap-2">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'files' && (
              <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
                {files.length > 0 ? (
                  <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                    {files.map(f => (
                      <div key={f.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#06B6D4]/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[#06B6D4]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{f.name}</p>
                            <p className="text-xs text-slate-400">{formatBytes(f.file_size)} · {f.category} · {new Date(f.created_at).toLocaleDateString('en-GB')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 hover:text-[#06B6D4] transition-colors cursor-pointer">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-slate-400 hover:text-[#06B6D4] transition-colors cursor-pointer">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No files yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'invoices' && (
              <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
                {invoices.length > 0 ? (
                  <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                    {invoices.map(inv => (
                      <div key={inv.id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-[#F59E0B]" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{inv.invoice_number}</p>
                            <p className="text-xs text-slate-400">Due {inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-GB') : 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-slate-300">£{Number(inv.amount).toLocaleString()}</span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                            inv.status === 'paid' ? 'bg-[#10B981]/10 text-[#10B981]'
                            : inv.status === 'overdue' ? 'bg-[#EF4444]/10 text-[#EF4444]'
                            : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                          }`}>{inv.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <DollarSign className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No invoices yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'roadmap' && (
              <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
                {roadmapItems.length > 0 ? (
                  <div className="divide-y divide-[rgba(255,255,255,0.04)]">
                    {roadmapItems.map(item => (
                      <div key={item.id} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
                            <Map className="w-5 h-5 text-[#8B5CF6]" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{item.title}</p>
                            <p className="text-xs text-slate-400 capitalize">{item.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium border ${
                            item.priority === 'urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : item.priority === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-white/5 text-slate-400 border-[rgba(255,255,255,0.08)]'
                          }`}>{item.priority}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white/5 text-slate-400 border border-[rgba(255,255,255,0.08)] capitalize">{item.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Map className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No roadmap items</p>
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </PortalShell>
  );
}