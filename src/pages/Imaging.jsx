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

const imagingTypes = ['xray','ct_scan','mri','ultrasound','mammography','pet_scan','fluoroscopy','other'];

const fields = [
  { name: 'patient_name', label: 'Patient Name', required: true },
  { name: 'imaging_type', label: 'Imaging Type', type: 'select', required: true, options: imagingTypes.map(t => ({ value: t, label: t.replace(/_/g, ' ').toUpperCase() })) },
  { name: 'body_part', label: 'Body Part' },
  { name: 'ordered_by', label: 'Ordered By' },
  { name: 'order_date', label: 'Order Date', type: 'date' },
  { name: 'priority', label: 'Priority', type: 'select', default: 'routine', options: [
    { value: 'routine', label: 'Routine' }, { value: 'urgent', label: 'Urgent' }, { value: 'stat', label: 'STAT' }
  ]},
  { name: 'findings', label: 'Findings', type: 'textarea', fullWidth: true },
  { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
  { name: 'status', label: 'Status', type: 'select', default: 'ordered', options: [
    { value: 'ordered', label: 'Ordered' }, { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }
  ]},
];

const columns = [
  { key: 'patient_name', label: 'Patient', render: (r) => <span className="font-medium">{r.patient_name}</span> },
  { key: 'imaging_type', label: 'Type', render: (r) => <span className="uppercase text-xs font-medium">{r.imaging_type?.replace(/_/g, ' ')}</span> },
  { key: 'body_part', label: 'Body Part' },
  { key: 'priority', label: 'Priority', render: (r) => <StatusBadge status={r.priority} /> },
  { key: 'order_date', label: 'Ordered' },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export default function Imaging() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();
  const { facilityId } = useFacility();

  const { data: orders = [], isLoading } = useQuery({ queryKey: ['imagingOrders', facilityId], queryFn: () => base44.entities.ImagingOrder.filter({ facility_id: facilityId }, '-created_date'), enabled: !!facilityId });
  const mutation = useMutation({
    mutationFn: (data) => editing ? base44.entities.ImagingOrder.update(editing.id, data) : base44.entities.ImagingOrder.create({ ...data, facility_id: facilityId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['imagingOrders'] }); setOpen(false); setEditing(null); }
  });

  const filtered = orders.filter(o => `${o.patient_name} ${o.imaging_type}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Imaging" subtitle="Manage radiology orders" actionLabel="New Order" onAction={() => { setEditing(null); setOpen(true); }} />
      <div className="mb-4 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search imaging orders..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <DataTable columns={columns} data={filtered} isLoading={isLoading} onRowClick={(r) => { setEditing(r); setOpen(true); }} />
      <EntityFormDialog open={open} onOpenChange={setOpen} title={editing ? 'Edit Imaging Order' : 'New Imaging Order'} fields={fields} initialData={editing} onSubmit={(d) => mutation.mutate(d)} isSubmitting={mutation.isPending} />
    </div>
  );
}