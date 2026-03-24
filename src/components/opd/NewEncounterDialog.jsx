import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useFacility } from '@/lib/FacilityContext';

export default function NewEncounterDialog({ open, onOpenChange, onSubmit, isSubmitting }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [clinician, setClinician] = useState('');
  const { facilityId } = useFacility();

  const { data: patients = [] } = useQuery({
    queryKey: ['patients', facilityId],
    queryFn: () => base44.entities.Patient.filter({ facility_id: facilityId }),
    enabled: !!facilityId,
  });

  const { data: staff = [] } = useQuery({
    queryKey: ['staff', facilityId],
    queryFn: () => base44.entities.HealthWorker.filter({ facility_id: facilityId }),
    enabled: !!facilityId,
  });

  const doctors = staff.filter(s => s.role === 'doctor' || s.role === 'surgeon');

  useEffect(() => {
    if (!open) { setSearch(''); setSelected(null); setClinician(''); }
  }, [open]);

  const filteredPatients = patients.filter(p =>
    `${p.first_name} ${p.last_name} ${p.phone || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleStart = () => {
    if (!selected) return;
    const age = selected.date_of_birth
      ? `${new Date().getFullYear() - new Date(selected.date_of_birth).getFullYear()} yrs`
      : '';
    onSubmit({
      patient_id: selected.id,
      patient_name: `${selected.first_name} ${selected.last_name}`,
      patient_age: age,
      patient_gender: selected.gender,
      clinician,
      encounter_date: format(new Date(), 'yyyy-MM-dd'),
      encounter_time: format(new Date(), 'HH:mm'),
      status: 'open',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New OPD Encounter</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Attending Clinician</Label>
            <Select value={clinician} onValueChange={setClinician}>
              <SelectTrigger>
                <SelectValue placeholder="Select clinician" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map(d => (
                  <SelectItem key={d.id} value={`${d.first_name} ${d.last_name}`}>
                    {d.first_name} {d.last_name} — {d.specialization || d.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Search Patient</Label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Name or phone..."
                value={search}
                onChange={e => { setSearch(e.target.value); setSelected(null); }}
                className="pl-9"
              />
            </div>
            <div className="max-h-52 overflow-y-auto space-y-1.5 border rounded-lg p-2">
              {filteredPatients.slice(0, 10).map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors ${
                    selected?.id === p.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <span className="font-medium">{p.first_name} {p.last_name}</span>
                  <span className="ml-2 text-xs opacity-70">{p.phone} {p.blood_type && `• ${p.blood_type}`}</span>
                </button>
              ))}
              {filteredPatients.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No patients found</p>
              )}
            </div>
          </div>

          {selected && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
              <p className="font-medium">{selected.first_name} {selected.last_name}</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                {selected.gender} • DOB: {selected.date_of_birth || 'N/A'} • Blood: {selected.blood_type || 'N/A'}
                {selected.allergies && <span className="text-destructive"> • ⚠ Allergies: {selected.allergies}</span>}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleStart} disabled={!selected || isSubmitting} className="gap-2">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Start Encounter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}