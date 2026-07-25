export type ProjectStatus =
  | 'draft' | 'planning' | 'ready' | 'active'
  | 'on_hold' | 'at_risk' | 'awaiting_client' | 'awaiting_uat'
  | 'ready_for_launch' | 'complete' | 'cancelled' | 'archived';

export type ProjectHealth = 'healthy' | 'watch' | 'at_risk' | 'critical' | 'not_enough_data';

export type ProgressMethod = 'manual' | 'task_based' | 'milestone_based' | 'phase_based';

export type PhaseStatus = 'draft' | 'not_started' | 'active' | 'blocked' | 'complete' | 'cancelled';

export type RiskStatus = 'open' | 'mitigating' | 'monitoring' | 'closed' | 'materialised';

export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type DecisionStatus = 'draft' | 'proposed' | 'approved' | 'rejected' | 'superseded';

export type ChangeStatus =
  | 'draft' | 'submitted' | 'under_review' | 'approved'
  | 'rejected' | 'implementing' | 'complete' | 'cancelled';

export type MilestoneStatus = 'not_started' | 'active' | 'at_risk' | 'blocked' | 'complete' | 'cancelled';

export type DeploymentStatus = 'planned' | 'queued' | 'running' | 'successful' | 'failed' | 'rolled_back' | 'cancelled' | 'unknown';

export type LaunchReadiness = 'ready' | 'ready_with_conditions' | 'not_ready' | 'not_enough_data';

export const PROJECT_STATUSES: { value: ProjectStatus; label: string; color: string; bg: string }[] = [
  { value: 'draft', label: 'Draft', color: '#94A3B8', bg: 'bg-slate-500/10' },
  { value: 'planning', label: 'Planning', color: '#06B6D4', bg: 'bg-cyan-500/10' },
  { value: 'ready', label: 'Ready', color: '#3B82F6', bg: 'bg-blue-500/10' },
  { value: 'active', label: 'Active', color: '#10B981', bg: 'bg-emerald-500/10' },
  { value: 'on_hold', label: 'On Hold', color: '#F59E0B', bg: 'bg-amber-500/10' },
  { value: 'at_risk', label: 'At Risk', color: '#F97316', bg: 'bg-orange-500/10' },
  { value: 'awaiting_client', label: 'Awaiting Client', color: '#8B5CF6', bg: 'bg-purple-500/10' },
  { value: 'awaiting_uat', label: 'Awaiting UAT', color: '#EC4899', bg: 'bg-pink-500/10' },
  { value: 'ready_for_launch', label: 'Ready for Launch', color: '#14B8A6', bg: 'bg-teal-500/10' },
  { value: 'complete', label: 'Complete', color: '#6366F1', bg: 'bg-indigo-500/10' },
  { value: 'cancelled', label: 'Cancelled', color: '#EF4444', bg: 'bg-red-500/10' },
  { value: 'archived', label: 'Archived', color: '#6B7280', bg: 'bg-gray-500/10' },
];

export const PROJECT_HEALTH_LABELS: { value: ProjectHealth; label: string; color: string }[] = [
  { value: 'healthy', label: 'Healthy', color: '#10B981' },
  { value: 'watch', label: 'Watch', color: '#F59E0B' },
  { value: 'at_risk', label: 'At Risk', color: '#F97316' },
  { value: 'critical', label: 'Critical', color: '#EF4444' },
  { value: 'not_enough_data', label: 'Not Enough Data', color: '#94A3B8' },
];

export const PHASE_STATUSES: { value: PhaseStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: '#94A3B8' },
  { value: 'not_started', label: 'Not Started', color: '#6B7280' },
  { value: 'active', label: 'Active', color: '#3B82F6' },
  { value: 'blocked', label: 'Blocked', color: '#EF4444' },
  { value: 'complete', label: 'Complete', color: '#10B981' },
  { value: 'cancelled', label: 'Cancelled', color: '#94A3B8' },
];

export const RISK_PROBABILITIES = ['very_low', 'low', 'medium', 'high', 'very_high'] as const;
export const RISK_IMPACTS = ['very_low', 'low', 'medium', 'high', 'very_high'] as const;
export const RISK_RATINGS = ['very_low', 'low', 'medium', 'high', 'critical'] as const;

export const ISSUE_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;

export const LAUNCH_CHECKLIST = [
  { id: 'scope_complete', label: 'Scope Complete', critical: true },
  { id: 'tasks_complete', label: 'Required Tasks Complete', critical: true },
  { id: 'critical_issues', label: 'Critical Issues Resolved', critical: true },
  { id: 'uat_approval', label: 'UAT Approval', critical: true },
  { id: 'content_approval', label: 'Content Approved', critical: false },
  { id: 'domain_ssl', label: 'Domain & SSL Configured', critical: true },
  { id: 'monitoring', label: 'Monitoring Set Up', critical: false },
  { id: 'backups', label: 'Backups Configured', critical: true },
  { id: 'analytics', label: 'Analytics / Consent', critical: false },
  { id: 'client_approval', label: 'Client Approval', critical: true },
  { id: 'rollback_plan', label: 'Rollback Plan', critical: false },
  { id: 'support_ownership', label: 'Support Ownership', critical: false },
];

export function getStatusDef(status: string) {
  return PROJECT_STATUSES.find(s => s.value === status) || PROJECT_STATUSES[0];
}

export function getHealthDef(health: string) {
  return PROJECT_HEALTH_LABELS.find(h => h.value === health) || PROJECT_HEALTH_LABELS[4];
}

export function getPhaseStatusDef(status: string) {
  return PHASE_STATUSES.find(s => s.value === status) || PHASE_STATUSES[1];
}

export function calculateHealth(project: Record<string, unknown>): ProjectHealth {
  const issues: string[] = [];
  const overdueTasks = (project as any).overdue_tasks || 0;
  const criticalIssues = (project as any).critical_issues || 0;
  const isOverdue = (project as any).is_overdue || false;
  const milestoneOverdue = (project as any).milestone_overdue || 0;

  if (criticalIssues > 0) issues.push('critical');
  if (overdueTasks > 5) issues.push('many_overdue');
  if (isOverdue && milestoneOverdue > 0) issues.push('schedule');
  if (project.status === 'at_risk') issues.push('status_at_risk');

  if (issues.includes('critical')) return 'critical';
  if (issues.includes('many_overdue') || issues.includes('schedule')) return 'at_risk';
  if (issues.includes('status_at_risk') || overdueTasks > 0 || milestoneOverdue > 0) return 'watch';
  if (project.status === 'active' || project.status === 'ready' || project.status === 'complete') return 'healthy';
  return 'not_enough_data';
}