import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CreditCard } from 'lucide-react';

const defaultPatient = {
  first_name: '', last_name: '', date_of_birth: '', gender: '', phone: '', email: '',
  blood_type: '', address: '', insurance_provider: '', insurance_number: '',
  emergency_contact_name: '', emergency_contact_phone: '', allergies: '', status: 'active',
};

const defaultPayment = {
  consultation_fee: 50,
  payment_method: 'cash',
  payment_status: 'paid',
  notes: '',
};

export default function PatientRegistrationDialog({ open, onOpenChange, patient, onSubmit, isSubmitting }) {
  const [form, setForm] = useState(defaultPatient);
  const [payment, setPayment] = useState(defaultPayment);
  const [includePayment, setIncludePayment] = useState(true);

  useEffect(() => {
    if (open) {
      setForm(patient ? { ...defaultPatient, ...patient } : { ...defaultPatient });
      setPayment({ ...defaultPayment });
      setIncludePayment(!patient); // only show payment for new patients
    }
  }, [open, patient]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setP = (k, v) => setPayment(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form, includePayment && !patient ? payment : null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{patient ? 'Edit Patient' : 'Register New Patient'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Patient Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">First Name *</Label>
              <Input value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Last Name *</Label>
              <Input value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Date of Birth</Label>
              <Input type="date" value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Gender</Label>
              <Select value={form.gender} onValueChange={v => set('gender', v)}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone</Label>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</Label>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Blood Type</Label>
              <Select value={form.blood_type} onValueChange={v => set('blood_type', v)}>
                <SelectTrigger><SelectValue placeholder="Select blood type" /></SelectTrigger>
                <SelectContent>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="admitted">Admitted</SelectItem>
                  <SelectItem value="discharged">Discharged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Address</Label>
              <Input value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Insurance Provider</Label>
              <Input value={form.insurance_provider} onChange={e => set('insurance_provider', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Insurance Number</Label>
              <Input value={form.insurance_number} onChange={e => set('insurance_number', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Emergency Contact</Label>
              <Input value={form.emergency_contact_name} onChange={e => set('emergency_contact_name', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Emergency Phone</Label>
              <Input value={form.emergency_contact_phone} onChange={e => set('emergency_contact_phone', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Allergies</Label>
              <Textarea value={form.allergies} onChange={e => set('allergies', e.target.value)} className="min-h-[70px]" />
            </div>
          </div>

          {/* Consultation Payment - only for new patients */}
          {!patient && (
            <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Consultation Payment</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Consultation Fee (GMD) *</Label>
                  <Input
                    type="number" min={0} step="0.01"
                    value={payment.consultation_fee}
                    onChange={e => setP('consultation_fee', Number(e.target.value))}
                    required={includePayment}
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Payment Method</Label>
                  <Select value={payment.payment_method} onValueChange={v => setP('payment_method', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['cash','card','insurance','bank_transfer','mobile_money'].map(m => (
                        <SelectItem key={m} value={m}>{m.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Payment Status</Label>
                  <Select value={payment.payment_status} onValueChange={v => setP('payment_status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="waived">Waived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-3">
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Payment Notes</Label>
                  <Input value={payment.notes} onChange={e => setP('notes', e.target.value)} placeholder="Optional notes..." />
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t">
                <span className="text-sm text-muted-foreground">Total Due</span>
                <span className="text-lg font-bold text-primary">GMD {Number(payment.consultation_fee || 0).toFixed(2)}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {patient ? 'Update Patient' : 'Register & Charge'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}