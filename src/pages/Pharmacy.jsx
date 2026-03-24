import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import EntityFormDialog from '@/components/shared/EntityFormDialog';
import StatCard from '@/components/shared/StatCard';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Pill, AlertTriangle, Package } from 'lucide-react';
import { useFacility } from '@/lib/FacilityContext';

const medCategories = ['antibiotic','analgesic','antihypertensive','antidiabetic','anticoagulant','antidepressant','antihistamine','steroid','vitamin','vaccine','other'];
const dosageForms = ['tablet','capsule','injection','syrup','cream','ointment','drops','inhaler','patch','other'];

const medFields = [
  { name: 'name', label: 'Brand Name', required: true },
  { name: 'generic_name', label: 'Generic Name' },
  { name: 'category', label: 'Category', type: 'select', options: medCategories.map(c => ({ value: c, label: c.replace(/\b\w/g, l => l.toUpperCase()) })) },
  { name: 'dosage_form', label: 'Dosage Form', type: 'select', options: dosageForms.map(d => ({ value: d, label: d.replace(/\b\w/g, l => l.toUpperCase()) })) },
  { name: 'strength', label: 'Strength' },
  { name: 'manufacturer', label: 'Manufacturer' },
  { name: 'unit_price', label: 'Unit Price (GMD)', type: 'number' },
  { name: 'stock_quantity', label: 'Stock Qty', type: 'number' },
  { name: 'reorder_level', label: 'Reorder Level', type: 'number' },
  { name: 'batch_number', label: 'Batch Number' },
  { name: 'expiry_date', label: 'Expiry Date', type: 'date' },
  { name: 'storage_conditions', label: 'Storage', fullWidth: true },
  { name: 'status', label: 'Status', type: 'select', default: 'available', options: [
    { value: 'available', label: 'Available' }, { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' }, { value: 'expired', label: 'Expired' }
  ]},
];

const rxFields = [
  { name: 'patient_name', label: 'Patient Name', required: true },
  { name: 'doctor_name', label: 'Doctor' },
  { name: 'medication_name', label: 'Medication', required: true },
  { name: 'dosage', label: 'Dosage' },
  { name: 'frequency', label: 'Frequency' },
  { name: 'duration', label: 'Duration' },
  { name: 'quantity', label: 'Quantity', type: 'number' },
  { name: 'total_cost', label: 'Total Cost (GMD)', type: 'number' },
  { name: 'prescribed_date', label: 'Prescribed Date', type: 'date' },
  { name: 'instructions', label: 'Instructions', type: 'textarea', fullWidth: true },
  { name: 'status', label: 'Status', type: 'select', default: 'pending', options: [
    { value: 'pending', label: 'Pending' }, { value: 'dispensed', label: 'Dispensed' }, { value: 'cancelled', label: 'Cancelled' }
  ]},
];

const medColumns = [
  { key: 'name', label: 'Medication', render: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'generic_name', label: 'Generic Name' },
  { key: 'category', label: 'Category', render: (r) => <span className="capitalize">{r.category}</span> },
  { key: 'dosage_form', label: 'Form', render: (r) => <span className="capitalize">{r.dosage_form}</span> },
  { key: 'stock_quantity', label: 'Stock' },
  { key: 'unit_price', label: 'Price', render: (r) => r.unit_price ? `GMD ${r.unit_price.toFixed(2)}` : '-' },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

const rxColumns = [
  { key: 'patient_name', label: 'Patient', render: (r) => <span className="font-medium">{r.patient_name}</span> },
  { key: 'medication_name', label: 'Medication' },
  { key: 'dosage', label: 'Dosage' },
  { key: 'frequency', label: 'Frequency' },
  { key: 'quantity', label: 'Qty' },
  { key: 'prescribed_date', label: 'Date' },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

export default function Pharmacy() {
  const [tab, setTab] = useState('medications');
  const [medOpen, setMedOpen] = useState(false);
  const [rxOpen, setRxOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [editingRx, setEditingRx] = useState(null);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();
  const { facilityId } = useFacility();

  const { data: meds = [], isLoading: loadingMeds } = useQuery({ queryKey: ['medications', facilityId], queryFn: () => base44.entities.Medication.filter({ facility_id: facilityId }, '-created_date'), enabled: !!facilityId });
  const { data: prescriptions = [], isLoading: loadingRx } = useQuery({ queryKey: ['prescriptions', facilityId], queryFn: () => base44.entities.Prescription.filter({ facility_id: facilityId }, '-created_date'), enabled: !!facilityId });

  const medMutation = useMutation({
    mutationFn: (data) => editingMed ? base44.entities.Medication.update(editingMed.id, data) : base44.entities.Medication.create({ ...data, facility_id: facilityId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['medications'] }); setMedOpen(false); setEditingMed(null); }
  });

  const rxMutation = useMutation({
    mutationFn: (data) => editingRx ? base44.entities.Prescription.update(editingRx.id, data) : base44.entities.Prescription.create({ ...data, facility_id: facilityId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['prescriptions'] }); setRxOpen(false); setEditingRx(null); }
  });

  const lowStock = meds.filter(m => m.stock_quantity <= m.reorder_level);
  const pendingRx = prescriptions.filter(p => p.status === 'pending');

  return (
    <div>
      <PageHeader title="Pharmacy" subtitle="Medications and prescriptions" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Medications" value={meds.length} icon={Pill} />
        <StatCard title="Low Stock" value={lowStock.length} icon={AlertTriangle} trend={lowStock.length > 0 ? 'down' : undefined} />
        <StatCard title="Pending Prescriptions" value={pendingRx.length} icon={Package} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-3">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-56" />
            </div>
            {tab === 'medications' ? (
              <button onClick={() => { setEditingMed(null); setMedOpen(true); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">+ Add Medication</button>
            ) : (
              <button onClick={() => { setEditingRx(null); setRxOpen(true); }} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">+ New Prescription</button>
            )}
          </div>
        </div>

        <TabsContent value="medications">
          <DataTable columns={medColumns} data={meds.filter(m => `${m.name} ${m.generic_name}`.toLowerCase().includes(search.toLowerCase()))} isLoading={loadingMeds} onRowClick={(r) => { setEditingMed(r); setMedOpen(true); }} />
        </TabsContent>
        <TabsContent value="prescriptions">
          <DataTable columns={rxColumns} data={prescriptions.filter(p => `${p.patient_name} ${p.medication_name}`.toLowerCase().includes(search.toLowerCase()))} isLoading={loadingRx} onRowClick={(r) => { setEditingRx(r); setRxOpen(true); }} />
        </TabsContent>
      </Tabs>

      <EntityFormDialog open={medOpen} onOpenChange={setMedOpen} title={editingMed ? 'Edit Medication' : 'Add Medication'} fields={medFields} initialData={editingMed} onSubmit={(d) => medMutation.mutate(d)} isSubmitting={medMutation.isPending} />
      <EntityFormDialog open={rxOpen} onOpenChange={setRxOpen} title={editingRx ? 'Edit Prescription' : 'New Prescription'} fields={rxFields} initialData={editingRx} onSubmit={(d) => rxMutation.mutate(d)} isSubmitting={rxMutation.isPending} />
    </div>
  );
}