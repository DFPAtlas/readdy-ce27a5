'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Thermometer, ArrowLeft, Plus, CheckCircle2, AlertTriangle,
  Clock, TrendingUp, BarChart3, Shield, Globe, Server,
  Pause, Play, ChevronRight, X,
} from 'lucide-react';

const STAGE_LABELS: Record<number, string> = {
  0: 'Internal Test',
  1: 'Very Small Engaged',
  2: 'Controlled Increase',
  3: 'Moderate Volume',
  4: 'Target Operating',
  5: 'Normal Monitored',
};

const MOCK_PLANS = [
  {
    id: 'wp-1', name: 'Marketing IP Warm-up Q3', asset_type: 'ip', asset: '192.168.1.100',
    provider: 'Resend', brand: 'Digital Footprint', owner: 'Sarah Chen',
    status: 'active', start_date: '2026-07-10', target_volume: 2000,
    current_stage: 2, total_stages: 5,
    daily_cap: 500, hourly_cap: 100, current_daily_count: 342,
    stages: [
      { stage: 0, label: 'Internal Test', daily_cap: 50, observation_days: 2, completed: true, completed_at: '2026-07-07', status: 'completed' },
      { stage: 1, label: 'Very Small Engaged', daily_cap: 100, observation_days: 3, completed: true, completed_at: '2026-07-11', status: 'completed' },
      { stage: 2, label: 'Controlled Increase', daily_cap: 500, observation_days: 5, completed: false, started_at: '2026-07-12', status: 'active' },
      { stage: 3, label: 'Moderate Volume', daily_cap: 1000, observation_days: 5, completed: false, status: 'pending' },
      { stage: 4, label: 'Target Operating', daily_cap: 2000, observation_days: 7, completed: false, status: 'pending' },
    ],
    pause_thresholds: { bounce_rate: 3, complaint_rate: 0.2, deferral_spike: 50 },
    guardrails: ['complaint_rate', 'bounce_rate', 'provider_rejection'],
    audience_sources: ['Recent signups 30d', 'Active customers 60d', 'Verified interactions'],
    email_categories: ['marketing', 'newsletter'],
  },
  {
    id: 'wp-2', name: 'Synqoro Domain Warm-up', asset_type: 'domain', asset: 'dfp-synqoro.co.uk',
    provider: 'Resend', brand: 'Synqoro', owner: 'Marcus Webb',
    status: 'paused', start_date: '2026-07-05', target_volume: 800,
    current_stage: 1, total_stages: 4,
    daily_cap: 100, hourly_cap: 25, current_daily_count: 78,
    stages: [
      { stage: 0, label: 'Internal Test', daily_cap: 20, observation_days: 2, completed: true, completed_at: '2026-07-05', status: 'completed' },
      { stage: 1, label: 'Very Small Engaged', daily_cap: 100, observation_days: 5, completed: false, started_at: '2026-07-07', status: 'paused' },
      { stage: 2, label: 'Controlled Increase', daily_cap: 300, observation_days: 5, completed: false, status: 'pending' },
      { stage: 3, label: 'Target Operating', daily_cap: 800, observation_days: 7, completed: false, status: 'pending' },
    ],
    pause_thresholds: { bounce_rate: 5, complaint_rate: 0.3, deferral_spike: 100 },
    guardrails: ['complaint_rate', 'bounce_rate'],
    audience_sources: ['Synqoro trial users', 'Synqoro active accounts'],
    email_categories: ['product', 'support'],
  },
];

export default function WarmUpPage() {
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<string | null>('wp-1');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/email/reputation" className="w-8 h-8 flex items-center justify-center rounded-lg border border-[rgba(255,255,255,0.08)] text-slate-400 hover:text-white hover:border-[rgba(255,255,255,0.15)] transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Warm-up Plans</h1>
            <p className="text-xs text-slate-400 mt-0.5">Guided domain and IP warm-up with stage-based volume control</p>
          </div>
        </div>
        <button
          onClick={() => setShowNewPlan(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] text-white rounded-xl font-semibold text-sm hover:bg-[#0891B2] transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> New Plan
        </button>
      </div>

      {showNewPlan && (
        <div className="bg-[#121215] border border-[#06B6D4]/20 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Create Warm-up Plan</h2>
            <button onClick={() => setShowNewPlan(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-6">
            Warm-up is required before sending significant volume from new or long-idle domains and IPs. Plans must be reviewed and approved before activation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Plan Name</label>
              <input type="text" placeholder="e.g. Q3 IP Warm-up" className="w-full px-3 py-2 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Asset Type</label>
              <select className="w-full px-3 py-2 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-lg text-sm text-white focus:outline-none cursor-pointer pr-8">
                <option value="">Select type</option>
                <option value="domain">Domain</option>
                <option value="ip">Dedicated IP</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Asset</label>
              <select className="w-full px-3 py-2 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-lg text-sm text-white focus:outline-none cursor-pointer pr-8">
                <option value="">Select asset</option>
                <option value="digital-footprint.uk">digital-footprint.uk</option>
                <option value="dfp-synqoro.co.uk">dfp-synqoro.co.uk</option>
                <option value="192.168.1.100">192.168.1.100 (IP)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Target Daily Volume</label>
              <input type="number" placeholder="e.g. 2000" className="w-full px-3 py-2 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Start Date</label>
              <input type="date" className="w-full px-3 py-2 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Warm-up Owner</label>
              <input type="text" placeholder="e.g. Sarah Chen" className="w-full px-3 py-2 bg-white/[0.04] border border-[rgba(255,255,255,0.06)] rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20" />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button className="px-4 py-2 rounded-lg text-sm font-medium bg-white/[0.04] border border-[rgba(255,255,255,0.08)] text-slate-400 cursor-pointer whitespace-nowrap">
              Save Draft
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium bg-[#06B6D4] text-white cursor-pointer whitespace-nowrap">
              Create Plan
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {MOCK_PLANS.map((plan) => {
          const isExpanded = expandedPlan === plan.id;
          const activeStage = plan.stages.find((s) => s.stage === plan.current_stage);
          return (
            <div key={plan.id} className="bg-[#121215] border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                className="w-full text-left p-6 hover:bg-white/[0.01] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.asset_type === 'ip' ? 'bg-violet-400/10' : 'bg-sky-400/10'}`}>
                      {plan.asset_type === 'ip' ? <Server className="w-5 h-5 text-violet-400" /> : <Globe className="w-5 h-5 text-sky-400" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-white">{plan.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          plan.status === 'active' ? 'bg-emerald-400/10 text-emerald-400' :
                          plan.status === 'paused' ? 'bg-amber-400/10 text-amber-400' :
                          'bg-slate-400/10 text-slate-400'
                        }`}>{plan.status}</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {plan.asset} · {plan.provider} · Owner: {plan.owner} · Started {new Date(plan.start_date).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">Stage {plan.current_stage}/4</p>
                      <p className="text-[10px] text-slate-500">{activeStage?.label || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{plan.current_daily_count} / {plan.daily_cap}</p>
                      <p className="text-[10px] text-slate-500">today</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>
                <div className="mt-2 w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full bg-[#06B6D4] rounded-full transition-all" style={{ width: `${(plan.current_daily_count / plan.daily_cap) * 100}%` }} />
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 border-t border-[rgba(255,255,255,0.04)]">
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
                    <div className="lg:col-span-3 space-y-3">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Warm-up Stages</h4>
                      {plan.stages.map((stage) => {
                        const isActive = stage.stage === plan.current_stage;
                        const isCompleted = stage.status === 'completed';
                        return (
                          <div key={stage.stage} className={`flex items-start gap-3 p-3 rounded-xl border ${
                            isActive ? 'bg-[#06B6D4]/5 border-[#06B6D4]/20' :
                            isCompleted ? 'bg-emerald-400/[0.03] border-emerald-400/10' :
                            'bg-white/[0.01] border-[rgba(255,255,255,0.03)]'
                          }`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              isCompleted ? 'bg-emerald-400 text-white' :
                              isActive ? 'bg-[#06B6D4] text-white' :
                              'bg-white/[0.04] text-slate-500'
                            } text-xs font-bold`}>
                              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : stage.stage}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-white">{stage.label}</p>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                  stage.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400' :
                                  stage.status === 'active' ? 'bg-[#06B6D4]/10 text-[#06B6D4]' :
                                  stage.status === 'paused' ? 'bg-amber-400/10 text-amber-400' :
                                  'bg-slate-400/10 text-slate-500'
                                }`}>{stage.status}</span>
                              </div>
                              <div className="flex items-center gap-4 mt-1">
                                <span className="text-[10px] text-slate-500">Daily cap: {stage.daily_cap}</span>
                                <span className="text-[10px] text-slate-500">{stage.observation_days}d observation</span>
                                {stage.completed_at && <span className="text-[10px] text-slate-500">Done: {new Date(stage.completed_at).toLocaleDateString('en-GB')}</span>}
                              </div>
                            </div>
                            {isActive && plan.status === 'active' && (
                              <button className="px-3 py-1 rounded-lg text-[10px] font-medium bg-amber-400/10 border border-amber-400/20 text-amber-400 hover:bg-amber-400/20 transition-colors cursor-pointer whitespace-nowrap">
                                <Pause className="w-3 h-3 inline mr-1" /> Pause
                              </button>
                            )}
                            {isActive && plan.status === 'paused' && (
                              <button className="px-3 py-1 rounded-lg text-[10px] font-medium bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 hover:bg-emerald-400/20 transition-colors cursor-pointer whitespace-nowrap">
                                <Play className="w-3 h-3 inline mr-1" /> Resume
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                      <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.04)] rounded-xl p-4">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Guardrails</h4>
                        <div className="space-y-2">
                          {plan.guardrails.map((g) => (
                            <div key={g} className="flex items-center gap-2">
                              <Shield className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-xs text-slate-300 capitalize">{g.replace(/_/g, ' ')}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.04)] rounded-xl p-4">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Pause Thresholds</h4>
                        <div className="space-y-2">
                          {Object.entries(plan.pause_thresholds).map(([k, v]) => (
                            <div key={k} className="flex items-center justify-between">
                              <span className="text-xs text-slate-400 capitalize">{k.replace(/_/g, ' ')}</span>
                              <span className="text-xs font-medium text-white">&gt; {v}{typeof v === 'number' && k.includes('rate') ? '%' : ''}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.04)] rounded-xl p-4">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Audience Sources</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {plan.audience_sources.map((s) => (
                            <span key={s} className="px-2 py-1 rounded-md text-[10px] bg-white/[0.04] text-slate-400">{s}</span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white/[0.02] border border-[rgba(255,255,255,0.04)] rounded-xl p-4">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Eligibility Status</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs text-slate-300">Domain verified</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs text-slate-300">SPF + DKIM + DMARC passing</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs text-slate-300">Webhooks healthy</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-xs text-slate-300">Suppression rules active</span>
                          </div>
                          {plan.status === 'paused' && (
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-xs text-amber-400">Bounce threshold exceeded — paused</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-amber-400/10 border border-amber-400/20 text-amber-400 hover:bg-amber-400/20 transition-colors cursor-pointer whitespace-nowrap">
                          Step Back
                        </button>
                        <button className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer whitespace-nowrap">
                          Cancel Plan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}