import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import PatientRegistrationDialog from '@/components/patients/PatientRegistrationDialog';
import PostRegistrationPrompt from '@/components/patients/PostRegistrationPrompt';
import TriageDialog from '@/components/patients/TriageDialog';
import PatientEncountersDialog from '@/components/patients/PatientEncountersDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Activity, Pencil, ClipboardList } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useFacility } from '@/lib/FacilityContext';

export default function Patients() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [promptOpen, setPromptOpen] = useState(false);
  const [triageOpen, setTriageOpen] = useState(false);
  const [triagePatient, setTriagePatient] = useState(null);
  const [encountersOpen, setEncountersOpen] = useState(false);
  const [encountersPatient, setEncountersPatient] = useState(null);
  const [newPatient, setNewPatient] = useState(null);
  const [triageSubmitting, setTriageSubmitting] = useState(false);
  const qc = useQueryClient();
  const { toast } = useToast();
  const { facilityId } = useFacility();

  const openTriage = (patient, e) => {
    e?.stopPropagation();
    setTriagePatient(patient);
    setTriageOpen(true);
  };

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => base44.entities.Patient.filter({ facility_id: facilityId }, '-created_date'),
    enabled: !!facilityId
  });

  const mutation = useMutation({
    mutationFn: async ({ patientData, paymentData }) => {
      const patient = editing
        ? await base44.entities.Patient.update(editing.id, patientData)
        : await base44.entities.Patient.create({ ...patientData, facility_id: facilityId });

      if (paymentData && !editing) {
        const billNumber = `BILL-${Date.now().toString(36).toUpperCase()}`;
        await base44.entities.Bill.create({
          patient_name: `${patient.first_name} ${patient.last_name}`,
          facility_id: facilityId,
          bill_number: billNumber,
          bill_date: new Date().toISOString().split('T')[0],
          items: [{
            description: 'Consultation Fee',
            category: 'Consultation',
            quantity: 1,
            unit_price: paymentData.consultation_fee,
            total: paymentData.consultation_fee,
          }],
          subtotal: paymentData.consultation_fee,
          total_amount: paymentData.consultation_fee,
          amount_paid: paymentData.payment_status === 'paid' ? paymentData.consultation_fee : 0,
          insurance_covered: 0,
          payment_method: paymentData.payment_method,
          notes: paymentData.notes || '',
          status: paymentData.payment_status === 'paid' ? 'paid'
            : paymentData.payment_status === 'waived' ? 'cancelled'
            : 'pending',
        });
      }

      return patient;
    },
    onSuccess: (patient) => {
      qc.invalidateQueries({ queryKey: ['patients'] });
      qc.invalidateQueries({ queryKey: ['bills'] });
      setOpen(false);
      if (!editing) {
        setNewPatient(patient);
        setPromptOpen(true);
      }
      setEditing(null);
    }
  });

  const handleTriage = async ({ chief_complaint, priority, notes, vital_signs }) => {
    const patient = triagePatient || newPatient;
    setTriageSubmitting(true);
    try {
      await base44.entities.ClinicalEncounter.create({
        facility_id: facilityId,
        patient_id: patient.id,
        patient_name: `${patient.first_name} ${patient.last_name}`,
        encounter_date: new Date().toISOString().split('T')[0],
        encounter_time: new Date().toTimeString().slice(0, 5),
        chief_complaint,
        vital_signs,
        notes: `[Triage Priority: ${priority.toUpperCase()}] ${notes}`,
        status: 'open',
      });
      toast({ title: 'Triage saved', description: 'Patient triage has been recorded.' });
      qc.invalidateQueries({ queryKey: ['encounters'] });
    } finally {
      setTriageSubmitting(false);
      setTriageOpen(false);
      setTriagePatient(null);
      setNewPatient(null);
    }
  };

  const filtered = patients.filter(p =>
    `${p.first_name} ${p.last_name} ${p.phone || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'name', label: 'Patient Name', render: (r) => <span className="font-medium">{r.first_name} {r.last_name}</span> },
    { key: 'gender', label: 'Gender', render: (r) => <span className="capitalize">{r.gender}</span> },
    { key: 'phone', label: 'Phone' },
    { key: 'blood_type', label: 'Blood Type' },
    { key: 'insurance_provider', label: 'Insurance' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', render: (r) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={e => { e.stopPropagation(); setEditing(r); setOpen(true); }}>
            <Pencil className="w-4 h-4 mr-2" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={e => openTriage(r, e)}>
            <Activity className="w-4 h-4 mr-2" /> Triage
          </DropdownMenuItem>
          <DropdownMenuItem onClick={e => { e.stopPropagation(); setEncountersPatient(r); setEncountersOpen(true); }}>
            <ClipboardList className="w-4 h-4 mr-2" /> View Encounters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )},
  ];

  return (
    <div>
      <PageHeader title="Patients" subtitle="Manage patient records" actionLabel="Add Patient" onAction={() => { setEditing(null); setOpen(true); }} />
      <div className="mb-4 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <DataTable columns={columns} data={filtered} isLoading={isLoading} onRowClick={(r) => { setEditing(r); setOpen(true); }} emptyMessage="No patients found" />
      <PostRegistrationPrompt
        open={promptOpen}
        onOpenChange={(v) => { setPromptOpen(v); if (!v) setNewPatient(null); }}
        patient={newPatient}
        onTriage={() => { setPromptOpen(false); setTriageOpen(true); }}
      />
      <TriageDialog
        open={triageOpen}
        onOpenChange={(v) => { setTriageOpen(v); if (!v) { setTriagePatient(null); setNewPatient(null); } }}
        patient={triagePatient || newPatient}
        onSubmit={handleTriage}
        isSubmitting={triageSubmitting}
      />
      <PatientEncountersDialog
        open={encountersOpen}
        onOpenChange={(v) => { setEncountersOpen(v); if (!v) setEncountersPatient(null); }}
        patient={encountersPatient}
      />
      <PatientRegistrationDialog
        open={open}
        onOpenChange={setOpen}
        patient={editing}
        onSubmit={(patientData, paymentData) => mutation.mutate({ patientData, paymentData })}
        isSubmitting={mutation.isPending}
      />
    </div>
  );
}