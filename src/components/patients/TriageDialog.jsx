import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Activity } from 'lucide-react';

const priorityColors = {
  green: 'bg-green-100 text-green-800 border-green-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  orange: 'bg-orange-100 text-orange-800 border-orange-300',
  red: 'bg-red-100 text-red-800 border-red-300',
};

export default function TriageDialog({ open, onOpenChange, patient, onSubmit, isSubmitting }) {
  const [form, setForm] = useState({
    chief_complaint: '',
    priority: 'green',
    temperature: '',
    blood_pressure: '',
    pulse_rate: '',
    respiratory_rate: '',
    oxygen_saturation: '',
    weight: '',
    notes: '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const { chief_complaint, priority, notes, ...vitals } = form;
    onSubmit({ chief_complaint, priority, notes, vital_signs: vitals });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Triage — {patient?.first_name} {patient?.last_name}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Chief Complaint *</Label>
            <Textarea
              value={form.chief_complaint}
              onChange={e => set('chief_complaint', e.target.value)}
              placeholder="Describe presenting complaint..."
              className="min-h-[70px]"
              required
            />
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-2 block">Triage Priority</Label>
            <div className="grid grid-cols-4 gap-2">
              {['green', 'yellow', 'orange', 'red'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => set('priority', p)}
                  className={`py-2 rounded-lg border-2 text-xs font-semibold capitalize transition-all ${
                    form.priority === p ? priorityColors[p] + ' border-current scale-105' : 'border-border text-muted-foreground'
                  }`}
                >
                  {p === 'green' ? '🟢 Minor' : p === 'yellow' ? '🟡 Delayed' : p === 'orange' ? '🟠 Urgent' : '🔴 Critical'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold mb-2 block">Vital Signs</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Temperature (°C)</Label>
                <Input placeholder="e.g. 37.0" value={form.temperature} onChange={e => set('temperature', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Blood Pressure (mmHg)</Label>
                <Input placeholder="e.g. 120/80" value={form.blood_pressure} onChange={e => set('blood_pressure', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Pulse Rate (bpm)</Label>
                <Input placeholder="e.g. 72" value={form.pulse_rate} onChange={e => set('pulse_rate', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Respiratory Rate</Label>
                <Input placeholder="e.g. 16" value={form.respiratory_rate} onChange={e => set('respiratory_rate', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">O₂ Saturation (%)</Label>
                <Input placeholder="e.g. 98" value={form.oxygen_saturation} onChange={e => set('oxygen_saturation', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Weight (kg)</Label>
                <Input placeholder="e.g. 70" value={form.weight} onChange={e => set('weight', e.target.value)} />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Additional Notes</Label>
            <Textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any additional observations..."
              className="min-h-[60px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Skip</Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Triage
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}