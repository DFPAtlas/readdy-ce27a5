'use client';

import { useDashboardData } from '@/hooks/useDashboardData';
import AdminShell from '../../components/admin/AdminShell';
import DashboardHeader from '../../components/admin/dashboard/DashboardHeader';
import AttentionStrip from '../../components/admin/dashboard/AttentionStrip';
import KpiCards from '../../components/admin/dashboard/KpiCards';
import FinanceSummary from '../../components/admin/dashboard/FinanceSummary';
import ProjectPortfolio from '../../components/admin/dashboard/ProjectPortfolio';
import LeadsSummary from '../../components/admin/dashboard/LeadsSummary';
import RecentActivity from '../../components/admin/dashboard/RecentActivity';
import OperationalHealth from '../../components/admin/dashboard/OperationalHealth';
import Link from 'next/link';
import { LoadingState, ErrorState, ConnectionFailedState } from '../../components/admin/shared/DataState';
import { AlertTriangle } from 'lucide-react';

export function AdminPortalContent() {
  const { data, dateRange, setDateRange, refresh } = useDashboardData('30days');

  if (data.loading && !data.lastRefreshed) {
    return (
      <AdminShell>
        <div className="max-w-7xl mx-auto">
          <DashboardHeader
            dateRangeLabel={dateRange.label}
            lastRefreshed={null}
            partialFailures={[]}
            onRefresh={refresh}
            onDateRangeChange={setDateRange}
            loading={true}
          />
          <LoadingState />
        </div>
      </AdminShell>
    );
  }

  if (data.error && !data.lastRefreshed) {
    return (
      <AdminShell>
        <div className="max-w-7xl mx-auto">
          <DashboardHeader
            dateRangeLabel={dateRange.label}
            lastRefreshed={null}
            partialFailures={[]}
            onRefresh={refresh}
            onDateRangeChange={setDateRange}
            loading={false}
          />
          {data.error.includes('fetch') || data.error.includes('network') || data.error.includes('Failed to fetch') ? (
            <ConnectionFailedState onRetry={refresh} />
          ) : (
            <ErrorState onRetry={refresh}>{data.error}</ErrorState>
          )}
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="max-w-7xl mx-auto">
        <DashboardHeader
          dateRangeLabel={dateRange.label}
          lastRefreshed={data.lastRefreshed}
          partialFailures={data.partialFailures}
          onRefresh={refresh}
          onDateRangeChange={setDateRange}
          loading={data.loading}
        />

        <AttentionStrip items={data.attentionItems} />

        <KpiCards kpis={data.kpis} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <FinanceSummary data={data.finance} loading={data.loading && !data.lastRefreshed} />
          <ProjectPortfolio data={data.projects} loading={data.loading && !data.lastRefreshed} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LeadsSummary data={data.leads} loading={data.loading && !data.lastRefreshed} />
          <div className="space-y-6">
            <RecentActivity items={data.recentActivity} loading={data.loading && !data.lastRefreshed} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <OperationalHealth items={data.healthItems} loading={data.loading && !data.lastRefreshed} />

          <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-5">UAT Testing</h3>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-[#0F172A] rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-[#06B6D4]">{data.uat.jobsInProgress}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Jobs Active</div>
              </div>
              <div className="bg-[#0F172A] rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-[#8B5CF6]">{data.uat.testersAssigned}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Testers Active</div>
              </div>
              <div className="bg-[#0F172A] rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-[#F59E0B]">{data.uat.feedbackAwaiting}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Feedback Pending</div>
              </div>
              <div className="bg-[#0F172A] rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-[#EF4444]">{data.uat.criticalDefects}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Critical Defects</div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Link href="/admin/uat/jobs" className="text-xs text-[#06B6D4] hover:underline cursor-pointer">UAT Jobs</Link>
              <Link href="/admin/uat/feedback" className="text-xs text-[#06B6D4] hover:underline cursor-pointer">UAT Feedback</Link>
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 mb-6">
          <h3 className="text-base font-bold text-white mb-5">PBX System</h3>
          <div className="flex flex-col items-center py-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-slate-300 font-medium mb-1">PBX module not yet configured</p>
            <p className="text-xs text-slate-500 max-w-sm">
              Phone system data will appear here once PBX integrations are set up. Full conversion is scheduled for Prompt 15.
            </p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
