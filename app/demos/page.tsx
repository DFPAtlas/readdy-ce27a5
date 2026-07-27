import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileCheck2,
  Gauge,
  MessageSquareText,
  MonitorUp,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Workflow,
} from 'lucide-react';

const demos = [
  {
    number: '01',
    title: 'Business Command Centre',
    subtitle: 'Run the business from one clear workspace.',
    description:
      'Explore a realistic operations dashboard with projects, team workload, revenue signals, alerts and task progress in one place.',
    href: '/demos/business-command-centre',
    duration: '3–5 minutes',
    badge: 'Interactive dashboard',
    icon: BriefcaseBusiness,
    accent: 'cyan',
    features: ['Business performance overview', 'Projects and team workload', 'Tasks, alerts and activity'],
    preview: 'command',
  },
  {
    number: '02',
    title: 'AI Lead & Sales System',
    subtitle: 'See how an enquiry becomes a qualified opportunity.',
    description:
      'Submit a fictional lead, watch AI assess the request, generate a suggested response and move the opportunity through a sales pipeline.',
    href: '/demos/ai-lead-system',
    duration: '4–6 minutes',
    badge: 'AI powered',
    icon: Bot,
    accent: 'orange',
    features: ['AI lead qualification', 'Suggested replies and quotes', 'Visual sales pipeline'],
    preview: 'sales',
  },
  {
    number: '03',
    title: 'Customer Project Portal',
    subtitle: 'Experience a calmer way to deliver client work.',
    description:
      'Step inside a client-facing portal to review milestones, approve designs, request changes, read messages and view payment progress.',
    href: '/demos/customer-portal',
    duration: '3–5 minutes',
    badge: 'Client experience',
    icon: UsersRound,
    accent: 'violet',
    features: ['Project milestones', 'Design review and approval', 'Messages, files and payments'],
    preview: 'portal',
  },
] as const;

const accentStyles = {
  cyan: {
    badge: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-200',
    icon: 'bg-cyan-300/10 text-cyan-200 ring-cyan-300/20',
    glow: 'from-cyan-400/25 via-cyan-400/5 to-transparent',
    button: 'bg-cyan-300 text-slate-950 hover:bg-cyan-200',
  },
  orange: {
    badge: 'border-orange-300/20 bg-orange-300/10 text-orange-200',
    icon: 'bg-orange-300/10 text-orange-200 ring-orange-300/20',
    glow: 'from-orange-400/25 via-orange-400/5 to-transparent',
    button: 'bg-orange-300 text-slate-950 hover:bg-orange-200',
  },
  violet: {
    badge: 'border-violet-300/20 bg-violet-300/10 text-violet-200',
    icon: 'bg-violet-300/10 text-violet-200 ring-violet-300/20',
    glow: 'from-violet-400/25 via-violet-400/5 to-transparent',
    button: 'bg-violet-300 text-slate-950 hover:bg-violet-200',
  },
} as const;

function CommandPreview() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          ['Revenue', '£84.2k', '+12%'],
          ['Projects', '18', '14 live'],
          ['Capacity', '76%', 'Healthy'],
        ].map(([label, value, note]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[10px] text-slate-400">{label}</p>
            <p className="mt-1 text-sm font-semibold text-white">{value}</p>
            <p className="mt-1 text-[9px] text-cyan-200">{note}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[1.2fr_0.8fr] gap-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-medium text-slate-300">Project health</span>
            <Gauge className="h-3.5 w-3.5 text-cyan-200" />
          </div>
          <div className="space-y-2">
            {[78, 64, 91].map((width, index) => (
              <div key={width}>
                <div className="mb-1 flex justify-between text-[8px] text-slate-500">
                  <span>{['Client portal', 'Automation build', 'Website launch'][index]}</span>
                  <span>{width}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800">
                  <div className="h-1.5 rounded-full bg-cyan-300" style={{ width: `${width}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <p className="text-[10px] font-medium text-slate-300">Today</p>
          <div className="mt-3 space-y-2">
            {['Review proposal', 'Client approval', 'Team check-in'].map((task, index) => (
              <div key={task} className="flex items-center gap-2 text-[8px] text-slate-400">
                <span className={`h-1.5 w-1.5 rounded-full ${index === 0 ? 'bg-orange-300' : 'bg-cyan-300'}`} />
                {task}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SalesPreview() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-orange-300/15 bg-orange-300/[0.05] p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-300/10">
            <Sparkles className="h-4 w-4 text-orange-200" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-white">New website and booking enquiry</p>
            <p className="text-[8px] text-slate-400">AI qualification in progress</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-300/10 px-2 py-1 text-[8px] font-medium text-emerald-200">High fit</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {['New lead', 'Qualified', 'Proposal'].map((stage, index) => (
          <div key={stage} className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
            <p className="mb-2 text-[9px] font-medium text-slate-400">{stage}</p>
            <div className={`rounded-lg border p-2 ${index === 1 ? 'border-orange-300/30 bg-orange-300/[0.08]' : 'border-white/10 bg-slate-900/40'}`}>
              <p className="text-[8px] font-medium text-white">Horizon Fitness</p>
              <p className="mt-1 text-[7px] text-slate-500">£8k–£12k estimate</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[8px] text-slate-400">
        <MessageSquareText className="h-3.5 w-3.5 text-orange-200" />
        Suggested reply and discovery questions are ready for review.
      </div>
    </div>
  );
}

function PortalPreview() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium text-white">Your platform build</p>
          <p className="text-[8px] text-slate-500">Phase 3 of 5 · Design review</p>
        </div>
        <span className="rounded-full bg-violet-300/10 px-2 py-1 text-[8px] font-medium text-violet-200">68% complete</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-800">
        <div className="h-1.5 w-[68%] rounded-full bg-violet-300" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="mb-3 flex items-center gap-2">
            <MonitorUp className="h-3.5 w-3.5 text-violet-200" />
            <span className="text-[9px] font-medium text-slate-300">Design approval</span>
          </div>
          <div className="rounded-lg border border-white/10 bg-slate-900/70 p-2">
            <div className="mb-1.5 h-1.5 w-12 rounded-full bg-violet-300/60" />
            <div className="h-8 rounded bg-white/[0.05]" />
          </div>
        </div>
        <div className="space-y-2">
          {[
            [FileCheck2, '2 files ready'],
            [MessageSquareText, '3 new messages'],
            [CreditCard, 'Next payment 14 Aug'],
          ].map(([Icon, label]) => {
            const ItemIcon = Icon as typeof FileCheck2;
            return (
              <div key={label as string} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-[8px] text-slate-400">
                <ItemIcon className="h-3 w-3 text-violet-200" />
                {label as string}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SoftwarePreview({ type }: { type: (typeof demos)[number]['preview'] }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#07111f] p-2 shadow-2xl shadow-black/30">
      <div className="mb-2 flex items-center gap-1.5 px-1 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-red-300/70" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300/70" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/70" />
        <div className="ml-2 h-4 flex-1 rounded bg-white/[0.04]" />
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-[#0b1728] p-3">
        {type === 'command' && <CommandPreview />}
        {type === 'sales' && <SalesPreview />}
        {type === 'portal' && <PortalPreview />}
      </div>
    </div>
  );
}

export default function DemosPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#07111f] text-white">
      <section className="relative border-b border-white/[0.07] px-6 pb-20 pt-36 sm:pb-24 sm:pt-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.13),transparent_32%),radial-gradient(circle_at_82%_16%,rgba(251,146,60,0.10),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-end gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/[0.08] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" />
                DFP Demo Lab
              </div>
              <h1 className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                Experience the software before we build yours.
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                Explore three guided software environments that show how Digital Footprint turns business processes into clear, useful and intelligent systems.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#demo-software"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  Explore the demos
                  <ArrowRight className="h-4 w-4" />
                </a>
                <Link
                  href="/request-demo"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.08]"
                >
                  Request a guided walkthrough
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 backdrop-blur-sm sm:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-200 ring-1 ring-inset ring-emerald-300/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">Safe demonstration environment</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Every workspace uses simulated data. Nothing entered here affects a real customer account, project or payment record.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 text-center">
                <div>
                  <p className="text-xl font-semibold text-white">3</p>
                  <p className="mt-1 text-[11px] text-slate-500">Software demos</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-white">No</p>
                  <p className="mt-1 text-[11px] text-slate-500">Signup required</p>
                </div>
                <div>
                  <p className="text-xl font-semibold text-white">100%</p>
                  <p className="mt-1 text-[11px] text-slate-500">Simulated data</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="demo-software" className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Choose a workspace</p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Three different ways software can improve a business.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-400">
              Each demo focuses on a different part of the customer journey: internal operations, sales automation and client delivery.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {demos.map((demo) => {
              const styles = accentStyles[demo.accent];
              const Icon = demo.icon;

              return (
                <article
                  key={demo.title}
                  className="group relative flex min-h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.055] sm:p-6"
                >
                  <div className={`pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b ${styles.glow} opacity-50`} />
                  <div className="relative">
                    <div className="mb-5 flex items-center justify-between">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-inset ${styles.icon}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium tracking-[0.2em] text-slate-600">{demo.number}</span>
                    </div>

                    <SoftwarePreview type={demo.preview} />

                    <div className="mt-6">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${styles.badge}`}>
                          {demo.badge}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Clock3 className="h-3.5 w-3.5" />
                          {demo.duration}
                        </span>
                      </div>
                      <h3 className="text-2xl font-semibold tracking-tight text-white">{demo.title}</h3>
                      <p className="mt-2 text-sm font-medium text-slate-300">{demo.subtitle}</p>
                      <p className="mt-4 text-sm leading-6 text-slate-400">{demo.description}</p>
                    </div>

                    <ul className="mt-6 space-y-3 border-t border-white/10 pt-5">
                      {demo.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5 text-sm text-slate-300">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="relative mt-auto pt-7">
                    <Link
                      href={demo.href}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition ${styles.button}`}
                    >
                      <Play className="h-4 w-4 fill-current" />
                      Launch interactive demo
                    </Link>
                    <Link
                      href="/contact"
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
                    >
                      How this could work for your business
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-white/[0.07] bg-white/[0.025] px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">How to explore</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Follow the guide, or explore freely.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">
              The demos are designed for first-time visitors. Use the guided prompts to understand the workflow, then reset the environment and test it in your own order.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              [Play, 'Start the tour', 'Open a demo and follow the short guided scenario.'],
              [Workflow, 'Try the workflow', 'Click through the key actions using sample business data.'],
              [RotateCcw, 'Reset anytime', 'Return the workspace to its starting point whenever needed.'],
            ].map(([Icon, title, text]) => {
              const StepIcon = Icon as typeof Play;
              return (
                <div key={title as string} className="rounded-2xl border border-white/10 bg-[#07111f] p-5">
                  <StepIcon className="h-5 w-5 text-cyan-200" />
                  <h3 className="mt-5 font-semibold text-white">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{text as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(255,255,255,0.035)_45%,rgba(251,146,60,0.08))] p-8 sm:p-12 lg:p-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Built around your business</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Could one of these systems improve the way your business works?
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                Digital Footprint can adapt one demo, combine features from several systems, or design something completely original around your process.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Discuss your software idea
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                See our build process
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
