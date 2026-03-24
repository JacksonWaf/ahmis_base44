import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Thermometer, Heart, Wind, Activity } from 'lucide-react';

const today = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);

export default function VitalsDialog({ open, onOpenChange, admission, onSave, isLoading }) {
  const [form, setForm] = useState({
    temperature: '', blood_pressure: '', pulse_rate: '',
    respiratory_rate: '', oxygen_saturation: '', weight: '',
    blood_glucose: '', recorded_by: '', notes: '',
    recorded_date: today(), recorded_time: nowTime(),
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    onSave({ ...form, patient_name: admission.patient_name, patient_id: admission.patient_id, admission_id: admission.id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Record Vitals — {admission?.patient_name}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          <div><Label className="text-xs text-muted-foreground mb-1 block">Date</Label><Input type="date" value={form.recorded_date} onChange={e => set('recorded_date', e.target.value)} /></div>
          <div><Label className="text-xs text-muted-foreground mb-1 block">Time</Label><Input type="time" value={form.recorded_time} onChange={e => set('recorded_time', e.target.value)} /></div>
          <div><Label className="text-xs text-muted-foreground mb-1 block">Temperature (°C)</Label><Input placeholder="e.g. 37.2" value={form.temperature} onChange={e => set('temperature', e.target.value)} /></div>
          <div><Label className="text-xs text-muted-foreground mb-1 block">Blood Pressure</Label><Input placeholder="e.g. 120/80" value={form.blood_pressure} onChange={e => set('blood_pressure', e.target.value)} /></div>
          <div><Label className="text-xs text-muted-foreground mb-1 block">Pulse Rate (bpm)</Label><Input placeholder="e.g. 72" value={form.pulse_rate} onChange={e => set('pulse_rate', e.target.value)} /></div>
          <div><Label className="text-xs text-muted-foreground mb-1 block">Resp. Rate (/min)</Label><Input placeholder="e.g. 16" value={form.respiratory_rate} onChange={e => set('respiratory_rate', e.target.value)} /></div>
          <div><Label className="text-xs text-muted-foreground mb-1 block">O₂ Saturation (%)</Label><Input placeholder="e.g. 98" value={form.oxygen_saturation} onChange={e => set('oxygen_saturation', e.target.value)} /></div>
          <div><Label className="text-xs text-muted-foreground mb-1 block">Weight (kg)</Label><Input placeholder="e.g. 70" value={form.weight} onChange={e => set('weight', e.target.value)} /></div>
          <div><Label className="text-xs text-muted-foreground mb-1 block">Blood Glucose (mg/dL)</Label><Input placeholder="e.g. 95" value={form.blood_glucose} onChange={e => set('blood_glucose', e.target.value)} /></div>
          <div><Label className="text-xs text-muted-foreground mb-1 block">Recorded By</Label><Input placeholder="Clinician name" value={form.recorded_by} onChange={e => set('recorded_by', e.target.value)} /></div>
          <div className="col-span-2"><Label className="text-xs text-muted-foreground mb-1 block">Notes</Label><Textarea placeholder="Any clinical observations..." value={form.notes} onChange={e => set('notes', e.target.value)} className="min-h-[60px]" /></div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading}>Save Vitals</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}