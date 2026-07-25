'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from '@/components/motion';
import {
  FolderKanban,
  CheckCircle,
  FileText,
  MessageSquare,
  TrendingUp,
  Clock,
  FolderOpen,
} from 'lucide-react';
import Link from 'next/link';
import PortalShell from '../PortalShell';



interface Project {
  id: string;
  name: string;
  status: string;
  budget: number;
  end_date: string | null;
  progress?: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
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
  project_id: number;
  created_at: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentFiles, setRecentFiles] = useState<ProjectFile[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Client';
      setUserName(name);

      const { data: projectsData } = await supabase.from('projects').select('id');
      const projectIds = projectsData ? projectsData.map(p => p.id) : [];
      const messagesQuery = projectIds.length > 0
        ? supabase.from('project_messages').select('*').in('project_id', projectIds).order('created_at', { ascending: false }).limit(5)
        : Promise.resolve({ data: [] });

      const filesQuery = projectIds.length > 0
        ? supabase.from('project_files').select('*').in('project_id', projectIds).order('created_at', { ascending: false }).limit(4)
        : Promise.resolve({ data: [] });

      const [projectsRes, invoicesRes, messagesRes, filesRes] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('invoices').select('*').order('created_at', { ascending: false }),
        messagesQuery,
        filesQuery,
      ]);

      if (projectsRes.data) setProjects(projectsRes.data);
      if (invoicesRes.data) setInvoices(invoicesRes.data);
      if (messagesRes.data) setMessages(messagesRes.data);
      if (filesRes.data) setRecentFiles(filesRes.data);
      setLoading(false);
    }

    fetchData();
  }, []);

  const activeProjects = projects.filter(p => p.status === 'active');
  const completedProjects = projects.filter(p => p.status === 'completed');
  const outstandingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'overdue');
  const outstandingTotal = outstandingInvoices.reduce((sum, i) => sum + Number(i.amount), 0);
  const unreadMessages = messages.filter(m => !m.read).length;

  const recentMessages = messages.slice(0, 3);
  const upcomingProjects = projects.filter(p => p.status === 'active').slice(0, 3);

  const cardData = [
    { label: 'Active Projects', value: activeProjects.length, icon: FolderKanban, color: '#06B6D4', href: '/portal/projects' },
    { label: 'Completed Projects', value: completedProjects.length, icon: CheckCircle, color: '#10B981', href: '/portal/projects' },
    { label: 'Outstanding', value: `£${outstandingTotal.toLocaleString()}`, icon: FileText, color: '#F59E0B', href: '/portal/invoices' },
    { label: 'Unread Messages', value: unreadMessages, icon: MessageSquare, color: '#7C3AED', href: '/portal/messages' },
  ];

  if (loading) {
    return (
      <PortalShell>
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-3 border-[#06B6D4]/30 border-t-[#06B6D4] rounded-full animate-spin" />
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell>
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Welcome back, <span className="text-[#06B6D4]">{userName}</span>
          </h1>
          <p className="text-slate-400 mt-1">Here&apos;s your project overview</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cardData.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-400 font-medium">{card.label}</span>
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ backgroundColor: `${card.color}15` }}>
                    <Icon className="w-5 h-5" style={{ color: card.color }} />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-white">{card.value}</p>
                <Link href={card.href} className="inline-block mt-3 text-xs text-[#06B6D4] hover:underline cursor-pointer font-medium">
                  View details
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Recent Messages</h3>
              <MessageSquare className="w-5 h-5 text-slate-400" />
            </div>
            {recentMessages.length > 0 ? (
              <div className="space-y-3">
                {recentMessages.map((msg) => (
                  <Link key={msg.id} href="/portal/messages"
                    className={`block p-4 rounded-xl transition-colors cursor-pointer ${!msg.read ? 'bg-[#06B6D4]/5 border border-[#06B6D4]/10' : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {!msg.read && <span className="w-2 h-2 bg-[#06B6D4] rounded-full flex-shrink-0" />}
                      <p className="font-medium text-sm text-white">{msg.sender_name}</p>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">{msg.content}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(msg.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No messages yet</p>
              </div>
            )}
            <Link href="/portal/messages" className="inline-flex items-center gap-1 mt-4 text-sm text-[#06B6D4] hover:underline cursor-pointer font-medium">View all messages</Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Active Projects</h3>
              <TrendingUp className="w-5 h-5 text-slate-400" />
            </div>
            {upcomingProjects.length > 0 ? (
              <div className="space-y-3">
                {upcomingProjects.map((project) => {
                  const prog = project.progress || 0;
                  return (
                    <Link key={project.id} href={`/portal/projects/${project.id}`}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 bg-[#06B6D4]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FolderKanban className="w-4 h-4 text-[#06B6D4]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-white truncate">{project.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[#10B981]/10 text-[#10B981] font-medium">{project.status}</span>
                            {project.end_date && <span className="text-xs text-slate-400">Due {new Date(project.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${prog === 100 ? 'bg-[#10B981]' : 'bg-[#06B6D4]'}`} style={{ width: `${prog}%` }} />
                            </div>
                            <span className="text-xs text-slate-400">{prog}%</span>
                          </div>
                        </div>
                      </div>
                      {project.budget > 0 && <span className="text-sm font-semibold text-slate-300 whitespace-nowrap ml-4">£{Number(project.budget).toLocaleString()}</span>}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">
                <FolderKanban className="w-8 h-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No active projects</p>
              </div>
            )}
            <Link href="/portal/projects" className="inline-flex items-center gap-1 mt-4 text-sm text-[#06B6D4] hover:underline cursor-pointer font-medium">View all projects</Link>
          </motion.div>
        </div>

        {recentFiles.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="bg-[#1E293B] border border-[rgba(255,255,255,0.06)] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white">Recent Files</h3>
              <FolderOpen className="w-5 h-5 text-slate-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {recentFiles.map((file) => (
                <Link key={file.id} href="/portal/files"
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 bg-[#06B6D4]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-[#06B6D4]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                    <p className="text-xs text-slate-400">{formatBytes(file.file_size)} · {new Date(file.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/portal/files" className="inline-flex items-center gap-1 mt-4 text-sm text-[#06B6D4] hover:underline cursor-pointer font-medium">View all files</Link>
          </motion.div>
        )}
      </div>
    </PortalShell>
  );
}