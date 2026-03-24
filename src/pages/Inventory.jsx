import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import EntityFormDialog from '@/components/shared/EntityFormDialog';
import StatCard from '@/components/shared/StatCard';
import { Input } from '@/components/ui/input';
import { Search, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import { useFacility } from '@/lib/FacilityContext';

const categories = ['medical_supplies','surgical','ppe','cleaning','office','linen','food','other'];
const units = ['pieces','boxes','packets','liters','kg','rolls','pairs','sets'];

const fields = [
  { name: 'name', label: 'Item Name', required: true },
  { name: 'sku', label: 'SKU', required: true },
  { name: 'category', label: 'Category', type: 'select', options: categories.map(c => ({ value: c, label: c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })) },
  { name: 'unit', label: 'Unit', type: 'select', options: units.map(u => ({ value: u, label: u.replace(/\b\w/g, l => l.toUpperCase()) })) },
  { name: 'quantity_in_stock', label: 'Quantity', type: 'number' },
  { name: 'reorder_level', label: 'Reorder Level', type: 'number' },
  { name: 'unit_cost', label: 'Unit Cost (GMD)', type: 'number' },
  { name: 'supplier', label: 'Supplier' },
  { name: 'location', label: 'Location' },
  { name: 'last_restocked', label: 'Last Restocked', type: 'date' },
  { name: 'expiry_date', label: 'Expiry Date', type: 'date' },
  { name: 'status', label: 'Status', type: 'select', default: 'in_stock', options: [
    { value: 'in_stock', label: 'In Stock' }, { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' }, { value: 'discontinued', label: 'Discontinued' }
  ]},
];

const columns = [
  { key: 'name', label: 'Item', render: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'sku', label: 'SKU' },
  { key: 'category', label: 'Category', render: (r) => <span className="capitalize">{r.category?.replace(/_/g, ' ')}</span> },
  { key: 'quantity_in_stock', label: 'Qty' },
  { key: 'unit', label: 'Unit', render: (r) => <span className="capitalize">{r.unit}</span> },
  { key: 'unit_cost', label: 'Cost', render: (r) => r.unit_cost ? `GMD ${r.unit_cost.toFixed(2)}` : '-' },
  { key: 'supplier', label: 'Supplier' },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export default function Inventory() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();
  const { facilityId } = useFacility();

  const { data: items = [], isLoading } = useQuery({ queryKey: ['inventory', facilityId], queryFn: () => base44.entities.InventoryItem.filter({ facility_id: facilityId }, '-created_date'), enabled: !!facilityId });
  const mutation = useMutation({
    mutationFn: (data) => editing ? base44.entities.InventoryItem.update(editing.id, data) : base44.entities.InventoryItem.create({ ...data, facility_id: facilityId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); setOpen(false); setEditing(null); }
  });

  const lowStock = items.filter(i => i.quantity_in_stock <= i.reorder_level && i.quantity_in_stock > 0);
  const outOfStock = items.filter(i => i.quantity_in_stock === 0 || i.status === 'out_of_stock');
  const totalValue = items.reduce((s, i) => s + (i.quantity_in_stock || 0) * (i.unit_cost || 0), 0);

  const filtered = items.filter(i => `${i.name} ${i.sku} ${i.supplier}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Inventory & Stock" subtitle="Manage supplies and stock levels" actionLabel="Add Item" onAction={() => { setEditing(null); setOpen(true); }} />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Items" value={items.length} icon={Package} />
        <StatCard title="Low Stock" value={lowStock.length} icon={AlertTriangle} trend={lowStock.length > 0 ? 'down' : undefined} />
        <StatCard title="Out of Stock" value={outOfStock.length} icon={AlertTriangle} trend={outOfStock.length > 0 ? 'down' : undefined} />
        <StatCard title="Total Value" value={`GMD ${totalValue.toLocaleString()}`} icon={CheckCircle} />
      </div>

      <div className="mb-4 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <DataTable columns={columns} data={filtered} isLoading={isLoading} onRowClick={(r) => { setEditing(r); setOpen(true); }} />
      <EntityFormDialog open={open} onOpenChange={setOpen} title={editing ? 'Edit Item' : 'Add Item'} fields={fields} initialData={editing} onSubmit={(d) => mutation.mutate(d)} isSubmitting={mutation.isPending} />
    </div>
  );
}