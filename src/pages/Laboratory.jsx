import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import EntityFormDialog from '@/components/shared/EntityFormDialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useFacility } from '@/lib/FacilityContext';

const testTypes = ['blood_count','urinalysis','lipid_panel','liver_function','kidney_function','thyroid','glucose','hba1c','electrolytes','coagulation','culture','other'];

const fields = [
  { name: 'patient_name', label: 'Patient Name', required: true },
  { name: 'test_name', label: 'Test Name', required: true },
  { name: 'test_type', label: 'Test Type', type: 'select', options: testTypes.map(t => ({ value: t, label: t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })) },
  { name: 'ordered_by', label: 'Ordered By' },
  { name: 'order_date', label: 'Order Date', type: 'date' },
  { name: 'priority', label: 'Priority', type: 'select', default: 'routine', options: [
    { value: 'routine', label: 'Routine' }, { value: 'urgent', label: 'Urgent' }, { value: 'stat', label: 'STAT' }
  ]},
  { name: 'price', label: 'Price (GMD)', type: 'number', default: 0 },
  { name: 'results', label: 'Results', type: 'textarea', fullWidth: true },
  { name: 'normal_range', label: 'Normal Range' },
  { name: 'result_date', label: 'Result Date', type: 'date' },
  { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
  { name: 'status', label: 'Status', type: 'select', default: 'ordered', options: [
    { value: 'ordered', label: 'Ordered' }, { value: 'sample_collected', label: 'Sample Collected' },
    { value: 'processing', label: 'Processing' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }
  ]},
];

const columns = [
  { key: 'patient_name', label: 'Patient', render: (r) => <span className="font-medium">{r.patient_name}</span> },
  { key: 'test_name', label: 'Test' },
  { key: 'test_type', label: 'Type', render: (r) => <span className="capitalize">{r.test_type?.replace(/_/g, ' ')}</span> },
  { key: 'priority', label: 'Priority', render: (r) => <StatusBadge status={r.priority} /> },
  { key: 'price', label: 'Price', render: (r) => <span className="font-medium">{r.price != null ? `GMD ${Number(r.price).toFixed(2)}` : '—'}</span> },
  { key: 'order_date', label: 'Ordered' },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export default function Laboratory() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();
  const { facilityId } = useFacility();

  const { data: tests = [], isLoading } = useQuery({ queryKey: ['labTests', facilityId], queryFn: () => base44.entities.LabTest.filter({ facility_id: facilityId }, '-created_date'), enabled: !!facilityId });
  const mutation = useMutation({
    mutationFn: (data) => editing ? base44.entities.LabTest.update(editing.id, data) : base44.entities.LabTest.create({ ...data, facility_id: facilityId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['labTests'] }); setOpen(false); setEditing(null); }
  });

  const filtered = tests.filter(t => `${t.patient_name} ${t.test_name}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Laboratory" subtitle="Manage lab tests and results" actionLabel="Order Test" onAction={() => { setEditing(null); setOpen(true); }} />
      <div className="mb-4 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search tests..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <DataTable columns={columns} data={filtered} isLoading={isLoading} onRowClick={(r) => { setEditing(r); setOpen(true); }} />
      <EntityFormDialog open={open} onOpenChange={setOpen} title={editing ? 'Edit Lab Test' : 'Order Lab Test'} fields={fields} initialData={editing} onSubmit={(d) => mutation.mutate(d)} isSubmitting={mutation.isPending} />
    </div>
  );
}