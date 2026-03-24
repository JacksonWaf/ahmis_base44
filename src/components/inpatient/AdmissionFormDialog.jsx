import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const wards = ['general','medical','icu','pediatrics','maternity','surgical','emergency','cardiology','neurology','orthopedics'];
const today = () => new Date().toISOString().slice(0, 10);

export default function AdmissionFormDialog({ open, onOpenChange, patients, onSave, isLoading, editing }) {
  const [form, setForm] = useState({ patient_id: '', patient_name: '', ward: 'general', bed_number: '', admitting_doctor: '', admission_date: today(), admission_reason: '', diagnosis: '', notes: '' });

  useEffect(() => {
    if (editing) setForm({ ...editing });
    else setForm({ patient_id: '', patient_name: '', ward: 'general', bed_number: '', admitting_doctor: '', admission_date: today(), admission_reason: '', diagnosis: '', notes: '' });
  }, [editing, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectPatient = (id) => {
    const p = patients.find(p => p.id === id);
    if (p) set('patient_id', id) || setForm(f => ({ ...f, patient_id: id, patient_name: `${p.first_name} ${p.last_name}` }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{editing ? 'Update Admission' : 'New Admission'}</DialogTitle></DialogHeader>
        <div className="space-y-3 py-1">
          <div><Label className="text-xs text-muted-foreground mb-1 block">Patient</Label>
            <Select value={form.patient_id} onValueChange={selectPatient}>
              <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
              <SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs text-muted-foreground mb-1 block">Ward</Label>
              <Select value={form.ward} onValueChange={v => set('ward', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{wards.map(w => <SelectItem key={w} value={w} className="capitalize">{w}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs text-muted-foreground mb-1 block">Bed Number</Label><Input placeholder="e.g. A-12" value={form.bed_number} onChange={e => set('bed_number', e.target.value)} /></div>
            <div><Label className="text-xs text-muted-foreground mb-1 block">Admission Date</Label><Input type="date" value={form.admission_date} onChange={e => set('admission_date', e.target.value)} /></div>
            <div><Label className="text-xs text-muted-foreground mb-1 block">Admitting Doctor</Label><Input placeholder="Doctor name" value={form.admitting_doctor} onChange={e => set('admitting_doctor', e.target.value)} /></div>
          </div>
          <div><Label className="text-xs text-muted-foreground mb-1 block">Reason for Admission</Label><Input placeholder="Chief complaint / reason" value={form.admission_reason} onChange={e => set('admission_reason', e.target.value)} /></div>
          <div><Label className="text-xs text-muted-foreground mb-1 block">Diagnosis</Label><Input placeholder="Working/confirmed diagnosis" value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} /></div>
          <div><Label className="text-xs text-muted-foreground mb-1 block">Notes</Label><Textarea placeholder="Clinical notes..." value={form.notes} onChange={e => set('notes', e.target.value)} className="min-h-[70px]" /></div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!form.patient_name || isLoading} onClick={() => onSave(form)}>{editing ? 'Update' : 'Admit Patient'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}