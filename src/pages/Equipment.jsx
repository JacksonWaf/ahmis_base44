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

const categories = ['diagnostic','therapeutic','surgical','monitoring','laboratory','imaging','life_support','other'];

const fields = [
  { name: 'name', label: 'Equipment Name', required: true },
  { name: 'serial_number', label: 'Serial Number', required: true },
  { name: 'category', label: 'Category', type: 'select', options: categories.map(c => ({ value: c, label: c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })) },
  { name: 'manufacturer', label: 'Manufacturer' },
  { name: 'model', label: 'Model' },
  { name: 'department', label: 'Department' },
  { name: 'location', label: 'Location' },
  { name: 'purchase_date', label: 'Purchase Date', type: 'date' },
  { name: 'warranty_expiry', label: 'Warranty Expiry', type: 'date' },
  { name: 'last_maintenance', label: 'Last Maintenance', type: 'date' },
  { name: 'next_maintenance', label: 'Next Maintenance', type: 'date' },
  { name: 'cost', label: 'Cost ($)', type: 'number' },
  { name: 'condition', label: 'Condition', type: 'select', default: 'good', options: [
    { value: 'excellent', label: 'Excellent' }, { value: 'good', label: 'Good' }, { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }, { value: 'out_of_service', label: 'Out of Service' }
  ]},
  { name: 'status', label: 'Status', type: 'select', default: 'active', options: [
    { value: 'active', label: 'Active' }, { value: 'maintenance', label: 'Maintenance' },
    { value: 'repair', label: 'Repair' }, { value: 'decommissioned', label: 'Decommissioned' }
  ]},
];

const columns = [
  { key: 'name', label: 'Equipment', render: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'serial_number', label: 'Serial #' },
  { key: 'category', label: 'Category', render: (r) => <span className="capitalize">{r.category?.replace(/_/g, ' ')}</span> },
  { key: 'department', label: 'Department' },
  { key: 'condition', label: 'Condition', render: (r) => <StatusBadge status={r.condition} /> },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export default function EquipmentPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();
  const { facilityId } = useFacility();

  const { data: equipment = [], isLoading } = useQuery({ queryKey: ['equipment', facilityId], queryFn: () => base44.entities.Equipment.filter({ facility_id: facilityId }, '-created_date'), enabled: !!facilityId });
  const mutation = useMutation({
    mutationFn: (data) => editing ? base44.entities.Equipment.update(editing.id, data) : base44.entities.Equipment.create({ ...data, facility_id: facilityId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['equipment'] }); setOpen(false); setEditing(null); }
  });

  const filtered = equipment.filter(e => `${e.name} ${e.serial_number}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Equipment" subtitle="Track medical equipment" actionLabel="Add Equipment" onAction={() => { setEditing(null); setOpen(true); }} />
      <div className="mb-4 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search equipment..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <DataTable columns={columns} data={filtered} isLoading={isLoading} onRowClick={(r) => { setEditing(r); setOpen(true); }} />
      <EntityFormDialog open={open} onOpenChange={setOpen} title={editing ? 'Edit Equipment' : 'Add Equipment'} fields={fields} initialData={editing} onSubmit={(d) => mutation.mutate(d)} isSubmitting={mutation.isPending} />
    </div>
  );
}