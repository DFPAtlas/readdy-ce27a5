'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CirclePoundSterling,
  Clock3,
  FileText,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Play,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UsersRound,
  Workflow,
} from 'lucide-react';

type ViewKey = 'overview' | 'projects' | 'team' | 'tasks' | 'finance';
type ProjectFilter = 'all' | 'on-track' | 'attention';
type TaskFilter = 'all' | 'priority' | 'completed';
type ProjectStatus = 'On track' | 'Needs attention' | 'Waiting on client';
type CapacityStatus = 'Available' | 'Balanced' | 'Over capacity';
type IconType = typeof LayoutDashboard;

type Project = {
  id: string;
  name: string;
  client: string;
  owner: string;
  progress: number;
  status: ProjectStatus;
  due: string;
  nextAction: string;
  budget: string;
};

type TeamMember = {
  name: string;
  role: string;
  initials: string;
  capacity: number;
  projects: number;
  status: CapacityStatus;
};

type DemoTask = {
  id: string;
  title: string;
  project: string;
  owner: string;
  due: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
};

type NavItem = {
  key: ViewKey;
  label: string;
  heading: string;
  description: string;
  icon: IconType;
};

type Metric = {
  label: string;
  value: string;
  note: string;
  icon: IconType;
  target: ViewKey;
  warning?: boolean;
};

const projects: Project[] = [
  { id: 'portal', name: 'Customer portal', client: 'Aster & Co.', owner: 'Amelia Hart', progress: 78, status: 'On track', due: '14 Aug 2026', nextAction: 'Approve dashboard prototype', budget: '£18,400' },
  { id: 'automation', name: 'Sales automation', client: 'Horizon Fitness', owner: 'Chris Morgan', progress: 64, status: 'Needs attention', due: '21 Aug 2026', nextAction: 'Confirm CRM data mapping', budget: '£12,750' },
  { id: 'launch', name: 'Website launch', client: 'Northline Group', owner: 'Sophie Reed', progress: 91, status: 'On track', due: '2 Aug 2026', nextAction: 'Complete launch checklist', budget: '£9,600' },
  { id: 'booking', name: 'Booking platform', client: 'Oak & Stone', owner: 'Daniel Price', progress: 46, status: 'Waiting on client', due: '4 Sep 2026', nextAction: 'Receive service catalogue', budget: '£22,100' },
];

const team: TeamMember[] = [
  { name: 'Amelia Hart', role: 'Head of UX', initials: 'AH', capacity: 72, projects: 3, status: 'Balanced' },
  { name: 'Chris Morgan', role: 'Head of UI', initials: 'CM', capacity: 94, projects: 5, status: 'Over capacity' },
  { name: 'Sophie Reed', role: 'Project Lead', initials: 'SR', capacity: 61, projects: 3, status: 'Available' },
  { name: 'Daniel Price', role: 'Automation Engineer', initials: 'DP', capacity: 79, projects: 4, status: 'Balanced' },
];

const initialTasks: DemoTask[] = [
  { id: 'proposal', title: 'Approve client proposal', project: 'Customer portal', owner: 'Martin', due: 'Today', priority: 'High', completed: false },
  { id: 'mapping', title: 'Review CRM data mapping', project: 'Sales automation', owner: 'Chris', due: 'Today', priority: 'High', completed: false },
  { id: 'launch', title: 'Confirm launch checklist', project: 'Website launch', owner: 'Sophie', due: 'Tomorrow', priority: 'Medium', completed: false },
  { id: 'invoice', title: 'Send milestone invoice', project: 'Booking platform', owner: 'Finance', due: '30 Jul', priority: 'Medium', completed: false },
  { id: 'wireframes', title: 'Archive approved wireframes', project: 'Customer portal', owner: 'Amelia', due: '26 Jul', priority: 'Low', completed: true },
];

const navItems: NavItem[] = [
  { key: 'overview', label: 'Overview', heading: 'Monday operations snapshot', description: 'A single view of delivery health, revenue, workload and the actions that need attention.', icon: LayoutDashboard },
  { key: 'projects', label: 'Projects', heading: 'Project delivery', description: 'Open a project to review progress, budget, ownership, risks and the next operational action.', icon: Workflow },
  { key: 'team', label: 'Team workload', heading: 'Team capacity', description: 'See who has capacity, who is balanced and where work should be reassigned before it becomes a problem.', icon: UsersRound },
  { key: 'tasks', label: 'Tasks', heading: 'Priority task board', description: 'Filter the work queue and complete simulated actions to see the operational picture update.', icon: ListChecks },
  { key: 'finance', label: 'Finance', heading: 'Finance and cash flow', description: 'Review revenue, outstanding invoices, committed delivery value and the next payment milestones.', icon: CirclePoundSterling },
];

const tourSteps: Array<{ view: ViewKey; title: string; instruction: string }> = [
  { view: 'overview', title: 'Review the business pulse', instruction: 'Inspect the headline figures and identify the area needing attention.' },
  { view: 'projects', title: 'Open the at-risk project', instruction: 'Select Sales automation to review its risk and next action.' },
  { view: 'team', title: 'Check workload pressure', instruction: 'Review Chris Morgan and simulate moving one task away from him.' },
  { view: 'tasks', title: 'Complete a priority action', instruction: 'Mark one high-priority task as complete.' },
  { view: 'finance', title: 'Inspect the cash position', instruction: 'Open the outstanding invoice summary and review the next milestone.' },
];

const metrics: Metric[] = [
  { label: 'Revenue this month', value: '£84,200', note: '+12.4% vs June', icon: CirclePoundSterling, target: 'finance' },
  { label: 'Active projects', value: '18', note: '14 on track', icon: Workflow, target: 'projects' },
  { label: 'Team capacity', value: '76%', note: '1 person overloaded', icon: Gauge, target: 'team', warning: true },
  { label: 'Priority tasks', value: '7', note: '2 due today', icon: ListChecks, target: 'tasks', warning: true },
];

function StatusPill({ status }: { status: ProjectStatus | CapacityStatus }) {
  const classes =
    status === 'On track' || status === 'Available'
      ? 'bg-emerald-300/10 text-emerald-200'
      : status === 'Needs attention' || status === 'Over capacity'
        ? 'bg-orange-300/10 text-orange-200'
        : 'bg-cyan-300/10 text-cyan-200';

  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.11em] ${classes}`}>{status}</span>;
}

function OverviewView({ onActivity, onNavigate }: { onActivity: (message: string) => void; onNavigate: (view: ViewKey) => void }) {
  const attentionItems: Array<{ title: string; detail: string; target: ViewKey }> = [
    { title: 'Sales automation', detail: 'CRM mapping is blocking the next sprint', target: 'projects' },
    { title: 'Chris Morgan', detail: 'Workload has reached 94%', target: 'team' },
    { title: 'Two priority tasks', detail: 'Both actions are due today', target: 'tasks' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, note, icon: Icon, target, warning }) => (
          <button key={label} type="button" onClick={() => { onActivity(`Opened ${label.toLowerCase()} from the overview.`); onNavigate(target); }} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-left transition hover:border-cyan-300/25 hover:bg-white/[0.055]">
            <div className="flex items-center justify-between"><span className="text-xs text-slate-500">{label}</span><Icon className="h-4 w-4 text-cyan-200" /></div>
            <p className="mt-4 text-2xl font-semibold text-white">{value}</p>
            <p className={`mt-1 text-xs ${warning ? 'text-orange-200' : 'text-emerald-200'}`}>{note}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="mb-5 flex items-center justify-between"><div><h3 className="font-semibold text-white">Live project health</h3><p className="mt-1 text-xs text-slate-500">Open a project to continue into delivery detail.</p></div><Workflow className="h-5 w-5 text-cyan-200" /></div>
          <div className="space-y-3">
            {projects.slice(0, 3).map((project) => (
              <button key={project.id} type="button" onClick={() => { onActivity(`Reviewed ${project.name} project health.`); onNavigate('projects'); }} className="w-full rounded-xl border border-white/[0.07] bg-slate-950/30 p-3 text-left transition hover:border-cyan-300/20">
                <div className="flex items-center justify-between gap-3 text-xs"><div><span className="font-medium text-slate-300">{project.name}</span><span className="ml-2 text-slate-600">{project.client}</span></div><StatusPill status={project.status} /></div>
                <div className="mt-3 h-1.5 rounded-full bg-slate-800"><div className="h-1.5 rounded-full bg-cyan-300" style={{ width: `${project.progress}%` }} /></div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center justify-between"><h3 className="font-semibold text-white">Attention required</h3><AlertTriangle className="h-5 w-5 text-orange-200" /></div>
          <div className="mt-4 space-y-3">
            {attentionItems.map((item) => (
              <button key={item.title} type="button" onClick={() => { onActivity(`Opened attention item: ${item.title}.`); onNavigate(item.target); }} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.07] bg-slate-950/30 p-3 text-left transition hover:border-orange-300/20">
                <span className="h-2 w-2 shrink-0 rounded-full bg-orange-300" />
                <span className="flex-1"><span className="block text-xs font-medium text-slate-300">{item.title}</span><span className="mt-1 block text-[10px] text-slate-600">{item.detail}</span></span>
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectsView({ onActivity }: { onActivity: (message: string) => void }) {
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const [selectedId, setSelectedId] = useState('automation');
  const filters: Array<{ key: ProjectFilter; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'on-track', label: 'On track' },
    { key: 'attention', label: 'Attention' },
  ];
  const filtered = projects.filter((project) => filter === 'all' || (filter === 'on-track' ? project.status === 'On track' : project.status !== 'On track'));
  const selected = projects.find((project) => project.id === selectedId) ?? projects[0];

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold text-white">Active delivery</h3><p className="mt-1 text-xs text-slate-500">Select a project to inspect its operational detail.</p></div><div className="flex gap-1.5">{filters.map((item) => <button key={item.key} type="button" onClick={() => setFilter(item.key)} className={`rounded-full px-3 py-1.5 text-[10px] font-semibold transition ${filter === item.key ? 'bg-cyan-300 text-slate-950' : 'bg-white/[0.05] text-slate-400 hover:text-white'}`}>{item.label}</button>)}</div></div>
        <div className="mt-5 space-y-3">
          {filtered.map((project) => (
            <button key={project.id} type="button" onClick={() => { setSelectedId(project.id); onActivity(`Opened ${project.name} for ${project.client}.`); }} className={`w-full rounded-xl border p-4 text-left transition ${selectedId === project.id ? 'border-cyan-300/30 bg-cyan-300/[0.07]' : 'border-white/[0.07] bg-slate-950/30 hover:border-cyan-300/15'}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-white">{project.name}</p><p className="mt-1 text-xs text-slate-500">{project.client} · {project.owner}</p></div><StatusPill status={project.status} /></div>
              <div className="mt-4 flex items-center gap-3"><div className="h-1.5 flex-1 rounded-full bg-slate-800"><div className="h-1.5 rounded-full bg-cyan-300" style={{ width: `${project.progress}%` }} /></div><span className="text-xs font-medium text-slate-400">{project.progress}%</span></div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-200">Project detail</p><h3 className="mt-2 text-xl font-semibold text-white">{selected.name}</h3><p className="mt-1 text-xs text-slate-500">{selected.client}</p></div><StatusPill status={selected.status} /></div>
        <dl className="mt-6 space-y-4 text-xs">
          {[{ label: 'Project owner', value: selected.owner }, { label: 'Delivery due', value: selected.due }, { label: 'Project budget', value: selected.budget }, { label: 'Completion', value: `${selected.progress}%` }].map((item) => <div key={item.label} className="flex items-center justify-between border-b border-white/[0.07] pb-3 last:border-0"><dt className="text-slate-500">{item.label}</dt><dd className="font-medium text-slate-300">{item.value}</dd></div>)}
        </dl>
        <div className={`mt-5 rounded-xl border p-4 ${selected.status === 'Needs attention' ? 'border-orange-300/20 bg-orange-300/[0.06]' : 'border-cyan-300/20 bg-cyan-300/[0.06]'}`}><p className="text-xs font-medium text-white">Next action</p><p className="mt-2 text-xs leading-5 text-slate-400">{selected.nextAction}</p></div>
        <button type="button" onClick={() => onActivity(`Marked ${selected.nextAction.toLowerCase()} as reviewed.`)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"><CheckCircle2 className="h-4 w-4" />Review next action</button>
      </div>
    </div>
  );
}

function TeamView({ onActivity }: { onActivity: (message: string) => void }) {
  const [relieved, setRelieved] = useState(false);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-center justify-between"><div><h3 className="font-semibold text-white">Workload by team member</h3><p className="mt-1 text-xs text-slate-500">Capacity reflects this week's simulated assigned work.</p></div><UsersRound className="h-5 w-5 text-cyan-200" /></div>
        <div className="mt-5 space-y-3">
          {team.map((member) => {
            const isChris = member.name === 'Chris Morgan';
            const capacity = isChris && relieved ? 82 : member.capacity;
            const status: CapacityStatus = isChris && relieved ? 'Balanced' : member.status;
            const projectCount = member.projects - (isChris && relieved ? 1 : 0);
            return (
              <button key={member.name} type="button" onClick={() => onActivity(`Reviewed ${member.name}'s workload.`)} className="w-full rounded-xl border border-white/[0.07] bg-slate-950/30 p-4 text-left transition hover:border-cyan-300/20">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300/10 text-xs font-semibold text-cyan-200">{member.initials}</div><div><p className="text-sm font-medium text-white">{member.name}</p><p className="mt-1 text-xs text-slate-500">{member.role} · {projectCount} projects</p></div></div><StatusPill status={status} /></div>
                <div className="mt-4 flex items-center gap-3"><div className="h-1.5 flex-1 rounded-full bg-slate-800"><div className={`h-1.5 rounded-full ${capacity > 90 ? 'bg-orange-300' : capacity > 75 ? 'bg-cyan-300' : 'bg-emerald-300'}`} style={{ width: `${capacity}%` }} /></div><span className="text-xs font-medium text-slate-400">{capacity}%</span></div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className={`rounded-2xl border p-5 ${relieved ? 'border-emerald-300/20 bg-emerald-300/[0.06]' : 'border-orange-300/20 bg-orange-300/[0.06]'}`}>
          <div className="flex items-center gap-3">{relieved ? <CheckCircle2 className="h-5 w-5 text-emerald-200" /> : <AlertTriangle className="h-5 w-5 text-orange-200" />}<div><h3 className="font-semibold text-white">{relieved ? 'Workload balanced' : 'Capacity warning'}</h3><p className="mt-1 text-xs text-slate-400">{relieved ? 'Chris is now below the risk threshold.' : 'Chris has reached 94% capacity across five projects.'}</p></div></div>
          <button type="button" disabled={relieved} onClick={() => { setRelieved(true); onActivity('Reassigned one task from Chris to Sophie.'); }} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-default disabled:bg-emerald-300">{relieved ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}{relieved ? 'Task reassigned' : 'Reassign one task'}</button>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><h3 className="font-semibold text-white">Capacity summary</h3><dl className="mt-4 space-y-3 text-xs"><div className="flex items-center justify-between"><dt className="text-slate-500">Available capacity</dt><dd className="font-medium text-emerald-200">{relieved ? '24%' : '18%'}</dd></div><div className="flex items-center justify-between"><dt className="text-slate-500">Balanced team members</dt><dd className="font-medium text-slate-300">{relieved ? '3' : '2'}</dd></div><div className="flex items-center justify-between"><dt className="text-slate-500">Workload warnings</dt><dd className={relieved ? 'font-medium text-emerald-200' : 'font-medium text-orange-200'}>{relieved ? '0' : '1'}</dd></div></dl></div>
      </div>
    </div>
  );
}

function TasksView({ onActivity }: { onActivity: (message: string) => void }) {
  const [tasks, setTasks] = useState<DemoTask[]>(initialTasks);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const filters: Array<{ key: TaskFilter; label: string }> = [
    { key: 'all', label: 'All tasks' },
    { key: 'priority', label: 'High priority' },
    { key: 'completed', label: 'Completed' },
  ];
  const visible = tasks.filter((task) => filter === 'all' || (filter === 'priority' ? task.priority === 'High' && !task.completed : task.completed));
  const completedCount = tasks.filter((task) => task.completed).length;

  const toggleTask = (id: string) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) return;
    setTasks((current) => current.map((item) => item.id === id ? { ...item, completed: !item.completed } : item));
    onActivity(`${task.completed ? 'Reopened' : 'Completed'} task: ${task.title}.`);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold text-white">Operational task queue</h3><p className="mt-1 text-xs text-slate-500">{completedCount} of {tasks.length} simulated tasks completed.</p></div><div className="flex gap-1.5">{filters.map((item) => <button key={item.key} type="button" onClick={() => setFilter(item.key)} className={`rounded-full px-3 py-1.5 text-[10px] font-semibold transition ${filter === item.key ? 'bg-cyan-300 text-slate-950' : 'bg-white/[0.05] text-slate-400 hover:text-white'}`}>{item.label}</button>)}</div></div>
      <div className="mt-5 space-y-3">
        {visible.map((task) => (
          <div key={task.id} className={`flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center ${task.completed ? 'border-emerald-300/15 bg-emerald-300/[0.04]' : 'border-white/[0.07] bg-slate-950/30'}`}>
            <button type="button" onClick={() => toggleTask(task.id)} className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition ${task.completed ? 'border-emerald-300/30 bg-emerald-300 text-slate-950' : 'border-white/15 bg-white/[0.03] text-transparent hover:border-cyan-300/40'}`} aria-label={task.completed ? `Reopen ${task.title}` : `Complete ${task.title}`}><Check className="h-4 w-4" /></button>
            <div className="flex-1"><p className={`text-sm font-medium ${task.completed ? 'text-slate-500 line-through' : 'text-white'}`}>{task.title}</p><p className="mt-1 text-xs text-slate-600">{task.project} · {task.owner}</p></div>
            <div className="flex items-center gap-3 text-xs"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${task.priority === 'High' ? 'bg-orange-300/10 text-orange-200' : task.priority === 'Medium' ? 'bg-cyan-300/10 text-cyan-200' : 'bg-white/[0.05] text-slate-400'}`}>{task.priority}</span><span className="inline-flex items-center gap-1 text-slate-500"><Clock3 className="h-3.5 w-3.5" />{task.due}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinanceView({ onActivity }: { onActivity: (message: string) => void }) {
  const [invoiceOpened, setInvoiceOpened] = useState(false);
  const financeCards: Array<{ label: string; value: string; note: string; icon: IconType; opensInvoice?: boolean }> = [
    { label: 'Revenue this month', value: '£84,200', note: '+12.4%', icon: TrendingUp },
    { label: 'Outstanding invoices', value: '£21,650', note: '4 invoices', icon: FileText, opensInvoice: true },
    { label: 'Committed project value', value: '£146,900', note: 'Next 90 days', icon: BriefcaseBusiness },
  ];
  const cashBars: Array<{ month: string; income: number; cost: number }> = [
    { month: 'Mar', income: 52, cost: 38 }, { month: 'Apr', income: 67, cost: 46 }, { month: 'May', income: 61, cost: 43 }, { month: 'Jun', income: 74, cost: 51 }, { month: 'Jul', income: 86, cost: 58 },
  ];
  const milestones = [
    { date: '2 Aug', label: 'Website launch payment', amount: '£2,400' },
    { date: '14 Aug', label: 'Portal milestone invoice', amount: '£6,800' },
    { date: '21 Aug', label: 'Automation discovery', amount: '£3,200' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {financeCards.map(({ label, value, note, icon: Icon, opensInvoice }) => (
          <button key={label} type="button" onClick={() => { if (opensInvoice) setInvoiceOpened(true); onActivity(`Inspected ${label.toLowerCase()}.`); }} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-left transition hover:border-cyan-300/25">
            <div className="flex items-center justify-between"><span className="text-xs text-slate-500">{label}</span><Icon className="h-4 w-4 text-cyan-200" /></div><p className="mt-4 text-2xl font-semibold text-white">{value}</p><p className="mt-1 text-xs text-emerald-200">{note}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center justify-between"><div><h3 className="font-semibold text-white">Monthly cash movement</h3><p className="mt-1 text-xs text-slate-500">Simulated income against delivery costs.</p></div><TrendingUp className="h-5 w-5 text-cyan-200" /></div>
          <div className="mt-6 flex h-48 items-end gap-3">{cashBars.map((bar) => <button key={bar.month} type="button" onClick={() => onActivity(`Reviewed ${bar.month} cash movement.`)} className="flex flex-1 flex-col items-center gap-2"><div className="flex h-36 w-full items-end justify-center gap-1 rounded-lg bg-slate-950/30 px-2 pb-2"><span className="w-2 rounded-t bg-cyan-300" style={{ height: `${bar.income}%` }} /><span className="w-2 rounded-t bg-slate-600" style={{ height: `${bar.cost}%` }} /></div><span className="text-[10px] text-slate-600">{bar.month}</span></button>)}</div>
          <div className="mt-3 flex items-center gap-4 text-[10px] text-slate-500"><span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-cyan-300" />Income</span><span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-600" />Delivery costs</span></div>
        </div>

        <div className="space-y-4">
          <button type="button" onClick={() => { setInvoiceOpened(true); onActivity('Opened outstanding invoice summary.'); }} className={`w-full rounded-2xl border p-5 text-left transition ${invoiceOpened ? 'border-cyan-300/25 bg-cyan-300/[0.07]' : 'border-white/10 bg-white/[0.035] hover:border-cyan-300/20'}`}><div className="flex items-center justify-between"><div><p className="text-xs text-slate-500">Outstanding invoice</p><p className="mt-2 text-xl font-semibold text-white">£6,800</p><p className="mt-1 text-xs text-slate-500">Aster & Co. · Due 14 Aug 2026</p></div><CirclePoundSterling className="h-6 w-6 text-cyan-200" /></div>{invoiceOpened && <div className="mt-4 rounded-xl border border-cyan-300/15 bg-slate-950/30 p-3 text-xs text-slate-400">Milestone 3: approved UX and client portal build commencement.</div>}</button>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><h3 className="font-semibold text-white">Upcoming milestones</h3><div className="mt-4 space-y-3">{milestones.map((item) => <button key={item.label} type="button" onClick={() => onActivity(`Reviewed milestone: ${item.label}.`)} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.07] bg-slate-950/30 p-3 text-left"><CalendarDays className="h-4 w-4 text-cyan-200" /><span className="flex-1"><span className="block text-xs font-medium text-slate-300">{item.label}</span><span className="mt-1 block text-[10px] text-slate-600">{item.date}</span></span><span className="text-xs font-semibold text-white">{item.amount}</span></button>)}</div></div>
        </div>
      </div>
    </div>
  );
}

export default function BusinessCommandCentreWorkspace() {
  const [view, setView] = useState<ViewKey>('overview');
  const [activity, setActivity] = useState('Command Centre loaded. Choose a section to begin.');
  const [tourStarted, setTourStarted] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [sessionKey, setSessionKey] = useState(0);
  const activityTime = useMemo(() => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), [activity]);
  const currentTour = tourSteps[tourStep];
  const currentView = navItems.find((item) => item.key === view) ?? navItems[0];

  const selectView = (next: ViewKey) => { setView(next); setActivity(`Opened ${navItems.find((item) => item.key === next)?.label.toLowerCase() ?? next}.`); };
  const startTour = () => { setTourStarted(true); setTourStep(0); setView(tourSteps[0].view); setActivity('Guided Command Centre tour started.'); };
  const nextTourStep = () => { const next = Math.min(tourStep + 1, tourSteps.length - 1); setTourStep(next); setView(tourSteps[next].view); setActivity(next === tourStep ? 'Guided tour complete.' : `Guided tour moved to ${tourSteps[next].title.toLowerCase()}.`); };
  const reset = () => { setView('overview'); setActivity('Command Centre reset to the starting view.'); setTourStarted(false); setTourStep(0); setSessionKey((value) => value + 1); };

  return (
    <main className="min-h-screen bg-[#07111f] px-6 pb-20 pt-32 text-white sm:pt-36">
      <div className="mx-auto max-w-7xl">
        <Link href="/demos" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" />Back to Demo Lab</Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div><div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200"><BriefcaseBusiness className="h-3.5 w-3.5" />Interactive dashboard</div><h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">Business Command Centre</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">Explore a simulated operations workspace covering projects, team workload, priority tasks, revenue and cash flow.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={startTour} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"><Play className="h-4 w-4 fill-current" />{tourStarted ? 'Restart guided tour' : 'Start guided tour'}</button><button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"><RefreshCw className="h-4 w-4" />Reset demo</button></div>
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" /><div><p className="text-sm font-medium text-emerald-100">Simulated environment</p><p className="mt-1 text-xs leading-5 text-emerald-100/60">All businesses, people, projects, figures and actions are fictional. No real customer or payment data is used.</p></div></div><span className="inline-flex items-center gap-2 text-xs text-emerald-100/60"><Clock3 className="h-3.5 w-3.5" />No signup required</span></div>

        {tourStarted && <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" /><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-200">Step {tourStep + 1} of {tourSteps.length}</p><p className="mt-1 text-sm font-medium text-cyan-100">{currentTour.title}</p><p className="mt-1 text-xs leading-5 text-cyan-100/60">{currentTour.instruction}</p></div></div><button type="button" onClick={nextTourStep} className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/15">{tourStep === tourSteps.length - 1 ? 'Finish tour' : 'Next section'}<ArrowRight className="h-3.5 w-3.5" /></button></div>}

        <section className="mt-6 rounded-[1.75rem] border border-white/10 bg-[#0a1525] p-4 shadow-2xl shadow-black/30 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-300/70" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-300/70" /><span className="ml-2 text-[11px] text-slate-600">command.demo.digital-footprint.uk</span></div><div className="flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-300" />Demo environment active</div></div>

          <div className="grid gap-5 xl:grid-cols-[220px_1fr]" key={sessionKey}>
            <aside className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"><div className="mb-4 flex items-center gap-2 px-2 py-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200"><LayoutDashboard className="h-4 w-4" /></div><div><p className="text-xs font-semibold text-white">Northstar Co.</p><p className="text-[10px] text-slate-500">Command Centre</p></div></div><nav className="space-y-1">{navItems.map((item) => { const Icon = item.icon; return <button key={item.key} type="button" onClick={() => selectView(item.key)} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition ${view === item.key ? 'bg-cyan-300 text-slate-950' : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'}`}><Icon className="h-4 w-4" />{item.label}</button>; })}</nav></aside>

            <div className="min-w-0 space-y-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-200">{currentView.label}</p><h2 className="mt-2 text-2xl font-semibold text-white">{currentView.heading}</h2><p className="mt-2 max-w-2xl text-sm text-slate-400">{currentView.description}</p></div><span className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-medium text-emerald-200"><CheckCircle2 className="h-3.5 w-3.5" />Systems healthy</span></div>
              {view === 'overview' && <OverviewView onActivity={setActivity} onNavigate={selectView} />}
              {view === 'projects' && <ProjectsView onActivity={setActivity} />}
              {view === 'team' && <TeamView onActivity={setActivity} />}
              {view === 'tasks' && <TasksView onActivity={setActivity} />}
              {view === 'finance' && <FinanceView onActivity={setActivity} />}
            </div>
          </div>
        </section>

        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]"><Send className="h-3.5 w-3.5 text-slate-400" /></div><div><p className="text-xs font-medium text-slate-300">Latest demo activity</p><p className="mt-1 text-xs text-slate-500">{activity} · {activityTime}</p></div></div><Link href="/contact" className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-200 transition hover:text-cyan-100">Build something like this<ArrowRight className="h-3.5 w-3.5" /></Link></div>
      </div>
    </main>
  );
}
