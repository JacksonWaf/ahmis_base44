import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  admitted: 'bg-blue-50 text-blue-700 border-blue-200',
  discharged: 'bg-slate-50 text-slate-600 border-slate-200',
  scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  dispensed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  overdue: 'bg-red-50 text-red-600 border-red-200',
  draft: 'bg-slate-50 text-slate-600 border-slate-200',
  ordered: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  sample_collected: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  low_stock: 'bg-amber-50 text-amber-700 border-amber-200',
  out_of_stock: 'bg-red-50 text-red-600 border-red-200',
  in_stock: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
  on_leave: 'bg-purple-50 text-purple-700 border-purple-200',
  partially_paid: 'bg-amber-50 text-amber-700 border-amber-200',
  no_show: 'bg-slate-50 text-slate-500 border-slate-200',
  excellent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  good: 'bg-blue-50 text-blue-700 border-blue-200',
  fair: 'bg-amber-50 text-amber-700 border-amber-200',
  poor: 'bg-red-50 text-red-600 border-red-200',
  out_of_service: 'bg-slate-100 text-slate-500 border-slate-300',
  repair: 'bg-orange-50 text-orange-700 border-orange-200',
  routine: 'bg-slate-50 text-slate-600 border-slate-200',
  urgent: 'bg-amber-50 text-amber-700 border-amber-200',
  stat: 'bg-red-50 text-red-600 border-red-200',
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  const style = statusStyles[status] || 'bg-slate-50 text-slate-600 border-slate-200';
  return (
    <Badge variant="outline" className={cn('text-xs font-medium capitalize border', style)}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}