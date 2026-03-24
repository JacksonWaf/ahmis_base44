import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Bed, Users, Activity, ClipboardList, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PatientWardCard from '@/components/inpatient/PatientWardCard';
import VitalsDialog from '@/components/inpatient/VitalsDialog';
import InpatientOrderDialog from '@/components/inpatient/InpatientOrderDialog';
import AdmissionFormDialog from '@/components/inpatient/AdmissionFormDialog';
import StatCard from '@/components/shared/StatCard';
import { useFacility } from '@/lib/FacilityContext';

const wards = ['all','general','medical','icu','pediatrics','maternity','surgical','emergency','cardiology','neurology','orthopedics'];

export default function Inpatient() {
  const qc = useQueryClient();
  const { facilityId } = useFacility();
  const [search, setSearch] = useState('');
  const [wardFilter, setWardFilter] = useState('all');
  const [admissionDialog, setAdmissionDialog] = useState(false);
  const [editingAdmission, setEditingAdmission] = useState(null);
  const [vitalsDialog, setVitalsDialog] = useState(false);
  const [vitalsTarget, setVitalsTarget] = useState(null);
  const [orderDialog, setOrderDialog] = useState(false);
  const [orderTarget, setOrderTarget] = useState(null);

  const { data: admissions = [], isLoading } = useQuery({
    queryKey: ['admissions', facilityId],
    queryFn: () => base44.entities.InpatientAdmission.filter({ facility_id: facilityId }, '-admission_date'),
    enabled: !!facilityId,
  });
  const { data: patients = [] } = useQuery({
    queryKey: ['patients', facilityId],
    queryFn: () => base44.entities.Patient.filter({ facility_id: facilityId }),
    enabled: !!facilityId,
  });
  const { data: vitals = [] } = useQuery({
    queryKey: ['vitals', facilityId],
    queryFn: () => base44.entities.VitalsRecord.filter({ facility_id: facilityId }, '-recorded_date'),
    enabled: !!facilityId,
  });

  const admitMutation = useMutation({
    mutationFn: (data) => editingAdmission
      ? base44.entities.InpatientAdmission.update(editingAdmission.id, data)
      : base44.entities.InpatientAdmission.create({ ...data, status: 'active', facility_id: facilityId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admissions'] }); setAdmissionDialog(false); setEditingAdmission(null); },
  });

  const vitalsMutation = useMutation({
    mutationFn: (data) => base44.entities.VitalsRecord.create({ ...data, facility_id: facilityId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vitals'] }); setVitalsDialog(false); },
  });

  const labMutation = useMutation({
    mutationFn: (data) => base44.entities.LabTest.create({ ...data, status: 'ordered', facility_id: facilityId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['labTests'] }); setOrderDialog(false); },
  });

  const imagingMutation = useMutation({
    mutationFn: (data) => base44.entities.ImagingOrder.create({ ...data, status: 'ordered', facility_id: facilityId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['imagingOrders'] }); setOrderDialog(false); },
  });

  const rxMutation = useMutation({
    mutationFn: (data) => base44.entities.Prescription.create({ ...data, status: 'pending', facility_id: facilityId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['prescriptions'] }); setOrderDialog(false); },
  });

  const dischargeMutation = useMutation({
    mutationFn: (id) => base44.entities.InpatientAdmission.update(id, { status: 'discharged', discharge_date: new Date().toISOString().slice(0, 10) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admissions'] }),
  });

  const active = admissions.filter(a => a.status === 'active');
  const icu = active.filter(a => a.ward === 'icu').length;
  const filtered = admissions.filter(a => {
    const matchSearch = `${a.patient_name} ${a.ward || ''} ${a.admitting_doctor || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchWard = wardFilter === 'all' || a.ward === wardFilter;
    return matchSearch && matchWard;
  });

  const openRecordVitals = (adm) => { setVitalsTarget(adm); setVitalsDialog(true); };
  const openNewOrder = (adm) => { setOrderTarget(adm); setOrderDialog(true); };
  const openEdit = (adm) => { setEditingAdmission(adm); setAdmissionDialog(true); };

  // Group by ward for ward view
  const byWard = wards.slice(1).reduce((acc, w) => {
    acc[w] = active.filter(a => a.ward === w);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inpatient Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage admitted patients, vitals, orders & ward allocation</p>
        </div>
        <Button onClick={() => { setEditingAdmission(null); setAdmissionDialog(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Admit Patient
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Admitted" value={active.length} icon={Bed} trendLabel="currently active" />
        <StatCard title="ICU Patients" value={icu} icon={AlertTriangle} trendLabel="critical care" />
        <StatCard title="Vitals Today" value={vitals.filter(v => v.recorded_date === new Date().toISOString().slice(0,10)).length} icon={Activity} trendLabel="recorded today" />
        <StatCard title="Discharged" value={admissions.filter(a => a.status === 'discharged').length} icon={Users} trendLabel="total" />
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search patient, doctor, ward..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={wardFilter} onValueChange={setWardFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {wards.map(w => <SelectItem key={w} value={w} className="capitalize">{w === 'all' ? 'All Wards' : w}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="patients">
        <TabsList className="mb-4">
          <TabsTrigger value="patients" className="gap-2"><Users className="w-4 h-4" /> All Patients</TabsTrigger>
          <TabsTrigger value="wards" className="gap-2"><Bed className="w-4 h-4" /> By Ward</TabsTrigger>
          <TabsTrigger value="vitals" className="gap-2"><Activity className="w-4 h-4" /> Vitals Log</TabsTrigger>
        </TabsList>

        <TabsContent value="patients">
          {isLoading ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12 bg-muted/20 rounded-xl">No admissions found.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map(a => (
                <PatientWardCard key={a.id} admission={a} onRecordVitals={openRecordVitals} onNewOrder={openNewOrder} onEdit={openEdit} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="wards">
          <div className="space-y-6">
            {wards.slice(1).map(w => byWard[w]?.length > 0 && (
              <div key={w}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold capitalize text-base">{w} Ward</h3>
                  <Badge variant="outline" className="text-xs">{byWard[w].length} patients</Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {byWard[w].map(a => (
                    <PatientWardCard key={a.id} admission={a} onRecordVitals={openRecordVitals} onNewOrder={openNewOrder} onEdit={openEdit} />
                  ))}
                </div>
              </div>
            ))}
            {Object.values(byWard).every(arr => arr.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-12 bg-muted/20 rounded-xl">No active admissions.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="vitals">
          {vitals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12 bg-muted/20 rounded-xl">No vitals recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {vitals.slice(0, 50).map(v => (
                <Card key={v.id} className="p-3 text-sm">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <span className="font-medium">{v.patient_name}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{v.recorded_date} {v.recorded_time}</span>
                      {v.recorded_by && <span className="text-muted-foreground text-xs ml-2">· {v.recorded_by}</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                    {v.temperature && <span>🌡 {v.temperature}°C</span>}
                    {v.blood_pressure && <span>💉 BP: {v.blood_pressure}</span>}
                    {v.pulse_rate && <span>❤️ PR: {v.pulse_rate} bpm</span>}
                    {v.respiratory_rate && <span>💨 RR: {v.respiratory_rate}/min</span>}
                    {v.oxygen_saturation && <span>🫁 SpO₂: {v.oxygen_saturation}%</span>}
                    {v.blood_glucose && <span>🍬 Glucose: {v.blood_glucose} mg/dL</span>}
                    {v.weight && <span>⚖️ {v.weight} kg</span>}
                  </div>
                  {v.notes && <p className="mt-1 text-xs text-muted-foreground italic">{v.notes}</p>}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AdmissionFormDialog
        open={admissionDialog}
        onOpenChange={(v) => { setAdmissionDialog(v); if (!v) setEditingAdmission(null); }}
        patients={patients}
        onSave={(data) => admitMutation.mutate(data)}
        isLoading={admitMutation.isPending}
        editing={editingAdmission}
      />
      <VitalsDialog
        open={vitalsDialog}
        onOpenChange={setVitalsDialog}
        admission={vitalsTarget}
        onSave={(data) => vitalsMutation.mutate(data)}
        isLoading={vitalsMutation.isPending}
      />
      <InpatientOrderDialog
        open={orderDialog}
        onOpenChange={setOrderDialog}
        admission={orderTarget}
        onSaveLab={(d) => labMutation.mutate(d)}
        onSaveImaging={(d) => imagingMutation.mutate(d)}
        onSavePrescription={(d) => rxMutation.mutate(d)}
        isLoading={labMutation.isPending || imagingMutation.isPending || rxMutation.isPending}
      />
    </div>
  );
}