'use client';

const statusColors: Record<string, string> = {
  active: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20',
  inactive: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  suspended: 'bg-[#F97316]/15 text-[#F97316] border-[#F97316]/20',
  disabled: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/20',
  setup_required: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/20',
  pending: 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/20',
  answered: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20',
  missed: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/20',
  voicemail: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/20',
  busy: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/20',
  failed: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/20',
  new: 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/20',
  listened: 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/20',
  actioned: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20',
  archived: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  paid: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20',
  unpaid: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/20',
  trial: 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/20',
  online: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20',
  offline: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/20',
  warning: 'bg-[#F97316]/15 text-[#F97316] border-[#F97316]/20',
  sent: 'bg-[#06B6D4]/15 text-[#06B6D4] border-[#06B6D4]/20',
  delivered: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20',
  received: 'bg-[#8B5CF6]/15 text-[#8B5CF6] border-[#8B5CF6]/20',
  error: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/20',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
  disabled: 'Disabled',
  setup_required: 'Setup Required',
  pending: 'Pending',
  answered: 'Answered',
  missed: 'Missed',
  voicemail: 'Voicemail',
  busy: 'Busy',
  failed: 'Failed',
  new: 'New',
  listened: 'Listened',
  actioned: 'Actioned',
  archived: 'Archived',
  paid: 'Paid',
  unpaid: 'Unpaid',
  trial: 'Trial',
  online: 'Online',
  offline: 'Offline',
  warning: 'Warning',
  sent: 'Sent',
  delivered: 'Delivered',
  received: 'Received',
  error: 'Error',
};

interface PBXStatusBadgeProps {
  status: string;
  className?: string;
}

export default function PBXStatusBadge({ status, className = '' }: PBXStatusBadgeProps) {
  const colorClass = statusColors[status] || statusColors.inactive;
  const label = statusLabels[status] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${colorClass} ${className} whitespace-nowrap`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: 'currentColor' }} />
      {label}
    </span>
  );
}