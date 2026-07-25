'use client';

import { useState, useEffect } from 'react';
import { motion } from '@/components/motion';
import { supabase } from '@/lib/supabase';
import CommandShell from '@/components/admin/CommandShell';
import { Heart, AlertTriangle, CheckCircle2, Clock, RefreshCw, ChevronDown } from 'lucide-react';



export default function CommandHealthPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data } = await supabase.from('digital_footprint_projects').select('*').neq('status', 'archived').order('health_score', { ascending: true });
    if (data) setProjects(data);
    setLoading(false);
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return '#10B981';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return 'Healthy';
    if (score >= 50) return 'Warning';
    if (score > 0) return 'Critical';
    return 'No Data';
  };

  const getHealthReasons = (project: any) => {
    const reasons: string[] = [];
    if (project.deployment_status === 'failed') reasons.push('Failed deployment');
    if (project.backup_status === 'failed') reasons.push('Failed backup');
    if (project.uptime && project.uptime < 95) reasons.push('Low uptime');
    if (!project.last_heartbeat) reasons.push('No recent heartbeat');
    return reasons.length > 0 ? reasons : ['All systems operational'];
  };

  if (loading) {
    return <CommandShell><div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-[#06B6D4]/30 border-t-[#06B6D4] rounded-full animate-spin" /></div></CommandShell>;
  }

  return (
    <CommandShell>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Health Monitoring</h1>
          <p className="text-sm text-slate-400">Real-time health scores across all Digital-Footprint systems</p>
        </div>

        {projects.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center">
            <Heart className="w-14 h-14 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Projects to Monitor</h3>
            <p className="text-sm text-slate-400">Add projects in the Projects module to start tracking health</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project, i) => (
              <motion.div key={project.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card rounded-2xl overflow-hidden">
                <button onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
                  className="w-full p-5 flex items-center gap-4 text-left cursor-pointer">
                  <div className="relative w-14 h-14 shrink-0">
                    <svg className="w-14 h-14 -rotate-90">
                      <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                      <circle cx="28" cy="28" r="22" fill="none" stroke={getHealthColor(project.health_score || 0)} strokeWidth="3"
                        strokeDasharray={`${((project.health_score || 0) / 100) * 138.23} 138.23`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold" style={{ color: getHealthColor(project.health_score || 0) }}>
                        {project.health_score || '--'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white truncate">{project.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase" style={{
                        backgroundColor: getHealthColor(project.health_score || 0) + '20',
                        color: getHealthColor(project.health_score || 0)
                      }}>{getHealthLabel(project.health_score || 0)}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {getHealthReasons(project)[0]}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-slate-400">Last Check</div>
                    <div className="text-xs text-slate-500 font-mono">
                      {project.last_heartbeat ? new Date(project.last_heartbeat).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${expandedId === project.id ? 'rotate-180' : ''}`} />
                </button>
                {expandedId === project.id && (
                  <div className="px-5 pb-5 border-t border-[rgba(255,255,255,0.05)] pt-4 space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white/[0.02] rounded-xl p-3">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Uptime</div>
                        <div className="text-sm font-bold text-white">{project.uptime || '--'}%</div>
                      </div>
                      <div className="bg-white/[0.02] rounded-xl p-3">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Users</div>
                        <div className="text-sm font-bold text-white">{project.user_count || 0}</div>
                      </div>
                      <div className="bg-white/[0.02] rounded-xl p-3">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Deployment</div>
                        <div className="text-sm font-bold text-white capitalize">{project.deployment_status || 'Awaiting'}</div>
                      </div>
                      <div className="bg-white/[0.02] rounded-xl p-3">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Backup</div>
                        <div className="text-sm font-bold text-white capitalize">{project.backup_status || 'Awaiting'}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Health Factors</div>
                      <div className="space-y-1">
                        {getHealthReasons(project).map((reason, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            {reason.includes('operational') ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            )}
                            <span className="text-slate-300">{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-slate-400 hover:text-white transition-colors cursor-pointer">
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
        </div>
      </div>
    </CommandShell>
  );
}