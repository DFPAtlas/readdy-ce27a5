'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  CirclePoundSterling,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  FolderOpen,
  LayoutDashboard,
  MessageSquareText,
  Paperclip,
  Play,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
  UsersRound,
  Workflow,
} from 'lucide-react';

type ViewKey = 'overview' | 'milestones' | 'approvals' | 'messages' | 'files' | 'billing';
type ApprovalDecision = 'pending' | 'approved' | 'changes';
type InvoiceStatus = 'Paid' | 'Due' | 'Scheduled';

type Milestone = {
  id: string;
  title: string;
  status: 'Complete' | 'Current' | 'Upcoming';
  date: string;
  description: string;
};

type PortalFile = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  date: string;
};

type PortalMessage = {
  id: string;
  author: string;
  role: string;
  body: string;
  time: string;
  client: boolean;
};

type Invoice = {
  id: string;
  label: string;
  amount: number;
  due: string;
  status: InvoiceStatus;
  description: string;
};

const currency = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const milestones: Milestone[] = [
  {
    id: 'discovery',
    title: 'Discovery and planning',
    status: 'Complete',
    date: '8 Jul 2026',
    description: 'Business goals, user journeys and technical scope agreed.',
  },
  {
    id: 'wireframes',
    title: 'Wireframes',
    status: 'Complete',
    date: '18 Jul 2026',
    description: 'Core page structures and portal navigation approved.',
  },
  {
    id: 'design',
    title: 'Visual design',
    status: 'Current',
    date: '29 Jul 2026',
    description: 'Homepage and customer dashboard concepts are ready for review.',
  },
  {
    id: 'build',
    title: 'Application build',
    status: 'Upcoming',
    date: '14 Aug 2026',
    description: 'Frontend, secure portal and content-management features.',
  },
  {
    id: 'testing',
    title: 'Testing and launch',
    status: 'Upcoming',
    date: '4 Sep 2026',
    description: 'Client testing, launch checks and production release.',
  },
];

const initialFiles: PortalFile[] = [
  { id: 'brief', name: 'Project brief.pdf', type: 'PDF', size: '1.8 MB', uploadedBy: 'Digital Footprint', date: '8 Jul 2026' },
  { id: 'wireframes', name: 'Approved wireframes.pdf', type: 'PDF', size: '4.2 MB', uploadedBy: 'Amelia Hart', date: '18 Jul 2026' },
  { id: 'copy', name: 'Homepage copy.docx', type: 'DOCX', size: '620 KB', uploadedBy: 'Aster & Co.', date: '23 Jul 2026' },
  { id: 'design', name: 'Homepage concept v2.pdf', type: 'PDF', size: '8.1 MB', uploadedBy: 'Amelia Hart', date: '27 Jul 2026' },
];

const initialMessages: PortalMessage[] = [
  {
    id: 'm1',
    author: 'Amelia Hart',
    role: 'Head of UX',
    body: 'The second homepage concept is ready. We increased the service-card contrast and simplified the main call to action.',
    time: 'Today · 10:14',
    client: false,
  },
  {
    id: 'm2',
    author: 'Martin',
    role: 'Client',
    body: 'The new layout feels much clearer. I will review the mobile version and confirm the final direction today.',
    time: 'Today · 10:46',
    client: true,
  },
  {
    id: 'm3',
    author: 'Sophie Reed',
    role: 'Project Lead',
    body: 'Once the design is approved, the build team can begin the customer-dashboard screens immediately.',
    time: 'Today · 11:05',
    client: false,
  },
];

const initialInvoices: Invoice[] = [
  {
    id: 'deposit',
    label: 'Project starting payment',
    amount: 4800,
    due: 'Paid 8 Jul 2026',
    status: 'Paid',
    description: 'Initial 50% starting payment covering discovery, planning and design commencement.',
  },
  {
    id: 'milestone',
    label: 'Design approval milestone',
    amount: 2400,
    due: 'Due 14 Aug 2026',
    status: 'Due',
    description: 'Payment due after design approval and before the main application build begins.',
  },
  {
    id: 'launch',
    label: 'Testing and launch balance',
    amount: 2400,
    due: 'Scheduled 4 Sep 2026',
    status: 'Scheduled',
    description: 'Final balance covering testing, deployment and launch support.',
  },
];

const viewConfig: Record<ViewKey, { label: string; heading: string; description: string; icon: typeof LayoutDashboard }> = {
  overview: {
    label: 'Project overview',
    heading: 'Website and customer portal',
    description: 'A clear client view of progress, decisions, conversations, documents and upcoming payments.',
    icon: LayoutDashboard,
  },
  milestones: {
    label: 'Milestones',
    heading: 'Project milestones',
    description: 'Track completed work, the current delivery phase and what happens next.',
    icon: Workflow,
  },
  approvals: {
    label: 'Approvals',
    heading: 'Design review and approval',
    description: 'Review the latest concept, approve it or send a structured change request to the project team.',
    icon: FileCheck2,
  },
  messages: {
    label: 'Messages',
    heading: 'Project conversation',
    description: 'Keep client questions and project-team responses in one visible, searchable conversation.',
    icon: MessageSquareText,
  },
  files: {
    label: 'Files',
    heading: 'Shared project files',
    description: 'Review approved documents, creative assets and simulated uploads without leaving the portal.',
    icon: FolderOpen,
  },
  billing: {
    label: 'Invoices and payments',
    heading: 'Invoices and payment schedule',
    description: 'See paid, due and scheduled project payments with clear milestone descriptions.',
    icon: CirclePoundSterling,
  },
};

const tourSteps: Array<{ view: ViewKey; title: string; instruction: string }> = [
  { view: 'overview', title: 'Review project progress', instruction: 'Check the overall completion figure and the client actions requiring attention.' },
  { view: 'milestones', title: 'Inspect the delivery plan', instruction: 'Open the current visual-design milestone and review what comes next.' },
  { view: 'approvals', title: 'Make a design decision', instruction: 'Approve the homepage concept or send a simulated change request.' },
  { view: 'messages', title: 'Send a project message', instruction: 'Add a short message to the shared project conversation.' },
  { view: 'files', title: 'Review shared documents', instruction: 'Open a file record and simulate uploading a new client asset.' },
  { view: 'billing', title: 'Check the payment schedule', instruction: 'Open the design milestone invoice and simulate marking it paid.' },
];

function StatusPill({ status }: { status: Milestone['status'] | InvoiceStatus }) {
  const classes =
    status === 'Complete' || status === 'Paid'
      ? 'bg-emerald-300/10 text-emerald-200'
      : status === 'Current' || status === 'Due'
        ? 'bg-violet-300/10 text-violet-200'
        : 'bg-white/[0.06] text-slate-400';

  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.11em] ${classes}`}>{status}</span>;
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-slate-800">
      <div className="h-2 rounded-full bg-violet-300 transition-all duration-500" style={{ width: `${value}%` }} />
    </div>
  );
}

function OverviewView({
  progress,
  decision,
  onNavigate,
  onActivity,
}: {
  progress: number;
  decision: ApprovalDecision;
  onNavigate: (view: ViewKey) => void;
  onActivity: (message: string) => void;
}) {
  const cards: Array<{ label: string; value: string; note: string; target: ViewKey; icon: typeof LayoutDashboard }> = [
    { label: 'Project completion', value: `${progress}%`, note: decision === 'approved' ? 'Design approved' : 'Design decision required', target: 'milestones', icon: Workflow },
    { label: 'Open approval', value: decision === 'pending' ? '1' : '0', note: decision === 'changes' ? 'Changes requested' : decision === 'approved' ? 'All clear' : 'Homepage concept v2', target: 'approvals', icon: FileCheck2 },
    { label: 'Shared files', value: '4', note: '1 uploaded this week', target: 'files', icon: FolderOpen },
    { label: 'Next payment', value: currency.format(2400), note: 'Due 14 Aug 2026', target: 'billing', icon: CirclePoundSterling },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-violet-200">Aster & Co.</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Phase 3 · Visual design</h3>
            <p className="mt-2 text-sm text-slate-400">The project is waiting for a client decision on the homepage concept.</p>
          </div>
          <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-medium text-violet-200">{progress}% complete</span>
        </div>
        <div className="mt-5"><ProgressBar value={progress} /></div>
        <div className="mt-3 flex justify-between text-[10px] text-slate-600">
          <span>Discovery</span><span>Wireframes</span><span>Design</span><span>Build</span><span>Launch</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, target, icon: Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              onNavigate(target);
              onActivity(`Opened ${label.toLowerCase()} from the project overview.`);
            }}
            className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-left transition hover:border-violet-300/25 hover:bg-white/[0.055]"
          >
            <div className="flex items-center justify-between"><span className="text-xs text-slate-500">{label}</span><Icon className="h-4 w-4 text-violet-200" /></div>
            <p className="mt-4 text-2xl font-semibold text-white">{value}</p>
            <p className={`mt-1 text-xs ${note.includes('required') || note.includes('Due') ? 'text-orange-200' : 'text-emerald-200'}`}>{note}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center justify-between"><div><h3 className="font-semibold text-white">Recent project activity</h3><p className="mt-1 text-xs text-slate-500">Latest fictional updates across the project.</p></div><Clock3 className="h-5 w-5 text-violet-200" /></div>
          <div className="mt-5 space-y-4">
            {[
              ['Today · 11:05', 'Project team confirmed build readiness'],
              ['Today · 10:14', 'Homepage concept v2 uploaded'],
              ['26 Jul · 15:40', 'Homepage copy changes completed'],
              ['18 Jul · 12:20', 'Wireframes approved by client'],
            ].map(([time, event]) => (
              <button key={event} type="button" onClick={() => onActivity(`Reviewed activity: ${event}.`)} className="flex w-full gap-3 text-left">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-300" />
                <span><span className="block text-xs font-medium text-slate-300">{event}</span><span className="mt-1 block text-[10px] text-slate-600">{time}</span></span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-orange-300/20 bg-orange-300/[0.06] p-5">
          <div className="flex items-center gap-3"><FileCheck2 className="h-5 w-5 text-orange-200" /><div><h3 className="font-semibold text-white">Client action required</h3><p className="mt-1 text-xs text-slate-400">Homepage concept v2 needs a decision.</p></div></div>
          <button type="button" onClick={() => { onNavigate('approvals'); onActivity('Opened the outstanding homepage approval.'); }} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-200">
            Review design <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MilestonesView({ onActivity }: { onActivity: (message: string) => void }) {
  const [selectedId, setSelectedId] = useState('design');
  const selected = milestones.find((milestone) => milestone.id === selectedId) ?? milestones[0];

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <h3 className="font-semibold text-white">Delivery plan</h3>
        <p className="mt-1 text-xs text-slate-500">Select a milestone to review its scope and status.</p>
        <div className="mt-5 space-y-3">
          {milestones.map((milestone, index) => (
            <button key={milestone.id} type="button" onClick={() => { setSelectedId(milestone.id); onActivity(`Opened milestone: ${milestone.title}.`); }} className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${selectedId === milestone.id ? 'border-violet-300/30 bg-violet-300/[0.07]' : 'border-white/[0.07] bg-slate-950/30 hover:border-violet-300/15'}`}>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${milestone.status === 'Complete' ? 'bg-emerald-300 text-slate-950' : milestone.status === 'Current' ? 'bg-violet-300 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>{milestone.status === 'Complete' ? <Check className="h-4 w-4" /> : index + 1}</span>
              <span className="flex-1"><span className="block text-sm font-medium text-white">{milestone.title}</span><span className="mt-1 block text-xs text-slate-500">{milestone.date}</span></span>
              <StatusPill status={milestone.status} />
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-200">Milestone detail</p><h3 className="mt-2 text-xl font-semibold text-white">{selected.title}</h3><p className="mt-1 text-xs text-slate-500">{selected.date}</p></div><StatusPill status={selected.status} /></div>
        <p className="mt-6 text-sm leading-6 text-slate-400">{selected.description}</p>
        <div className="mt-6 rounded-xl border border-white/[0.07] bg-slate-950/30 p-4">
          <p className="text-xs font-medium text-white">What happens next</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{selected.status === 'Complete' ? 'This milestone is complete and its approved outputs are stored in the project files area.' : selected.status === 'Current' ? 'Client approval unlocks the main application build and the next payment milestone.' : 'This phase begins automatically after the previous milestone has been completed.'}</p>
        </div>
        <button type="button" onClick={() => onActivity(`Reviewed the ${selected.title.toLowerCase()} milestone plan.`)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-200"><CalendarDays className="h-4 w-4" />Review milestone</button>
      </div>
    </div>
  );
}

function ApprovalsView({ decision, onDecision, onActivity }: { decision: ApprovalDecision; onDecision: (decision: ApprovalDecision) => void; onActivity: (message: string) => void }) {
  const decide = (next: 'approved' | 'changes') => {
    onDecision(next);
    onActivity(next === 'approved' ? 'Homepage concept v2 approved.' : 'Structured change request sent to the project team.');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><h3 className="font-semibold text-white">Homepage concept v2</h3><p className="mt-1 text-xs text-slate-500">Uploaded by Amelia Hart · 27 Jul 2026</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${decision === 'approved' ? 'bg-emerald-300/10 text-emerald-200' : decision === 'changes' ? 'bg-orange-300/10 text-orange-200' : 'bg-violet-300/10 text-violet-200'}`}>{decision === 'approved' ? 'Approved' : decision === 'changes' ? 'Changes sent' : 'Awaiting review'}</span></div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-3">
          <div className="rounded-xl bg-white p-4">
            <div className="flex items-center justify-between"><div className="h-2 w-16 rounded-full bg-slate-900" /><div className="flex gap-2"><div className="h-1.5 w-8 rounded-full bg-slate-200" /><div className="h-1.5 w-8 rounded-full bg-slate-200" /><div className="h-1.5 w-8 rounded-full bg-slate-200" /></div></div>
            <div className="mt-8 grid grid-cols-[1.1fr_0.9fr] gap-4"><div><div className="h-3 w-20 rounded-full bg-violet-300" /><div className="mt-3 h-5 w-full rounded bg-slate-900" /><div className="mt-2 h-5 w-4/5 rounded bg-slate-900" /><div className="mt-4 h-2 w-full rounded bg-slate-200" /><div className="mt-2 h-2 w-3/4 rounded bg-slate-200" /><div className="mt-5 h-8 w-24 rounded-lg bg-violet-500" /></div><div className="h-32 rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100" /></div>
            <div className="mt-5 grid grid-cols-3 gap-3"><div className="h-14 rounded-lg bg-slate-100" /><div className="h-14 rounded-lg bg-slate-100" /><div className="h-14 rounded-lg bg-slate-100" /></div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => decide('approved')} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-200"><CheckCircle2 className="h-4 w-4" />Approve design</button>
          <button type="button" onClick={() => decide('changes')} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"><MessageSquareText className="h-4 w-4" />Request changes</button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><h3 className="font-semibold text-white">Review checklist</h3><div className="mt-4 space-y-3">{['Headline and key message', 'Primary call to action', 'Service-card layout', 'Mobile navigation', 'Brand colour balance'].map((item, index) => <button key={item} type="button" onClick={() => onActivity(`Reviewed design item: ${item}.`)} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.07] bg-slate-950/30 p-3 text-left"><span className={`flex h-5 w-5 items-center justify-center rounded-full ${index < 3 || decision === 'approved' ? 'bg-emerald-300 text-slate-950' : 'border border-white/15 text-transparent'}`}><Check className="h-3 w-3" /></span><span className="text-xs text-slate-300">{item}</span></button>)}</div></div>
        <div className={`rounded-2xl border p-5 ${decision === 'approved' ? 'border-emerald-300/20 bg-emerald-300/[0.06]' : decision === 'changes' ? 'border-orange-300/20 bg-orange-300/[0.06]' : 'border-violet-300/20 bg-violet-300/[0.06]'}`}><h3 className="font-semibold text-white">Decision impact</h3><p className="mt-2 text-xs leading-5 text-slate-400">{decision === 'approved' ? 'The build phase is unlocked and the design milestone invoice is ready.' : decision === 'changes' ? 'The project team has received the change request and will prepare a revised concept.' : 'A client decision is required before the main portal build can begin.'}</p></div>
      </div>
    </div>
  );
}

function MessagesView({ onActivity }: { onActivity: (message: string) => void }) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');

  const sendMessage = () => {
    const body = draft.trim();
    if (!body) {
      onActivity('Enter a message before sending.');
      return;
    }
    setMessages((current) => [...current, { id: `client-${current.length + 1}`, author: 'Martin', role: 'Client', body, time: 'Just now', client: true }]);
    setDraft('');
    onActivity('Project message added to the simulated conversation.');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-center justify-between"><div><h3 className="font-semibold text-white">Project conversation</h3><p className="mt-1 text-xs text-slate-500">A shared thread between the client and delivery team.</p></div><MessageSquareText className="h-5 w-5 text-violet-200" /></div>
        <div className="mt-5 max-h-[420px] space-y-4 overflow-y-auto pr-1">
          {messages.map((message) => (
            <button key={message.id} type="button" onClick={() => onActivity(`Reviewed message from ${message.author}.`)} className={`block w-full rounded-2xl border p-4 text-left ${message.client ? 'ml-auto max-w-[88%] border-violet-300/20 bg-violet-300/[0.07]' : 'mr-auto max-w-[92%] border-white/[0.07] bg-slate-950/30'}`}>
              <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold text-white">{message.author}</p><p className="mt-0.5 text-[10px] text-slate-600">{message.role}</p></div><span className="text-[10px] text-slate-600">{message.time}</span></div>
              <p className="mt-3 text-xs leading-5 text-slate-400">{message.body}</p>
            </button>
          ))}
        </div>
        <div className="mt-5 border-t border-white/10 pt-5"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} maxLength={320} placeholder="Write a project message..." className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-violet-300/30 focus:outline-none" /><div className="mt-3 flex items-center justify-between"><button type="button" onClick={() => onActivity('Opened the simulated attachment picker.')} className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 transition hover:text-violet-200"><Paperclip className="h-3.5 w-3.5" />Attach file</button><div className="flex items-center gap-3"><span className="text-[10px] text-slate-600">{draft.length}/320</span><button type="button" onClick={sendMessage} className="inline-flex items-center gap-2 rounded-xl bg-violet-300 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-violet-200"><Send className="h-3.5 w-3.5" />Send message</button></div></div></div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><h3 className="font-semibold text-white">Project contacts</h3><div className="mt-4 space-y-3">{[['Amelia Hart', 'Head of UX', 'AH'], ['Sophie Reed', 'Project Lead', 'SR'], ['Chris Morgan', 'Head of UI', 'CM']].map(([name, role, initials]) => <button key={name} type="button" onClick={() => onActivity(`Opened contact: ${name}.`)} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.07] bg-slate-950/30 p-3 text-left"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-300/10 text-xs font-semibold text-violet-200">{initials}</span><span><span className="block text-xs font-medium text-slate-300">{name}</span><span className="mt-1 block text-[10px] text-slate-600">{role}</span></span></button>)}</div></div>
        <button type="button" onClick={() => onActivity('Opened the simulated support request form.')} className="w-full rounded-2xl border border-violet-300/20 bg-violet-300/[0.06] p-5 text-left"><p className="text-xs text-violet-200">Need help?</p><p className="mt-2 font-semibold text-white">Raise a project question</p><p className="mt-2 text-xs leading-5 text-slate-500">Keep support requests connected to the project timeline.</p></button>
      </div>
    </div>
  );
}

function FilesView({ onActivity }: { onActivity: (message: string) => void }) {
  const [files, setFiles] = useState(initialFiles);
  const [selectedId, setSelectedId] = useState('design');
  const selected = files.find((file) => file.id === selectedId) ?? files[0];

  const simulateUpload = () => {
    if (files.some((file) => file.id === 'logo-pack')) {
      onActivity('The simulated logo pack has already been uploaded.');
      return;
    }
    const uploaded: PortalFile = { id: 'logo-pack', name: 'Client logo pack.zip', type: 'ZIP', size: '3.4 MB', uploadedBy: 'Aster & Co.', date: 'Just now' };
    setFiles((current) => [...current, uploaded]);
    setSelectedId(uploaded.id);
    onActivity('Simulated client logo pack uploaded.');
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold text-white">Shared documents</h3><p className="mt-1 text-xs text-slate-500">{files.length} simulated files available.</p></div><button type="button" onClick={simulateUpload} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-300 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-violet-200"><Upload className="h-3.5 w-3.5" />Simulate upload</button></div>
        <div className="mt-5 space-y-3">{files.map((file) => <button key={file.id} type="button" onClick={() => { setSelectedId(file.id); onActivity(`Opened file record: ${file.name}.`); }} className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${selectedId === file.id ? 'border-violet-300/30 bg-violet-300/[0.07]' : 'border-white/[0.07] bg-slate-950/30 hover:border-violet-300/15'}`}><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-300/10 text-violet-200"><FileText className="h-4 w-4" /></span><span className="flex-1"><span className="block text-sm font-medium text-white">{file.name}</span><span className="mt-1 block text-xs text-slate-600">{file.uploadedBy} · {file.date}</span></span><span className="text-[10px] text-slate-500">{file.size}</span></button>)}</div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-200">File detail</p><div className="mt-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-violet-300/10 text-violet-200"><FileText className="h-9 w-9" /></div><h3 className="mt-5 text-lg font-semibold text-white">{selected.name}</h3><dl className="mt-5 space-y-4 text-xs">{[['Type', selected.type], ['File size', selected.size], ['Uploaded by', selected.uploadedBy], ['Date', selected.date]].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-white/[0.07] pb-3 last:border-0"><dt className="text-slate-500">{label}</dt><dd className="font-medium text-slate-300">{value}</dd></div>)}</dl><button type="button" onClick={() => onActivity(`Simulated download prepared for ${selected.name}.`)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"><Download className="h-4 w-4" />Simulate download</button></div>
    </div>
  );
}

function BillingView({ invoices, onInvoicesChange, onActivity }: { invoices: Invoice[]; onInvoicesChange: (invoices: Invoice[]) => void; onActivity: (message: string) => void }) {
  const [selectedId, setSelectedId] = useState('milestone');
  const selected = invoices.find((invoice) => invoice.id === selectedId) ?? invoices[0];
  const total = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paid = invoices.filter((invoice) => invoice.status === 'Paid').reduce((sum, invoice) => sum + invoice.amount, 0);

  const markPaid = () => {
    if (selected.status === 'Paid') {
      onActivity(`${selected.label} is already marked paid.`);
      return;
    }
    onInvoicesChange(invoices.map((invoice) => invoice.id === selected.id ? { ...invoice, status: 'Paid' as InvoiceStatus, due: 'Paid just now' } : invoice));
    onActivity(`Simulated payment recorded for ${selected.label}.`);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">{[
        { label: 'Total project value', value: currency.format(total), note: 'Three payment stages', icon: CirclePoundSterling },
        { label: 'Paid to date', value: currency.format(paid), note: `${Math.round((paid / total) * 100)}% paid`, icon: CheckCircle2 },
        { label: 'Remaining balance', value: currency.format(total - paid), note: 'Due by launch', icon: CalendarDays },
      ].map(({ label, value, note, icon: Icon }) => <button key={label} type="button" onClick={() => onActivity(`Reviewed ${label.toLowerCase()}.`)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-left transition hover:border-violet-300/25"><div className="flex items-center justify-between"><span className="text-xs text-slate-500">{label}</span><Icon className="h-4 w-4 text-violet-200" /></div><p className="mt-4 text-2xl font-semibold text-white">{value}</p><p className="mt-1 text-xs text-emerald-200">{note}</p></button>)}</div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><h3 className="font-semibold text-white">Payment schedule</h3><p className="mt-1 text-xs text-slate-500">Select an invoice to inspect its milestone detail.</p><div className="mt-5 space-y-3">{invoices.map((invoice) => <button key={invoice.id} type="button" onClick={() => { setSelectedId(invoice.id); onActivity(`Opened invoice: ${invoice.label}.`); }} className={`w-full rounded-xl border p-4 text-left transition ${selectedId === invoice.id ? 'border-violet-300/30 bg-violet-300/[0.07]' : 'border-white/[0.07] bg-slate-950/30 hover:border-violet-300/15'}`}><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-white">{invoice.label}</p><p className="mt-1 text-xs text-slate-500">{invoice.due}</p></div><div className="flex items-center gap-3"><span className="text-sm font-semibold text-white">{currency.format(invoice.amount)}</span><StatusPill status={invoice.status} /></div></div></button>)}</div></div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-200">Invoice detail</p><h3 className="mt-2 text-xl font-semibold text-white">{selected.label}</h3><p className="mt-1 text-xs text-slate-500">{selected.due}</p></div><StatusPill status={selected.status} /></div><p className="mt-6 text-3xl font-semibold text-white">{currency.format(selected.amount)}</p><p className="mt-4 text-xs leading-5 text-slate-400">{selected.description}</p><div className="mt-5 rounded-xl border border-white/[0.07] bg-slate-950/30 p-4"><div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-200" /><p className="text-xs font-medium text-white">Demonstration payment only</p></div><p className="mt-2 text-[10px] leading-5 text-slate-600">No payment provider is contacted and no real transaction is created.</p></div><button type="button" onClick={markPaid} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-200"><CheckCircle2 className="h-4 w-4" />{selected.status === 'Paid' ? 'Payment recorded' : 'Simulate payment'}</button></div>
      </div>
    </div>
  );
}

export default function CustomerProjectPortalWorkspace() {
  const [view, setView] = useState<ViewKey>('overview');
  const [activity, setActivity] = useState('Customer portal loaded. Choose a section to begin.');
  const [decision, setDecision] = useState<ApprovalDecision>('pending');
  const [invoices, setInvoices] = useState(initialInvoices);
  const [tourStarted, setTourStarted] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const currentView = viewConfig[view];
  const currentTour = tourSteps[tourStep];
  const progress = decision === 'approved' ? 74 : decision === 'changes' ? 66 : 68;
  const activityTime = useMemo(() => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), [activity]);

  const selectView = (next: ViewKey) => {
    setView(next);
    setActivity(`Opened ${viewConfig[next].label.toLowerCase()}.`);
  };

  const startTour = () => {
    setTourStarted(true);
    setTourStep(0);
    setView(tourSteps[0].view);
    setActivity('Guided customer portal tour started.');
  };

  const nextTourStep = () => {
    const next = Math.min(tourStep + 1, tourSteps.length - 1);
    setTourStep(next);
    setView(tourSteps[next].view);
    setActivity(next === tourStep ? 'Guided customer portal tour complete.' : `Guided tour moved to ${tourSteps[next].title.toLowerCase()}.`);
  };

  const reset = () => {
    setView('overview');
    setActivity('Customer portal reset to the starting view.');
    setDecision('pending');
    setInvoices(initialInvoices);
    setTourStarted(false);
    setTourStep(0);
  };

  return (
    <main className="min-h-screen bg-[#07111f] px-6 pb-20 pt-32 text-white sm:pt-36">
      <div className="mx-auto max-w-7xl">
        <Link href="/demos" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" />Back to Demo Lab</Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-violet-200"><UsersRound className="h-3.5 w-3.5" />Client experience</div><h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">Customer Project Portal</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">Explore a simulated client workspace for milestones, design approvals, messages, files, invoices and payment schedules.</p></div><div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={startTour} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-200"><Play className="h-4 w-4 fill-current" />{tourStarted ? 'Restart guided tour' : 'Start guided tour'}</button><button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"><RefreshCw className="h-4 w-4" />Reset demo</button></div></div>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" /><div><p className="text-sm font-medium text-emerald-100">Simulated client environment</p><p className="mt-1 text-xs leading-5 text-emerald-100/60">All companies, people, files, messages, invoices and actions are fictional. No real account or payment data is used.</p></div></div><span className="inline-flex items-center gap-2 text-xs text-emerald-100/60"><Clock3 className="h-3.5 w-3.5" />No signup required</span></div>

        {tourStarted && <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-violet-300/20 bg-violet-300/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-200" /><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-200">Step {tourStep + 1} of {tourSteps.length}</p><p className="mt-1 text-sm font-medium text-violet-100">{currentTour.title}</p><p className="mt-1 text-xs leading-5 text-violet-100/60">{currentTour.instruction}</p></div></div><button type="button" onClick={nextTourStep} className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-300/20 bg-violet-300/10 px-4 py-2.5 text-xs font-semibold text-violet-100 transition hover:bg-violet-300/15">{tourStep === tourSteps.length - 1 ? 'Finish tour' : 'Next section'}<ArrowRight className="h-3.5 w-3.5" /></button></div>}

        <section className="mt-6 rounded-[1.75rem] border border-white/10 bg-[#0a1525] p-4 shadow-2xl shadow-black/30 sm:p-6"><div className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-300/70" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-300/70" /><span className="ml-2 text-[11px] text-slate-600">portal.demo.digital-footprint.uk</span></div><div className="flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-300" />Client environment active</div></div>

          <div className="grid gap-5 xl:grid-cols-[230px_1fr]"><aside className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"><div className="mb-4 flex items-center gap-3 border-b border-white/10 px-2 pb-4 pt-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-300/10 text-violet-200"><UsersRound className="h-4 w-4" /></div><div><p className="text-xs font-semibold text-white">Aster & Co.</p><p className="text-[10px] text-slate-500">Customer portal</p></div></div><nav className="space-y-1">{(Object.keys(viewConfig) as ViewKey[]).map((key) => { const item = viewConfig[key]; const Icon = item.icon; return <button key={key} type="button" onClick={() => selectView(key)} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition ${view === key ? 'bg-violet-300 text-slate-950' : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'}`}><Icon className="h-4 w-4" />{item.label}</button>; })}</nav></aside>

            <div className="min-w-0 space-y-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-medium uppercase tracking-[0.16em] text-violet-200">{currentView.label}</p><h2 className="mt-2 text-2xl font-semibold text-white">{currentView.heading}</h2><p className="mt-2 max-w-3xl text-sm text-slate-400">{currentView.description}</p></div><span className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-medium text-emerald-200"><CheckCircle2 className="h-3.5 w-3.5" />Portal secure</span></div>

              {view === 'overview' && <OverviewView progress={progress} decision={decision} onNavigate={selectView} onActivity={setActivity} />}
              {view === 'milestones' && <MilestonesView onActivity={setActivity} />}
              {view === 'approvals' && <ApprovalsView decision={decision} onDecision={setDecision} onActivity={setActivity} />}
              {view === 'messages' && <MessagesView onActivity={setActivity} />}
              {view === 'files' && <FilesView onActivity={setActivity} />}
              {view === 'billing' && <BillingView invoices={invoices} onInvoicesChange={setInvoices} onActivity={setActivity} />}
            </div>
          </div>
        </section>

        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]"><Send className="h-3.5 w-3.5 text-slate-400" /></div><div><p className="text-xs font-medium text-slate-300">Latest portal activity</p><p className="mt-1 text-xs text-slate-500">{activity} · {activityTime}</p></div></div><Link href="/contact" className="inline-flex items-center gap-2 text-xs font-semibold text-violet-200 transition hover:text-violet-100">Build a client portal like this<ArrowRight className="h-3.5 w-3.5" /></Link></div>
      </div>
    </main>
  );
}
