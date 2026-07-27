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
  Clock3,
  FileCheck2,
  Inbox,
  Mail,
  Play,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  UserRoundCheck,
  Workflow,
  Zap,
} from 'lucide-react';

type ViewKey = 'inbox' | 'qualification' | 'reply' | 'proposal' | 'pipeline' | 'automation';
type LeadStage = 'New enquiry' | 'Qualified' | 'Reply ready' | 'Proposal sent' | 'Won';
type ReplyStatus = 'locked' | 'draft' | 'approved';
type ProposalStatus = 'locked' | 'draft' | 'sent';

type Lead = {
  id: string;
  company: string;
  contact: string;
  email: string;
  requirement: string;
  source: string;
  budget: string;
  timing: string;
  score: number;
  fit: 'High' | 'Medium' | 'Low';
  summary: string;
};

type LeadState = {
  stage: LeadStage;
  qualified: boolean;
  reply: ReplyStatus;
  proposal: ProposalStatus;
};

const leads: Lead[] = [
  {
    id: 'horizon',
    company: 'Horizon Fitness',
    contact: 'Emily Carter',
    email: 'emily@horizon-fitness.example',
    requirement: 'New website and online class-booking system',
    source: 'Website enquiry',
    budget: '£8,000–£12,000',
    timing: '8–12 weeks',
    score: 91,
    fit: 'High',
    summary: 'A growing fitness business needs to replace manual booking and improve lead conversion across three locations.',
  },
  {
    id: 'northline',
    company: 'Northline Group',
    contact: 'James Cole',
    email: 'james@northline.example',
    requirement: 'Customer portal and document workflow',
    source: 'Referral',
    budget: '£15,000–£22,000',
    timing: '12–16 weeks',
    score: 86,
    fit: 'High',
    summary: 'A professional-services group wants one secure place for clients to review documents, messages and project milestones.',
  },
  {
    id: 'oakstone',
    company: 'Oak & Stone',
    contact: 'Sarah Malik',
    email: 'sarah@oak-stone.example',
    requirement: 'Booking and quotation automation',
    source: 'LinkedIn campaign',
    budget: '£5,000–£8,000',
    timing: '6–10 weeks',
    score: 73,
    fit: 'Medium',
    summary: 'A home-services company wants to reduce telephone administration and automate quotation follow-up.',
  },
  {
    id: 'brightpath',
    company: 'BrightPath Learning',
    contact: 'Alex Wong',
    email: 'alex@brightpath.example',
    requirement: 'Learning dashboard proof of concept',
    source: 'Demo request',
    budget: '£3,000–£5,000',
    timing: '4–6 weeks',
    score: 58,
    fit: 'Low',
    summary: 'An early-stage education business is testing demand and needs a tightly scoped prototype before committing to a larger platform.',
  },
];

const initialLeadStates: Record<string, LeadState> = {
  horizon: { stage: 'New enquiry', qualified: false, reply: 'locked', proposal: 'locked' },
  northline: { stage: 'Qualified', qualified: true, reply: 'draft', proposal: 'locked' },
  oakstone: { stage: 'Reply ready', qualified: true, reply: 'approved', proposal: 'draft' },
  brightpath: { stage: 'New enquiry', qualified: false, reply: 'locked', proposal: 'locked' },
};

const viewConfig: Record<ViewKey, { label: string; heading: string; description: string; icon: typeof Inbox }> = {
  inbox: { label: 'Lead inbox', heading: 'Incoming opportunities', description: 'Review fictional enquiries, lead sources, requirements and current sales stages.', icon: Inbox },
  qualification: { label: 'AI qualification', heading: 'Qualification workspace', description: 'Run a simulated AI assessment across fit, budget, timing and delivery complexity.', icon: UserRoundCheck },
  reply: { label: 'Suggested reply', heading: 'AI-assisted response', description: 'Generate, review and approve a personalised first response using the lead context.', icon: Mail },
  proposal: { label: 'Proposal builder', heading: 'Proposal workspace', description: 'Turn the qualified requirement into a structured scope, delivery plan and price range.', icon: FileCheck2 },
  pipeline: { label: 'Sales pipeline', heading: 'Opportunity pipeline', description: 'Move opportunities between stages and see the forecast update immediately.', icon: Target },
  automation: { label: 'Automation log', heading: 'Automation timeline', description: 'Inspect the simulated triggers, AI actions, notifications and sales hand-offs.', icon: Zap },
};

const stages: LeadStage[] = ['New enquiry', 'Qualified', 'Reply ready', 'Proposal sent', 'Won'];

const tourSteps: Array<{ view: ViewKey; title: string; instruction: string }> = [
  { view: 'inbox', title: 'Choose the new enquiry', instruction: 'Select Horizon Fitness from the lead inbox.' },
  { view: 'qualification', title: 'Run AI qualification', instruction: 'Assess the opportunity and review the generated score.' },
  { view: 'reply', title: 'Prepare the response', instruction: 'Generate and approve the suggested reply.' },
  { view: 'proposal', title: 'Build the proposal', instruction: 'Create the sample scope and send the simulated proposal.' },
  { view: 'pipeline', title: 'Review the pipeline', instruction: 'Confirm where the opportunity sits and inspect the forecast.' },
  { view: 'automation', title: 'Inspect the automation', instruction: 'Review the actions recorded across the sales journey.' },
];

function FitPill({ fit }: { fit: Lead['fit'] }) {
  const classes = fit === 'High' ? 'bg-emerald-300/10 text-emerald-200' : fit === 'Medium' ? 'bg-orange-300/10 text-orange-200' : 'bg-white/[0.05] text-slate-400';
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.11em] ${classes}`}>{fit} fit</span>;
}

function StagePill({ stage }: { stage: LeadStage }) {
  const classes = stage === 'Won' ? 'bg-emerald-300/10 text-emerald-200' : stage === 'New enquiry' ? 'bg-white/[0.05] text-slate-400' : 'bg-orange-300/10 text-orange-200';
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.11em] ${classes}`}>{stage}</span>;
}

function LeadInbox({ selectedId, states, onSelect, onActivity }: { selectedId: string; states: Record<string, LeadState>; onSelect: (id: string) => void; onActivity: (message: string) => void }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-center justify-between">
          <div><h3 className="font-semibold text-white">Lead inbox</h3><p className="mt-1 text-xs text-slate-500">Four fictional opportunities are ready for review.</p></div>
          <Inbox className="h-5 w-5 text-orange-200" />
        </div>
        <div className="mt-5 space-y-3">
          {leads.map((lead) => (
            <button
              key={lead.id}
              type="button"
              onClick={() => {
                onSelect(lead.id);
                onActivity(`Selected ${lead.company} from the lead inbox.`);
              }}
              className={`w-full rounded-xl border p-4 text-left transition ${selectedId === lead.id ? 'border-orange-300/30 bg-orange-300/[0.07]' : 'border-white/[0.07] bg-slate-950/30 hover:border-orange-300/15'}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-sm font-medium text-white">{lead.company}</p><p className="mt-1 text-xs text-slate-500">{lead.contact} · {lead.source}</p></div>
                <StagePill stage={states[lead.id].stage} />
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-400">{lead.requirement}</p>
            </button>
          ))}
        </div>
      </div>

      <LeadProfile lead={leads.find((lead) => lead.id === selectedId) ?? leads[0]} state={states[selectedId]} onActivity={onActivity} />
    </div>
  );
}

function LeadProfile({ lead, state, onActivity }: { lead: Lead; state: LeadState; onActivity: (message: string) => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-200">Selected opportunity</p><h3 className="mt-2 text-xl font-semibold text-white">{lead.company}</h3><p className="mt-1 text-xs text-slate-500">{lead.contact}</p></div>
        <FitPill fit={lead.fit} />
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-400">{lead.summary}</p>
      <dl className="mt-5 space-y-3 text-xs">
        {[
          ['Email', lead.email], ['Requirement', lead.requirement], ['Budget', lead.budget], ['Timing', lead.timing], ['Stage', state.stage],
        ].map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-4 border-b border-white/[0.07] pb-3 last:border-0">
            <dt className="text-slate-500">{label}</dt><dd className="max-w-[65%] text-right font-medium text-slate-300">{value}</dd>
          </div>
        ))}
      </dl>
      <button type="button" onClick={() => onActivity(`Opened the full contact record for ${lead.contact}.`)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-orange-300/20 bg-orange-300/[0.07] px-4 py-3 text-sm font-semibold text-orange-100 transition hover:bg-orange-300/[0.12]">
        Open contact record <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function QualificationView({ lead, state, onQualify, onActivity }: { lead: Lead; state: LeadState; onQualify: () => void; onActivity: (message: string) => void }) {
  const factors = [
    ['Service fit', lead.fit === 'High' ? 94 : lead.fit === 'Medium' ? 76 : 58],
    ['Budget confidence', lead.score - 4],
    ['Timing confidence', lead.score - 8],
    ['Delivery clarity', lead.score - 2],
  ] as Array<[string, number]>;

  return (
    <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <LeadProfile lead={lead} state={state} onActivity={onActivity} />
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h3 className="font-semibold text-white">AI qualification assessment</h3><p className="mt-1 text-xs text-slate-500">The score is generated from simulated enquiry data.</p></div>
          <button type="button" onClick={onQualify} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-300 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-orange-200">
            <Sparkles className="h-4 w-4" />{state.qualified ? 'Run assessment again' : 'Run AI assessment'}
          </button>
        </div>

        {state.qualified ? (
          <div className="mt-6 space-y-5">
            <div className="flex flex-col gap-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-xs font-medium text-emerald-100">Qualification result</p><p className="mt-2 text-sm text-slate-300">Strong fit. Recommend a discovery call and tailored proposal.</p></div>
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-8 border-emerald-300/20 bg-slate-950/30 text-2xl font-semibold text-emerald-200">{lead.score}</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {factors.map(([label, value]) => (
                <button key={label} type="button" onClick={() => onActivity(`Inspected qualification factor: ${label}.`)} className="rounded-xl border border-white/[0.07] bg-slate-950/30 p-4 text-left">
                  <div className="flex items-center justify-between text-xs"><span className="text-slate-400">{label}</span><span className="font-semibold text-white">{value}%</span></div>
                  <div className="mt-3 h-1.5 rounded-full bg-slate-800"><div className="h-1.5 rounded-full bg-orange-300" style={{ width: `${value}%` }} /></div>
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-orange-300/15 bg-orange-300/[0.05] p-4"><p className="text-xs font-medium text-white">AI summary</p><p className="mt-2 text-xs leading-5 text-slate-400">{lead.summary} The stated budget and timing are credible for a structured discovery and phased build.</p></div>
          </div>
        ) : (
          <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/20 p-8 text-center">
            <Bot className="h-9 w-9 text-slate-700" /><h4 className="mt-4 font-medium text-slate-300">Assessment not started</h4><p className="mt-2 max-w-sm text-xs leading-5 text-slate-600">Run the simulated AI assessment to score fit, budget, timing and delivery clarity.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReplyView({ lead, state, onGenerate, onApprove, onActivity }: { lead: Lead; state: LeadState; onGenerate: () => void; onApprove: () => void; onActivity: (message: string) => void }) {
  const unlocked = state.qualified;
  return (
    <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
      <div className="space-y-4">
        <LeadProfile lead={lead} state={state} onActivity={onActivity} />
        <div className={`rounded-2xl border p-5 ${unlocked ? 'border-orange-300/20 bg-orange-300/[0.06]' : 'border-white/10 bg-white/[0.035]'}`}>
          <p className="text-xs font-medium text-white">Reply status</p>
          <p className="mt-2 text-sm text-slate-400">{!unlocked ? 'Qualification is required first.' : state.reply === 'locked' ? 'Ready to generate.' : state.reply === 'draft' ? 'Draft awaiting approval.' : 'Approved and ready to send.'}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h3 className="font-semibold text-white">Suggested first response</h3><p className="mt-1 text-xs text-slate-500">Generated from the selected lead record.</p></div>
          <button type="button" disabled={!unlocked} onClick={onGenerate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-300 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-40">
            <Sparkles className="h-4 w-4" />{state.reply === 'locked' ? 'Generate reply' : 'Regenerate reply'}
          </button>
        </div>

        {state.reply === 'locked' ? (
          <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/20 p-8 text-center"><Mail className="h-9 w-9 text-slate-700" /><p className="mt-4 text-sm text-slate-500">{unlocked ? 'Generate a suggested reply to continue.' : 'Complete AI qualification to unlock this workspace.'}</p></div>
        ) : (
          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-slate-950/30 p-5">
            <div className="border-b border-white/[0.07] pb-4 text-xs"><p className="text-slate-500">To</p><p className="mt-1 font-medium text-slate-300">{lead.contact} · {lead.email}</p><p className="mt-3 text-slate-500">Subject</p><p className="mt-1 font-medium text-slate-300">Your {lead.requirement.toLowerCase()} enquiry</p></div>
            <div className="mt-5 space-y-4 text-sm leading-6 text-slate-400"><p>Hi {lead.contact.split(' ')[0]},</p><p>Thank you for contacting Digital Footprint. Your requirement for {lead.requirement.toLowerCase()} is a strong match for the systems we build.</p><p>Based on the information provided, we recommend a focused discovery session followed by a phased proposal covering planning, UX, development, testing and launch support.</p><p>Your current budget range of {lead.budget} and target timing of {lead.timing} look realistic for the scope described.</p><p>Kind regards,<br />Digital Footprint</p></div>
          </div>
        )}

        {state.reply !== 'locked' && (
          <button type="button" onClick={onApprove} className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${state.reply === 'approved' ? 'bg-emerald-300 text-slate-950' : 'bg-orange-300 text-slate-950 hover:bg-orange-200'}`}>
            {state.reply === 'approved' ? <Check className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}{state.reply === 'approved' ? 'Reply approved' : 'Approve suggested reply'}
          </button>
        )}
      </div>
    </div>
  );
}

function ProposalView({ lead, state, onBuild, onSend, onActivity }: { lead: Lead; state: LeadState; onBuild: () => void; onSend: () => void; onActivity: (message: string) => void }) {
  const unlocked = state.reply === 'approved';
  const scope = ['Discovery and requirements mapping', 'UX and interface design', 'Platform development', 'Integrations and automation', 'Testing, training and launch'];
  return (
    <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <h3 className="font-semibold text-white">Proposal controls</h3><p className="mt-1 text-xs text-slate-500">Build a simulated commercial proposal from the approved reply.</p>
        <dl className="mt-5 space-y-3 text-xs">
          {[['Client', lead.company], ['Indicative range', lead.budget], ['Delivery window', lead.timing], ['Current stage', state.stage]].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-white/[0.07] pb-3 last:border-0"><dt className="text-slate-500">{label}</dt><dd className="font-medium text-slate-300">{value}</dd></div>)}
        </dl>
        <button type="button" disabled={!unlocked} onClick={onBuild} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-40"><FileCheck2 className="h-4 w-4" />{state.proposal === 'locked' ? 'Build proposal' : 'Rebuild proposal'}</button>
        {!unlocked && <p className="mt-3 text-center text-[10px] text-slate-600">Approve the suggested reply first.</p>}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-center justify-between"><div><h3 className="font-semibold text-white">Proposal preview</h3><p className="mt-1 text-xs text-slate-500">A concise simulated scope and commercial outline.</p></div><BriefcaseBusiness className="h-5 w-5 text-orange-200" /></div>
        {state.proposal === 'locked' ? (
          <div className="mt-6 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/20 p-8 text-center"><FileCheck2 className="h-9 w-9 text-slate-700" /><p className="mt-4 text-sm text-slate-500">Build the proposal to unlock the preview.</p></div>
        ) : (
          <div className="mt-6 rounded-2xl border border-white/[0.08] bg-slate-950/30 p-5">
            <div className="flex flex-col gap-4 border-b border-white/[0.07] pb-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-200">Digital Footprint proposal</p><h4 className="mt-2 text-xl font-semibold text-white">{lead.company}</h4><p className="mt-1 text-xs text-slate-500">{lead.requirement}</p></div><div className="text-left sm:text-right"><p className="text-xs text-slate-500">Indicative investment</p><p className="mt-1 text-lg font-semibold text-white">{lead.budget}</p></div></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">{scope.map((item, index) => <button key={item} type="button" onClick={() => onActivity(`Reviewed proposal item: ${item}.`)} className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-left"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-orange-300/10 text-[10px] font-semibold text-orange-200">{index + 1}</span><span className="text-xs leading-5 text-slate-300">{item}</span></button>)}</div>
            <div className="mt-5 rounded-xl border border-orange-300/15 bg-orange-300/[0.05] p-4"><p className="text-xs font-medium text-white">Recommended next step</p><p className="mt-2 text-xs leading-5 text-slate-400">A 60-minute discovery workshop to confirm workflows, integrations, priorities and final delivery pricing.</p></div>
          </div>
        )}
        {state.proposal !== 'locked' && <button type="button" onClick={onSend} className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${state.proposal === 'sent' ? 'bg-emerald-300 text-slate-950' : 'bg-orange-300 text-slate-950 hover:bg-orange-200'}`}><Send className="h-4 w-4" />{state.proposal === 'sent' ? 'Proposal sent' : 'Send simulated proposal'}</button>}
      </div>
    </div>
  );
}

function PipelineView({ selectedId, states, onMove, onSelect, onActivity }: { selectedId: string; states: Record<string, LeadState>; onMove: (stage: LeadStage) => void; onSelect: (id: string) => void; onActivity: (message: string) => void }) {
  const forecast = Object.entries(states).reduce((total, [id, state]) => {
    const lead = leads.find((item) => item.id === id);
    if (!lead || state.stage === 'New enquiry') return total;
    const midpoint = lead.id === 'horizon' ? 10000 : lead.id === 'northline' ? 18500 : lead.id === 'oakstone' ? 6500 : 4000;
    const probability = state.stage === 'Qualified' ? 0.35 : state.stage === 'Reply ready' ? 0.55 : state.stage === 'Proposal sent' ? 0.75 : 1;
    return total + midpoint * probability;
  }, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><p className="text-xs text-slate-500">Open opportunities</p><p className="mt-3 text-2xl font-semibold text-white">{leads.length}</p><p className="mt-1 text-xs text-emerald-200">All simulated</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><p className="text-xs text-slate-500">Weighted forecast</p><p className="mt-3 text-2xl font-semibold text-white">£{Math.round(forecast).toLocaleString('en-GB')}</p><p className="mt-1 text-xs text-emerald-200">Current pipeline</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><p className="text-xs text-slate-500">Selected opportunity</p><p className="mt-3 text-lg font-semibold text-white">{leads.find((lead) => lead.id === selectedId)?.company}</p><p className="mt-1 text-xs text-orange-200">{states[selectedId].stage}</p></div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <div className="grid min-w-[920px] grid-cols-5 gap-3">
          {stages.map((stage) => (
            <div key={stage} className="rounded-xl border border-white/[0.07] bg-slate-950/25 p-3">
              <div className="mb-3 flex items-center justify-between"><p className="text-xs font-medium text-slate-300">{stage}</p><span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-slate-500">{leads.filter((lead) => states[lead.id].stage === stage).length}</span></div>
              <div className="space-y-2">
                {leads.filter((lead) => states[lead.id].stage === stage).map((lead) => (
                  <button key={lead.id} type="button" onClick={() => { onSelect(lead.id); onActivity(`Selected ${lead.company} in the pipeline.`); }} className={`w-full rounded-lg border p-3 text-left transition ${selectedId === lead.id ? 'border-orange-300/30 bg-orange-300/[0.07]' : 'border-white/[0.06] bg-white/[0.025] hover:border-orange-300/15'}`}><p className="text-xs font-medium text-white">{lead.company}</p><p className="mt-1 text-[10px] text-slate-600">{lead.budget}</p></button>
                ))}
                {leads.every((lead) => states[lead.id].stage !== stage) && <div className="rounded-lg border border-dashed border-white/[0.06] p-4 text-center text-[10px] text-slate-700">No opportunities</div>}
              </div>
              <button type="button" onClick={() => onMove(stage)} className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg border border-white/[0.07] px-2 py-2 text-[10px] font-medium text-slate-500 transition hover:border-orange-300/20 hover:text-orange-200">Move selected here <ArrowRight className="h-3 w-3" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AutomationView({ lead, state, onActivity }: { lead: Lead; state: LeadState; onActivity: (message: string) => void }) {
  const events = [
    { title: 'Enquiry captured', detail: `${lead.source} created the lead record`, complete: true, icon: Inbox },
    { title: 'AI qualification completed', detail: `Opportunity scored ${lead.score}/100`, complete: state.qualified, icon: Bot },
    { title: 'Suggested reply generated', detail: 'Personalised response created from the lead context', complete: state.reply !== 'locked', icon: Mail },
    { title: 'Reply approved', detail: 'Sales response approved for sending', complete: state.reply === 'approved', icon: UserRoundCheck },
    { title: 'Proposal generated', detail: `Scope and ${lead.budget} range prepared`, complete: state.proposal !== 'locked', icon: FileCheck2 },
    { title: 'Proposal sent', detail: 'Opportunity moved to proposal stage', complete: state.proposal === 'sent', icon: Send },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-center justify-between"><div><h3 className="font-semibold text-white">Automation timeline</h3><p className="mt-1 text-xs text-slate-500">Events update as you complete the simulated journey.</p></div><Zap className="h-5 w-5 text-orange-200" /></div>
        <div className="mt-6 space-y-4">
          {events.map(({ title, detail, complete, icon: Icon }, index) => (
            <button key={title} type="button" onClick={() => onActivity(`Inspected automation event: ${title}.`)} className="flex w-full gap-4 rounded-xl border border-white/[0.07] bg-slate-950/30 p-4 text-left">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${complete ? 'bg-emerald-300/10 text-emerald-200' : 'bg-white/[0.04] text-slate-700'}`}>{complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}</div>
              <div className="flex-1"><div className="flex items-center justify-between gap-3"><p className={`text-sm font-medium ${complete ? 'text-white' : 'text-slate-600'}`}>{title}</p><span className="text-[10px] text-slate-700">Step {index + 1}</span></div><p className="mt-1 text-xs leading-5 text-slate-600">{detail}</p></div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-orange-300/20 bg-orange-300/[0.06] p-5"><div className="flex items-center gap-3"><Workflow className="h-5 w-5 text-orange-200" /><div><h3 className="font-semibold text-white">Workflow status</h3><p className="mt-1 text-xs text-slate-400">{events.filter((event) => event.complete).length} of {events.length} actions complete</p></div></div><div className="mt-4 h-2 rounded-full bg-slate-900/40"><div className="h-2 rounded-full bg-orange-300" style={{ width: `${(events.filter((event) => event.complete).length / events.length) * 100}%` }} /></div></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><h3 className="font-semibold text-white">Connected actions</h3><div className="mt-4 space-y-3">{['Create CRM record', 'Notify sales owner', 'Generate follow-up task', 'Update pipeline forecast'].map((item) => <button key={item} type="button" onClick={() => onActivity(`Reviewed connected action: ${item}.`)} className="flex w-full items-center gap-3 rounded-xl border border-white/[0.07] bg-slate-950/30 p-3 text-left"><span className="h-2 w-2 rounded-full bg-orange-300" /><span className="flex-1 text-xs text-slate-300">{item}</span><ChevronRight className="h-4 w-4 text-slate-600" /></button>)}</div></div>
      </div>
    </div>
  );
}

export default function AILeadSalesWorkspace() {
  const [view, setView] = useState<ViewKey>('inbox');
  const [selectedId, setSelectedId] = useState('horizon');
  const [leadStates, setLeadStates] = useState<Record<string, LeadState>>(initialLeadStates);
  const [activity, setActivity] = useState('AI sales workspace loaded. Choose a lead to begin.');
  const [tourStarted, setTourStarted] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const activityTime = useMemo(() => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), [activity]);
  const selectedLead = leads.find((lead) => lead.id === selectedId) ?? leads[0];
  const selectedState = leadStates[selectedId];
  const currentView = viewConfig[view];
  const currentTour = tourSteps[tourStep];

  const updateSelected = (patch: Partial<LeadState>) => {
    setLeadStates((current) => ({ ...current, [selectedId]: { ...current[selectedId], ...patch } }));
  };

  const selectView = (next: ViewKey) => {
    setView(next);
    setActivity(`Opened ${viewConfig[next].label.toLowerCase()}.`);
  };

  const qualify = () => {
    updateSelected({ qualified: true, stage: 'Qualified' });
    setActivity(`${selectedLead.company} qualified with a score of ${selectedLead.score}/100.`);
  };

  const generateReply = () => {
    if (!selectedState.qualified) return;
    updateSelected({ reply: 'draft' });
    setActivity(`Generated a suggested reply for ${selectedLead.contact}.`);
  };

  const approveReply = () => {
    updateSelected({ reply: 'approved', stage: 'Reply ready' });
    setActivity(`Approved the suggested reply for ${selectedLead.company}.`);
  };

  const buildProposal = () => {
    if (selectedState.reply !== 'approved') return;
    updateSelected({ proposal: 'draft' });
    setActivity(`Built a simulated proposal for ${selectedLead.company}.`);
  };

  const sendProposal = () => {
    updateSelected({ proposal: 'sent', stage: 'Proposal sent' });
    setActivity(`Sent the simulated proposal to ${selectedLead.contact}.`);
  };

  const moveStage = (stage: LeadStage) => {
    updateSelected({ stage });
    setActivity(`Moved ${selectedLead.company} to ${stage}.`);
  };

  const startTour = () => {
    setTourStarted(true);
    setTourStep(0);
    setSelectedId('horizon');
    setView(tourSteps[0].view);
    setActivity('Guided AI sales tour started.');
  };

  const nextTourStep = () => {
    const next = Math.min(tourStep + 1, tourSteps.length - 1);
    setTourStep(next);
    setView(tourSteps[next].view);
    setActivity(next === tourStep ? 'Guided tour complete.' : `Guided tour moved to ${tourSteps[next].title.toLowerCase()}.`);
  };

  const reset = () => {
    setView('inbox');
    setSelectedId('horizon');
    setLeadStates(initialLeadStates);
    setActivity('AI sales workspace reset to the starting view.');
    setTourStarted(false);
    setTourStep(0);
  };

  return (
    <main className="min-h-screen bg-[#07111f] px-6 pb-20 pt-32 text-white sm:pt-36">
      <div className="mx-auto max-w-7xl">
        <Link href="/demos" className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"><ArrowLeft className="h-4 w-4" />Back to Demo Lab</Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div><div className="inline-flex items-center gap-2 rounded-full border border-orange-300/20 bg-orange-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-orange-200"><Bot className="h-3.5 w-3.5" />AI powered workflow</div><h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl">AI Lead & Sales System</h1><p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">Move fictional enquiries through qualification, response generation, proposal creation, pipeline forecasting and automated follow-up.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={startTour} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-200"><Play className="h-4 w-4 fill-current" />{tourStarted ? 'Restart guided tour' : 'Start guided tour'}</button><button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"><RefreshCw className="h-4 w-4" />Reset demo</button></div>
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" /><div><p className="text-sm font-medium text-emerald-100">Simulated environment</p><p className="mt-1 text-xs leading-5 text-emerald-100/60">All businesses, contacts, email addresses, prices, messages and sales actions are fictional. Nothing is sent externally.</p></div></div><span className="inline-flex items-center gap-2 text-xs text-emerald-100/60"><Clock3 className="h-3.5 w-3.5" />No signup required</span></div>

        {tourStarted && <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-orange-300/20 bg-orange-300/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-orange-200" /><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-200">Step {tourStep + 1} of {tourSteps.length}</p><p className="mt-1 text-sm font-medium text-orange-100">{currentTour.title}</p><p className="mt-1 text-xs leading-5 text-orange-100/60">{currentTour.instruction}</p></div></div><button type="button" onClick={nextTourStep} className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-300/20 bg-orange-300/10 px-4 py-2.5 text-xs font-semibold text-orange-100 transition hover:bg-orange-300/15">{tourStep === tourSteps.length - 1 ? 'Finish tour' : 'Next section'}<ArrowRight className="h-3.5 w-3.5" /></button></div>}

        <section className="mt-6 rounded-[1.75rem] border border-white/10 bg-[#0a1525] p-4 shadow-2xl shadow-black/30 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-300/70" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-300/70" /><span className="ml-2 text-[11px] text-slate-600">sales-demo.digital-footprint.uk</span></div><div className="flex items-center gap-2 text-xs text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-300" />Demo environment active</div></div>

          <div className="grid gap-5 xl:grid-cols-[220px_1fr]">
            <aside className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"><div className="mb-4 flex items-center gap-2 px-2 py-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-300/10 text-orange-200"><Bot className="h-4 w-4" /></div><div><p className="text-xs font-semibold text-white">DFP Sales AI</p><p className="text-[10px] text-slate-500">CRM workspace</p></div></div><nav className="space-y-1">{(Object.entries(viewConfig) as Array<[ViewKey, (typeof viewConfig)[ViewKey]]>).map(([key, config]) => { const Icon = config.icon; return <button key={key} type="button" onClick={() => selectView(key)} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium transition ${view === key ? 'bg-orange-300 text-slate-950' : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'}`}><Icon className="h-4 w-4" />{config.label}</button>; })}</nav><div className="mt-5 rounded-xl border border-white/[0.07] bg-slate-950/30 p-3"><p className="text-[10px] uppercase tracking-[0.12em] text-slate-600">Selected lead</p><p className="mt-2 text-xs font-medium text-white">{selectedLead.company}</p><p className="mt-1 text-[10px] text-orange-200">{selectedState.stage}</p></div></aside>

            <div className="space-y-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-medium uppercase tracking-[0.16em] text-orange-200">{currentView.label}</p><h2 className="mt-2 text-2xl font-semibold text-white">{currentView.heading}</h2><p className="mt-2 max-w-2xl text-sm text-slate-400">{currentView.description}</p></div><span className="inline-flex items-center gap-2 self-start rounded-full border border-orange-300/20 bg-orange-300/10 px-3 py-1.5 text-xs font-medium text-orange-200"><Target className="h-3.5 w-3.5" />{selectedLead.company}</span></div>
              {view === 'inbox' && <LeadInbox selectedId={selectedId} states={leadStates} onSelect={setSelectedId} onActivity={setActivity} />}
              {view === 'qualification' && <QualificationView lead={selectedLead} state={selectedState} onQualify={qualify} onActivity={setActivity} />}
              {view === 'reply' && <ReplyView lead={selectedLead} state={selectedState} onGenerate={generateReply} onApprove={approveReply} onActivity={setActivity} />}
              {view === 'proposal' && <ProposalView lead={selectedLead} state={selectedState} onBuild={buildProposal} onSend={sendProposal} onActivity={setActivity} />}
              {view === 'pipeline' && <PipelineView selectedId={selectedId} states={leadStates} onMove={moveStage} onSelect={setSelectedId} onActivity={setActivity} />}
              {view === 'automation' && <AutomationView lead={selectedLead} state={selectedState} onActivity={setActivity} />}
            </div>
          </div>
        </section>

        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]"><Send className="h-3.5 w-3.5 text-slate-400" /></div><div><p className="text-xs font-medium text-slate-300">Latest demo activity</p><p className="mt-1 text-xs text-slate-500">{activity} · {activityTime}</p></div></div><Link href="/contact" className="inline-flex items-center gap-2 text-xs font-semibold text-orange-200 transition hover:text-orange-100">Build something like this<ArrowRight className="h-3.5 w-3.5" /></Link></div>
      </div>
    </main>
  );
}
