import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import StatCard from '@/components/shared/StatCard';
import BillFormDialog from '@/components/billing/BillFormDialog';
import { Input } from '@/components/ui/input';
import { Search, Receipt, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { useFacility } from '@/lib/FacilityContext';

const columns = [
  { key: 'bill_number', label: 'Bill #', render: (r) => <span className="font-medium">{r.bill_number || '-'}</span> },
  { key: 'patient_name', label: 'Patient', render: (r) => <span className="font-medium">{r.patient_name}</span> },
  { key: 'bill_date', label: 'Date' },
  { key: 'total_amount', label: 'Total', render: (r) => <span className="font-semibold">GMD {(r.total_amount || 0).toFixed(2)}</span> },
  { key: 'amount_paid', label: 'Paid', render: (r) => `GMD ${(r.amount_paid || 0).toFixed(2)}` },
  { key: 'balance', label: 'Balance', render: (r) => {
    const bal = (r.total_amount || 0) - (r.amount_paid || 0) - (r.insurance_covered || 0);
    return <span className={bal > 0 ? 'text-destructive font-medium' : 'text-emerald-600'}>GMD {bal.toFixed(2)}</span>;
  }},
  { key: 'payment_method', label: 'Method', render: (r) => <span className="capitalize">{r.payment_method?.replace(/_/g, ' ') || '-'}</span> },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export default function Billing() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();
  const { facilityId } = useFacility();

  const { data: bills = [], isLoading } = useQuery({ queryKey: ['bills', facilityId], queryFn: () => base44.entities.Bill.filter({ facility_id: facilityId }, '-created_date'), enabled: !!facilityId });

  const mutation = useMutation({
    mutationFn: (data) => editing ? base44.entities.Bill.update(editing.id, data) : base44.entities.Bill.create({ ...data, facility_id: facilityId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bills'] }); setOpen(false); setEditing(null); }
  });

  const totalRevenue = bills.filter(b => b.status === 'paid').reduce((s, b) => s + (b.total_amount || 0), 0);
  const pendingAmount = bills.filter(b => b.status === 'pending' || b.status === 'partially_paid').reduce((s, b) => s + ((b.total_amount || 0) - (b.amount_paid || 0) - (b.insurance_covered || 0)), 0);
  const overdueCount = bills.filter(b => b.status === 'overdue').length;

  const filtered = bills.filter(b => `${b.patient_name} ${b.bill_number}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Billing" subtitle="Patient billing and payments" actionLabel="New Bill" onAction={() => { setEditing(null); setOpen(true); }} />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Bills" value={bills.length} icon={Receipt} />
        <StatCard title="Total Revenue" value={`GMD ${totalRevenue.toLocaleString()}`} icon={DollarSign} />
        <StatCard title="Pending Amount" value={`GMD ${pendingAmount.toLocaleString()}`} icon={Clock} />
        <StatCard title="Overdue Bills" value={overdueCount} icon={AlertTriangle} trend={overdueCount > 0 ? 'down' : undefined} />
      </div>

      <div className="mb-4 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search bills..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <DataTable columns={columns} data={filtered} isLoading={isLoading} onRowClick={(r) => { setEditing(r); setOpen(true); }} />
      <BillFormDialog open={open} onOpenChange={setOpen} bill={editing} onSubmit={(d) => mutation.mutate(d)} isSubmitting={mutation.isPending} />
    </div>
  );
}