import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useFacility } from '@/lib/FacilityContext';

const DEPARTMENTS = ['general','cardiology','neurology','orthopedics','pediatrics','dermatology','ophthalmology','ent','surgery','emergency'];
const TIME_SLOTS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'];

export default function BookingDialog({ open, onOpenChange, initialData, onSubmit, isSubmitting }) {
  const [form, setForm] = useState({});
  const [takenSlots, setTakenSlots] = useState([]);
  const { facilityId } = useFacility();

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors', facilityId],
    queryFn: () => base44.entities.HealthWorker.filter({ role: 'doctor', facility_id: facilityId }),
    enabled: !!facilityId,
  });
  const { data: patients = [] } = useQuery({
    queryKey: ['patients', facilityId],
    queryFn: () => base44.entities.Patient.filter({ facility_id: facilityId }),
    enabled: !!facilityId,
  });
  const { data: allAppointments = [] } = useQuery({
    queryKey: ['appointments', facilityId],
    queryFn: () => base44.entities.Appointment.filter({ facility_id: facilityId }),
    enabled: !!facilityId,
  });

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...initialData } : { status: 'scheduled', date: format(new Date(), 'yyyy-MM-dd') });
    }
  }, [open, initialData]);

  useEffect(() => {
    if (form.doctor_name && form.date) {
      const taken = allAppointments
        .filter(a => a.doctor_name === form.doctor_name && a.date === form.date && a.status !== 'cancelled' && a.id !== initialData?.id)
        .map(a => a.time);
      setTakenSlots(taken);
    } else {
      setTakenSlots([]);
    }
  }, [form.doctor_name, form.date, allAppointments]);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Appointment' : 'Book Appointment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Patient */}
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Patient *</Label>
              <Select value={form.patient_name || ''} onValueChange={v => {
                const p = patients.find(x => `${x.first_name} ${x.last_name}` === v);
                set('patient_name', v);
                if (p) set('patient_id', p.id);
              }}>
                <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => {
                    const name = `${p.first_name} ${p.last_name}`;
                    return <SelectItem key={p.id} value={name}>{name}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Department</Label>
              <Select value={form.department || ''} onValueChange={v => set('department', v)}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(d => <SelectItem key={d} value={d} className="capitalize">{d.charAt(0).toUpperCase() + d.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Doctor */}
            <div className="col-span-2">
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Doctor *</Label>
              <Select value={form.doctor_name || ''} onValueChange={v => {
                const d = doctors.find(x => `Dr. ${x.first_name} ${x.last_name}` === v);
                set('doctor_name', v);
                if (d) set('doctor_id', d.id);
              }}>
                <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                <SelectContent>
                  {doctors.map(d => {
                    const name = `Dr. ${d.first_name} ${d.last_name}`;
                    return (
                      <SelectItem key={d.id} value={name}>
                        {name} {d.specialization ? `— ${d.specialization}` : ''} ({d.department})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date *</Label>
              <Input type="date" value={form.date || ''} onChange={e => set('date', e.target.value)} required min={format(new Date(), 'yyyy-MM-dd')} />
            </div>

            {/* Status (edit only) */}
            {initialData && (
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</Label>
                <Select value={form.status || 'scheduled'} onValueChange={v => set('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['scheduled','in_progress','completed','cancelled','no_show'].map(s => (
                      <SelectItem key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Time Slots */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Select Time Slot
              {form.doctor_name && form.date && <span className="ml-1 text-muted-foreground">(grey = booked)</span>}
            </Label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {TIME_SLOTS.map(slot => {
                const taken = takenSlots.includes(slot);
                const selected = form.time === slot;
                return (
                  <button
                    type="button"
                    key={slot}
                    disabled={taken}
                    onClick={() => set('time', slot)}
                    className={cn(
                      "rounded-lg border text-xs py-2 font-medium transition-all",
                      taken && "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through",
                      selected && !taken && "bg-primary text-primary-foreground border-primary",
                      !selected && !taken && "hover:bg-primary/10 hover:border-primary/50"
                    )}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reason & Notes */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Reason for Visit</Label>
              <Input value={form.reason || ''} onChange={e => set('reason', e.target.value)} placeholder="Chief complaint / reason" />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Notes</Label>
              <Textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} placeholder="Additional notes..." className="min-h-[70px]" />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || !form.patient_name || !form.doctor_name || !form.date}>
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {initialData ? 'Update Appointment' : 'Confirm Booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}