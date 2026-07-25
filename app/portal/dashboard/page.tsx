'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from '@/components/motion';
import {
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  FolderKanban,
  MessageSquare,
  ReceiptText,
  Sparkles,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import PortalShell from '../PortalShell';

interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  budget: number;
  end_date: string | null;
  start_date?: string | null;
  project_lead?: string | null;
  progress?: number | null;
  created_at?: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  due_date: string | null;
  created_at?: string;
}

interface Message {
  id: string;
  sender_name: string;
  content: string;
  read: boolean;
  created_at: string;
}

type ActivityItem = {
  id: string;
  title: string;
  meta: string;
  date: string | undefined;
  icon: typeof MessageSquare;
  color: string;
};

const phases = ['Discovery', 'Planning', 'Design', 'Development', 'Testing', 'Launch'];

function formatDate(value: string | null | undefined, includeYear = true) {
  if (!value) return null;
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    ...(includeYear ? { year: 'numeric' } : {}),
  });
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function safeProgress(project: Project | undefined) {
  if (!project) return 0;
  const value = Number(project.progress ?? 0);
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || cancelled) return;

      const name =
        session.user.user_metadata?.full_name ||
        session.user.email?.split('@')[0] ||
        'Client';

      setUserName(name);

      const { data: projectScope } = await supabase
        .from('projects')
        .select('id');

      const projectIds = projectScope?.map(project => project.id) ?? [];
      const messagesQuery = projectIds.length
        ? supabase
            .from('project_messages')
            .select('*')
            .in('project_id', projectIds)
            .order('created_at', { ascending: false })
            .limit(10)
        : Promise.resolve({ data: [] });

      const [projectsRes, invoicesRes, messagesRes] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('invoices').select('*').order('created_at', { ascending: false }),
        messagesQuery,
      ]);

      if (cancelled) return;
      setProjects((projectsRes.data ?? []) as Project[]);
      setInvoices((invoicesRes.data ?? []) as Invoice[]);
      setMessages((messagesRes.data ?? []) as Message[]);
      setLoading(false);
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeProjects = projects.filter(project => project.status === 'active');
  const completedProjects = projects.filter(project => project.status === 'completed');
  const outstandingInvoices = invoices.filter(
    invoice => invoice.status === 'pending' || invoice.status === 'overdue',
  );
  const unreadMessages = messages.filter(message => !message.read);
  const outstandingTotal = outstandingInvoices.reduce(
    (total, invoice) => total + Number(invoice.amount || 0),
    0,
  );

  const featuredProject =
    activeProjects[0] ||
    projects.find(project => project.status === 'planning') ||
    projects.find(project => project.status !== 'completed') ||
    projects[0];

  const progress = safeProgress(featuredProject);
  const phaseIndex = Math.min(phases.length - 1, Math.floor(progress / 20));
  const currentPhase = phases[phaseIndex];

  const summaryCards = [
    {
      label: 'Active Projects',
      value: activeProjects.length,
      href: '/portal/projects',
      link: 'View all projects',
      icon: FolderKanban,
      color: '#22D3EE',
    },
    {
      label: 'Completed Projects',
      value: completedProjects.length,
      href: '/portal/projects',
      link: 'View all projects',
      icon: CheckCircle2,
      color: '#4ADE80',
    },
    {
      label: 'Outstanding',
      value: `£${outstandingTotal.toLocaleString('en-GB')}`,
      href: '/portal/invoices',
      link: 'View invoices',
      icon: ReceiptText,
      color: '#F59E0B',
    },
    {
      label: 'Unread Messages',
      value: unreadMessages.length,
      href: '/portal/messages',
      link: 'View messages',
      icon: MessageSquare,
      color: '#A78BFA',
    },
  ];

  const actions = useMemo(() => {
    const result: Array<{
      id: string;
      title: string;
      detail: string;
      value?: string;
      href: string;
      icon: typeof MessageSquare;
      color: string;
    }> = [];

    if (outstandingInvoices[0]) {
      const invoice = outstandingInvoices[0];
      result.push({
        id: `invoice-${invoice.id}`,
        title: invoice.status === 'overdue' ? 'Invoice overdue' : 'Invoice outstanding',
        detail: `Invoice #${invoice.invoice_number}`,
        value: `£${Number(invoice.amount || 0).toLocaleString('en-GB')}`,
        href: '/portal/invoices',
        icon: ReceiptText,
        color: '#F59E0B',
      });
    }

    if (unreadMessages.length) {
      result.push({
        id: 'unread-messages',
        title: `${unreadMessages.length} unread ${unreadMessages.length === 1 ? 'message' : 'messages'}`,
        detail: `Latest from ${unreadMessages[0].sender_name}`,
        value: `${unreadMessages.length} new`,
        href: '/portal/messages',
        icon: MessageSquare,
        color: '#22D3EE',
      });
    }

    if (featuredProject && progress < 100) {
      result.push({
        id: `project-${featuredProject.id}`,
        title: 'Project in progress',
        detail: `${featuredProject.name} · ${currentPhase}`,
        value: `${progress}%`,
        href: `/portal/projects/${featuredProject.id}`,
        icon: FolderKanban,
        color: '#A78BFA',
      });
    }

    return result.slice(0, 3);
  }, [currentPhase, featuredProject, outstandingInvoices, progress, unreadMessages]);

  const activity = useMemo<ActivityItem[]>(() => {
    const messageActivity: ActivityItem[] = messages.slice(0, 4).map(message => ({
      id: `message-${message.id}`,
      title: message.read ? 'Project message received' : 'New project message',
      meta: message.sender_name,
      date: message.created_at,
      icon: MessageSquare,
      color: '#22D3EE',
    }));

    const invoiceActivity: ActivityItem[] = invoices.slice(0, 3).map(invoice => ({
      id: `invoice-${invoice.id}`,
      title: `Invoice #${invoice.invoice_number} ${invoice.status}`,
      meta: 'Digital Footprint',
      date: invoice.created_at ?? invoice.due_date ?? undefined,
      icon: ReceiptText,
      color: invoice.status === 'paid' ? '#4ADE80' : '#F59E0B',
    }));

    const projectActivity: ActivityItem[] = projects.slice(0, 3).map(project => ({
      id: `project-${project.id}`,
      title: `${project.name} · ${project.status.replaceAll('_', ' ')}`,
      meta: project.project_lead || 'Digital Footprint team',
      date: project.created_at,
      icon: FolderKanban,
      color: '#A78BFA',
    }));

    return [...messageActivity, ...invoiceActivity, ...projectActivity]
      .sort((a, b) => {
        const aTime = a.date ? new Date(a.date).getTime() : 0;
        const bTime = b.date ? new Date(b.date).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 4);
  }, [invoices, messages, projects]);

  if (loading) {
    return (
      <PortalShell>
        <div className="flex min-h-[55vh] items-center justify-center">
          <div className="h-11 w-11 animate-spin rounded-full border-2 border-[#06B6D4]/25 border-t-[#22D3EE]" />
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell>
      <div className="mx-auto max-w-[1460px] space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="pb-1"
        >
          <h1 className="text-3xl font-bold tracking-tight text-white lg:text-[34px]">
            {greeting()}, {userName}
          </h1>
          <p className="mt-1 text-sm text-slate-400 sm:text-base">
            Here&apos;s what&apos;s happening across your Digital Footprint projects.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border border-white/[0.09] bg-[#111F32] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.13)]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${card.color}14` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: card.color }} />
                  </div>
                  <p className="text-sm font-medium text-slate-300">{card.label}</p>
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight text-white">{card.value}</p>
                <Link
                  href={card.href}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#22D3EE] transition-colors hover:text-[#67E8F9]"
                >
                  {card.link}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.75fr)_minmax(340px,0.95fr)]">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#111F32]"
          >
            <div className="flex items-center gap-2 border-b border-white/[0.07] px-5 py-4">
              <span className="h-2.5 w-2.5 rounded-full bg-[#22D3EE]" />
              <h2 className="font-semibold text-white">Active Project</h2>
            </div>

            {featuredProject ? (
              <div className="grid gap-5 p-5 md:grid-cols-[230px_minmax(0,1fr)]">
                <div className="flex min-h-52 flex-col justify-between overflow-hidden rounded-xl border border-white/[0.13] bg-[radial-gradient(circle_at_80%_18%,rgba(34,211,238,0.22),transparent_30%),linear-gradient(145deg,#0B1727,#101F33)] p-5">
                  <div>
                    <div className="mb-8 flex items-center gap-2 text-[10px] font-semibold tracking-[0.17em] text-[#67E8F9]">
                      <Sparkles className="h-4 w-4" />
                      DIGITAL FOOTPRINT
                    </div>
                    <p className="text-xl font-bold leading-tight text-white">{featuredProject.name}</p>
                    {featuredProject.description && (
                      <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">
                        {featuredProject.description}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Project workspace
                  </span>
                </div>

                <div className="flex min-w-0 flex-col">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{featuredProject.name}</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        Current phase: <span className="font-semibold text-[#22D3EE]">{currentPhase}</span>
                      </p>
                    </div>
                    <span className="rounded-full border border-[#4ADE80]/20 bg-[#4ADE80]/10 px-3 py-1 text-xs font-semibold capitalize text-[#86EFAC]">
                      {featuredProject.status.replaceAll('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-7 overflow-x-auto pb-2">
                    <div className="flex min-w-[530px] items-start">
                      {phases.map((phase, index) => {
                        const complete = index < phaseIndex;
                        const current = index === phaseIndex;
                        return (
                          <div key={phase} className="flex flex-1 items-start last:flex-none">
                            <div className="flex w-14 shrink-0 flex-col items-center">
                              <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-bold ${
                                complete
                                  ? 'border-[#4ADE80] bg-[#4ADE80] text-[#071221]'
                                  : current
                                    ? 'border-[#22D3EE] bg-[#22D3EE] text-[#071221] shadow-[0_0_22px_rgba(34,211,238,0.28)]'
                                    : 'border-slate-500 bg-[#0D1929] text-slate-400'
                              }`}>
                                {complete ? <Check className="h-4 w-4" /> : index + 1}
                              </div>
                              <span className={`mt-2 text-[10px] ${current ? 'font-semibold text-[#67E8F9]' : 'text-slate-500'}`}>
                                {phase}
                              </span>
                            </div>
                            {index < phases.length - 1 && (
                              <div className={`mt-3.5 h-px flex-1 ${index < phaseIndex ? 'bg-[#4ADE80]' : 'bg-slate-700'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-slate-500">Next milestone</p>
                      <div className="mt-1.5 flex items-start gap-2">
                        <CalendarDays className="mt-0.5 h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-sm font-semibold text-slate-200">
                            {phaseIndex < phases.length - 1 ? `${phases[phaseIndex + 1]} review` : 'Launch review'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(featuredProject.end_date) || 'Date to be confirmed'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500">Project lead</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5">
                          <UserRound className="h-4 w-4 text-slate-300" />
                        </div>
                        <p className="text-sm font-semibold text-slate-200">
                          {featuredProject.project_lead || 'Digital Footprint team'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-6">
                    <div className="min-w-44 flex-1">
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Overall progress</span>
                        <span className="font-semibold text-slate-300">{progress}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#06B6D4] to-[#67E8F9]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <Link
                      href={`/portal/projects/${featuredProject.id}`}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#22D3EE] px-5 text-sm font-bold text-[#071221] transition-colors hover:bg-[#67E8F9]"
                    >
                      View project
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#06B6D4]/10">
                  <FolderKanban className="h-7 w-7 text-[#22D3EE]" />
                </div>
                <h3 className="text-lg font-semibold text-white">Your project workspace is ready</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                  Your first project will appear here as soon as the Digital Footprint team completes setup.
                </p>
              </div>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-white/[0.09] bg-[#111F32] p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-white">Action needed</h2>
              {actions.length > 0 && (
                <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#7C3AED]/20 px-2 text-xs font-bold text-[#C4B5FD]">
                  {actions.length}
                </span>
              )}
            </div>

            {actions.length ? (
              <div className="space-y-2.5">
                {actions.map(action => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.id}
                      href={action.href}
                      className="group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0D1929]/65 p-3.5 transition-colors hover:border-white/[0.14] hover:bg-[#132238]"
                    >
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${action.color}14` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: action.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-200">{action.title}</p>
                        <p className="truncate text-xs text-slate-500">{action.detail}</p>
                      </div>
                      {action.value && (
                        <span className="text-xs font-semibold" style={{ color: action.color }}>
                          {action.value}
                        </span>
                      )}
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-300" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-white/[0.07] bg-[#0D1929]/45 p-6 text-center">
                <CheckCircle2 className="mb-3 h-9 w-9 text-[#4ADE80]" />
                <p className="text-sm font-semibold text-white">You&apos;re all caught up</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  We&apos;ll let you know when something needs your attention.
                </p>
              </div>
            )}
          </motion.section>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-white/[0.09] bg-[#111F32] p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#22D3EE]" />
                <h2 className="font-semibold text-white">Recent Activity</h2>
              </div>
              <Link href="/portal/projects" className="text-xs font-semibold text-[#22D3EE] hover:text-[#67E8F9]">
                View projects
              </Link>
            </div>

            {activity.length ? (
              <div className="divide-y divide-white/[0.07] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0D1929]/55">
                {activity.map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex items-center gap-3 px-3.5 py-3">
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${item.color}14` }}
                      >
                        <Icon className="h-3.5 w-3.5" style={{ color: item.color }} />
                      </div>
                      <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-200">{item.title}</p>
                      <span className="hidden max-w-36 truncate text-xs text-slate-500 sm:block">{item.meta}</span>
                      <span className="shrink-0 text-[11px] text-slate-600">{formatDate(item.date, false) || 'Recent'}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-white/[0.07] bg-[#0D1929]/45 text-center">
                <Clock3 className="mb-2 h-7 w-7 text-slate-600" />
                <p className="text-sm font-medium text-slate-300">No recent activity</p>
                <p className="mt-1 text-xs text-slate-500">Project updates will appear here.</p>
              </div>
            )}
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-white/[0.09] bg-[#111F32] p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#A78BFA]" />
                <h2 className="font-semibold text-white">Messages</h2>
              </div>
              <Link href="/portal/messages" className="inline-flex items-center gap-1 text-xs font-semibold text-[#22D3EE] hover:text-[#67E8F9]">
                View all messages
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {messages.length ? (
              <div className="space-y-2.5">
                {messages.slice(0, 3).map(message => (
                  <Link
                    key={message.id}
                    href="/portal/messages"
                    className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-[#0D1929]/55 p-3.5 transition-colors hover:bg-[#132238]"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7C3AED]/15 text-xs font-bold text-[#C4B5FD]">
                      {message.sender_name?.[0]?.toUpperCase() || 'D'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-200">{message.sender_name}</p>
                        {!message.read && <span className="h-2 w-2 shrink-0 rounded-full bg-[#A78BFA]" />}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{message.content}</p>
                    </div>
                    <span className="shrink-0 text-[11px] text-slate-600">
                      {formatDate(message.created_at, false)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-white/[0.07] bg-[#0D1929]/45 p-5 text-center">
                <MessageSquare className="mb-2 h-8 w-8 text-slate-600" />
                <p className="text-sm font-semibold text-white">No new messages</p>
                <p className="mt-1 text-xs text-slate-500">
                  You&apos;re all caught up. We&apos;ll notify you when there&apos;s an update.
                </p>
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </PortalShell>
  );
}
