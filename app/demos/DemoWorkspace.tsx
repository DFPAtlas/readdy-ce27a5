'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  Gauge,
  LayoutDashboard,
  MessageSquareText,
  Play,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Workflow,
} from 'lucide-react';

type DemoType = 'command' | 'sales' | 'portal';

type DemoWorkspaceProps = {
  type: DemoType;
  title: string;
  eyebrow: string;
  description: string;
};

const demoTheme = {
  command: {
    accent: 'cyan',
    icon: BriefcaseBusiness,
    button: 'bg-cyan-300 text-slate-950 hover:bg-cyan-200',
    soft: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-200',
  },
  sales: {
    accent: 'orange',
    icon: Bot,
    button: 'bg-orange-300 text-slate-950 hover:bg-orange-200',
    soft: 'border-orange-300/20 bg-orange-300/10 text-orange-200',
  },
  portal: {
    accent: 'violet',
    icon: UsersRound,
    button: 'bg-violet-300 text-slate-950 hover:bg-violet-200',
    soft: 'border-violet-300/20 bg-violet-300/10 text-violet-200',
  },
} as const;

function CommandCentreDemo({ onActivity }: { onActivity: (message: string) => void }) {
  const [view, setView] = useState<'overview' | 'projects' | 'team'>('overview');

  const panels = {
    overview: {
      heading: 'Business overview',
      text: 'A single view of revenue, delivery health and current priorities.',
    },
    projects: {
      heading: 'Project delivery',
      text: 'Track progress, risk and the next action across every active build.',
    },
    team: {
      heading: 'Team capacity',
      text: 'See who is available, overloaded or waiting for client input.',
    },
  };

  const selectView = (next: typeof view) => {
    setView(next);
    onActivity(`Opened ${panels[next].heading.toLowerCase()}.`);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[220px_1fr]">
      <aside className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
        <div className="mb-4 flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Northstar Co.</p>
            <p className="text-[10px] text-slate-500">Command Centre</p>
          </div>
        </div>
        <nav className="space-y-1">
          {[
            ['overview', LayoutDashboard, 'Overview'],
            ['projects', Workflow, 'Projects'],
            ['team', UsersRound, 'Team capacity'],
          ].map(([key, Icon, label]) => {
            const NavIcon = Icon as typeof LayoutDashboard;
            const active = view === key;
            return (
              <button
                key={key as string}
                type="button"
                onClick={() => selectView(key as typeof view)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition ${
                  active ? 'bg-cyan-300 text-slate-950' : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <NavIcon className="h-4 w-4" />
                {label as string}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-200">{panels[view].heading}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Monday operations snapshot</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">{panels[view].text}</p>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Systems healthy
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            ['Revenue this month', '£84,200', '+12.4%', CircleDollarSign],
            ['Active projects', '18', '14 on track', Workflow],
            ['Team capacity', '76%', 'Healthy', Gauge],
          ].map(([label, value, note, Icon]) => {
            const CardIcon = Icon as typeof Gauge;
            return (
              <button
                key={label as string}
                type="button"
                onClick={() => onActivity(`Inspected ${String(label).toLowerCase()}.`)}
                className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-left transition hover:border-cyan-300/25 hover:bg-white/[0.055]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{label as string}</span>
                  <CardIcon className="h-4 w-4 text-cyan-200" />
                </div>
                <p className="mt-4 text-2xl font-semibold text-white">{value as string}</p>
                <p className="mt-1 text-xs text-emerald-200">{note as string}</p>
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Live project health</h3>
                <p className="mt-1 text-xs text-slate-500">Click a project to record an inspection.</p>
              </div>
              <Workflow className="h-5 w-5 text-cyan-200" />
            </div>
            <div className="space-y-3">
              {[
                ['Customer portal', 78, 'On track'],
                ['Sales automation', 64, 'Needs review'],
                ['Website launch', 91, 'On track'],
              ].map(([name, progress, status]) => (
                <button
                  key={name as string}
                  type="button"
                  onClick={() => onActivity(`Reviewed ${name} project health.`)}
                  className="w-full rounded-xl border border-white/[0.07] bg-slate-950/30 p-3 text-left transition hover:border-cyan-300/20"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">{name as string}</span>
                    <span className={status === 'On track' ? 'text-emerald-200' : 'text-orange-200'}>{status as string}</span>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-slate-800">
                    <div className="h-1.5 rounded-full bg-cyan-300" style={{ width: `${progress}%` }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <h3 className="font-semibold text-white">Priority actions</h3>
            <div className="mt-4 space-y-3">
              {['Approve client proposal', 'Review automation scope', 'Confirm launch checklist'].map((task, index) => (
                <button
                  key={task}
                  type="button"
                  onClick={() => onActivity(`Completed: ${task}.`)}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/[0.07] bg-slate-950/30 p-3 text-left text-xs text-slate-300 transition hover:border-cyan-300/20"
                >
                  <span className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-orange-300' : 'bg-cyan-300'}`} />
                  <span className="flex-1">{task}</span>
                  <ChevronRight className="h-4 w-4 text-slate-600" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SalesSystemDemo({ onActivity }: { onActivity: (message: string) => void }) {
  const stages = ['New enquiry', 'AI qualified', 'Reply generated', 'Proposal ready'];
  const [step, setStep] = useState(0);

  const advance = () => {
    const next = Math.min(step + 1, stages.length - 1);
    setStep(next);
    onActivity(next === step ? 'The sample lead is already proposal-ready.' : `Lead moved to: ${stages[next]}.`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-orange-200">Lead simulation</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Horizon Fitness enquiry</h2>
          <p className="mt-2 text-sm text-slate-400">A fictional customer needs a new website and online booking system.</p>
        </div>
        <button
          type="button"
          onClick={advance}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-200"
        >
          <Sparkles className="h-4 w-4" />
          {step === 0 ? 'Run AI qualification' : step === stages.length - 1 ? 'Review proposal' : 'Continue workflow'}
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {stages.map((stage, index) => (
          <div
            key={stage}
            className={`rounded-2xl border p-4 ${
              index <= step ? 'border-orange-300/25 bg-orange-300/[0.08]' : 'border-white/10 bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                index <= step ? 'bg-orange-300 text-slate-950' : 'bg-slate-800 text-slate-500'
              }`}>
                {index < step ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              {index === step && <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-orange-200">Current</span>}
            </div>
            <p className={`mt-4 text-xs font-medium ${index <= step ? 'text-white' : 'text-slate-600'}`}>{stage}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Lead profile</h3>
            <span className="rounded-full bg-emerald-300/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-200">High fit</span>
          </div>
          <dl className="mt-5 space-y-4 text-xs">
            {[
              ['Business', 'Horizon Fitness'],
              ['Requirement', 'Website + booking'],
              ['Estimated range', '£8,000–£12,000'],
              ['Timing', '8–12 weeks'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-white/[0.07] pb-3 last:border-0">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-300">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">AI workspace</h3>
              <p className="mt-1 text-xs text-slate-500">Content unlocks as the lead advances.</p>
            </div>
            <Bot className="h-5 w-5 text-orange-200" />
          </div>

          <div className="mt-5 space-y-3">
            <div className={`rounded-xl border p-4 ${step >= 1 ? 'border-orange-300/20 bg-orange-300/[0.06]' : 'border-white/[0.07] bg-slate-950/20 opacity-45'}`}>
              <p className="text-xs font-medium text-white">Qualification summary</p>
              <p className="mt-2 text-xs leading-5 text-slate-400">Strong service fit, realistic budget and clear operational need. Recommend a discovery call.</p>
            </div>
            <div className={`rounded-xl border p-4 ${step >= 2 ? 'border-orange-300/20 bg-orange-300/[0.06]' : 'border-white/[0.07] bg-slate-950/20 opacity-45'}`}>
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4 text-orange-200" />
                <p className="text-xs font-medium text-white">Suggested reply</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-400">Thanks for your enquiry. Your website and booking requirements are a strong match for our build process...</p>
            </div>
            <div className={`rounded-xl border p-4 ${step >= 3 ? 'border-orange-300/20 bg-orange-300/[0.06]' : 'border-white/[0.07] bg-slate-950/20 opacity-45'}`}>
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-orange-200" />
                <p className="text-xs font-medium text-white">Draft proposal</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-400">Discovery, UX design, build, booking integration, testing and launch support.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerPortalDemo({ onActivity }: { onActivity: (message: string) => void }) {
  const [decision, setDecision] = useState<'pending' | 'approved' | 'changes'>('pending');
  const progress = decision === 'approved' ? 74 : 68;

  const decide = (next: 'approved' | 'changes') => {
    setDecision(next);
    onActivity(next === 'approved' ? 'Homepage design approved.' : 'Change request sent to the project team.');
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[230px_1fr]">
      <aside className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-300/10 text-violet-200">
            <UsersRound className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Aster & Co.</p>
            <p className="text-[10px] text-slate-500">Client portal</p>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {[
            [LayoutDashboard, 'Project overview'],
            [FileCheck2, 'Design review'],
            [MessageSquareText, 'Messages'],
            [CircleDollarSign, 'Payments'],
          ].map(([Icon, label], index) => {
            const NavIcon = Icon as typeof LayoutDashboard;
            return (
              <button
                key={label as string}
                type="button"
                onClick={() => onActivity(`Opened ${String(label).toLowerCase()}.`)}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs transition ${
                  index === 1 ? 'bg-violet-300 text-slate-950' : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <NavIcon className="h-4 w-4" />
                {label as string}
              </button>
            );
          })}
        </div>
      </aside>

      <div className="space-y-5">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-violet-200">Website and customer portal</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Phase 3 · Design review</h2>
            </div>
            <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-medium text-violet-200">{progress}% complete</span>
          </div>
          <div className="mt-5 h-2 rounded-full bg-slate-800">
            <div className="h-2 rounded-full bg-violet-300 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-3 flex justify-between text-[10px] text-slate-600">
            <span>Discovery</span>
            <span>Design</span>
            <span>Build</span>
            <span>Testing</span>
            <span>Launch</span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Homepage concept v2</h3>
                <p className="mt-1 text-xs text-slate-500">Ready for your decision</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                decision === 'approved'
                  ? 'bg-emerald-300/10 text-emerald-200'
                  : decision === 'changes'
                    ? 'bg-orange-300/10 text-orange-200'
                    : 'bg-violet-300/10 text-violet-200'
              }`}>
                {decision === 'approved' ? 'Approved' : decision === 'changes' ? 'Changes sent' : 'Awaiting review'}
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/40 p-3">
              <div className="rounded-xl bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="h-2 w-16 rounded-full bg-slate-900" />
                  <div className="flex gap-2">
                    <div className="h-1.5 w-8 rounded-full bg-slate-200" />
                    <div className="h-1.5 w-8 rounded-full bg-slate-200" />
                    <div className="h-1.5 w-8 rounded-full bg-slate-200" />
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-[1.1fr_0.9fr] gap-4">
                  <div>
                    <div className="h-3 w-20 rounded-full bg-violet-300" />
                    <div className="mt-3 h-5 w-full rounded bg-slate-900" />
                    <div className="mt-2 h-5 w-4/5 rounded bg-slate-900" />
                    <div className="mt-4 h-2 w-full rounded bg-slate-200" />
                    <div className="mt-2 h-2 w-3/4 rounded bg-slate-200" />
                    <div className="mt-5 h-8 w-24 rounded-lg bg-violet-500" />
                  </div>
                  <div className="h-32 rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100" />
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => decide('approved')}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-violet-200"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve design
              </button>
              <button
                type="button"
                onClick={() => decide('changes')}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                <MessageSquareText className="h-4 w-4" />
                Request changes
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
              <h3 className="font-semibold text-white">Project activity</h3>
              <div className="mt-4 space-y-4">
                {[
                  ['Today', 'Homepage v2 uploaded'],
                  ['Yesterday', 'Copy changes completed'],
                  ['22 Jul', 'Wireframes approved'],
                ].map(([date, event]) => (
                  <div key={event} className="flex gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-300" />
                    <div>
                      <p className="text-xs font-medium text-slate-300">{event}</p>
                      <p className="mt-1 text-[10px] text-slate-600">{date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onActivity('Opened the next payment summary.')}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-left transition hover:border-violet-300/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Next payment</p>
                  <p className="mt-2 text-xl font-semibold text-white">£2,400</p>
                  <p className="mt-1 text-xs text-slate-500">Due 14 August 2026</p>
                </div>
                <CircleDollarSign className="h-6 w-6 text-violet-200" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoWorkspace({ type, title, eyebrow, description }: DemoWorkspaceProps) {
  const theme = demoTheme[type];
  const Icon = theme.icon;
  const [activity, setActivity] = useState('Demo loaded. Choose an action to begin.');
  const [tourStarted, setTourStarted] = useState(false);
  const activityTime = useMemo(() => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), [activity]);

  const reset = () => {
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-[#07111f] px-6 pb-20 pt-32 text-white sm:pt-36">
      <div className="mx-auto max-w-7xl">
        <Link href="/demos" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to Demo Lab
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${theme.soft}`}>
              <Icon className="h-3.5 w-3.5" />
              {eyebrow}
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">{description}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setTourStarted(true);
                setActivity('Guided tour started. Follow the highlighted actions.');
              }}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${theme.button}`}
            >
              <Play className="h-4 w-4 fill-current" />
              {tourStarted ? 'Tour running' : 'Start guided tour'}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            >
              <RefreshCw className="h-4 w-4" />
              Reset demo
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" />
            <div>
              <p className="text-sm font-medium text-emerald-100">Simulated environment</p>
              <p className="mt-1 text-xs leading-5 text-emerald-100/60">All names, figures, messages and actions are fictional. No real account or payment data is used.</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 text-xs text-emerald-100/60">
            <Clock3 className="h-3.5 w-3.5" />
            No signup required
          </span>
        </div>

        {tourStarted && (
          <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07] p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cyan-200" />
              <div>
                <p className="text-sm font-medium text-cyan-100">Guided step</p>
                <p className="mt-1 text-xs leading-5 text-cyan-100/60">
                  {type === 'command' && 'Open a dashboard section, inspect a performance card and complete one priority action.'}
                  {type === 'sales' && 'Run AI qualification, continue the workflow and watch the sales assets unlock.'}
                  {type === 'portal' && 'Review the homepage concept, make a decision and inspect the payment summary.'}
                </p>
              </div>
            </div>
          </div>
        )}

        <section className="mt-6 rounded-[1.75rem] border border-white/10 bg-[#0a1525] p-4 shadow-2xl shadow-black/30 sm:p-6">
          <div className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-300/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/70" />
              <span className="ml-2 text-[11px] text-slate-600">demo.digital-footprint.uk</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Demo environment active
            </div>
          </div>

          {type === 'command' && <CommandCentreDemo onActivity={setActivity} />}
          {type === 'sales' && <SalesSystemDemo onActivity={setActivity} />}
          {type === 'portal' && <CustomerPortalDemo onActivity={setActivity} />}
        </section>

        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
              <Send className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-300">Latest demo activity</p>
              <p className="mt-1 text-xs text-slate-500">{activity} · {activityTime}</p>
            </div>
          </div>
          <Link href="/contact" className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-200 transition hover:text-cyan-100">
            Build something like this
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
