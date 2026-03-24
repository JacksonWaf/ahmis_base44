import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const roles = ['doctor','nurse','pharmacist','lab_technician','radiologist','surgeon','anesthesiologist','physiotherapist','admin','other'];
const departments = ['general','cardiology','neurology','orthopedics','pediatrics','dermatology','ophthalmology','ent','surgery','emergency','radiology','laboratory','pharmacy','admin'];
const shifts = ['morning','afternoon','night','rotating'];

const defaultForm = {
  first_name: '', last_name: '', username: '', password: '',
  role: '', specialization: '', department: '', phone: '', email: '',
  license_number: '', hire_date: '', shift: '', qualification: '',
  experience_years: '', status: 'active',
};

export default function StaffFormDialog({ open, onOpenChange, staff, onSubmit, isSubmitting, customRoles = [] }) {
  const [form, setForm] = useState(defaultForm);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open) setForm(staff ? { ...defaultForm, ...staff, password: '' } : { ...defaultForm });
  }, [open, staff]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...form };
    if (!data.password) delete data.password; // don't overwrite if blank on edit
    onSubmit(data);
  };

  const allRoles = [
    ...roles.map(r => ({ value: r, label: r.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) })),
    ...customRoles.map(r => ({ value: r.name, label: r.name })),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{staff ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Personal Info */}
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
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Role *</Label>
              <Select value={form.role} onValueChange={v => set('role', v)}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {allRoles.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Department</Label>
              <Select value={form.department} onValueChange={v => set('department', v)}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => <SelectItem key={d} value={d}>{d.replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Specialization</Label>
              <Input value={form.specialization} onChange={e => set('specialization', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Shift</Label>
              <Select value={form.shift} onValueChange={v => set('shift', v)}>
                <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                <SelectContent>
                  {shifts.map(s => <SelectItem key={s} value={s}>{s.replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
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
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">License #</Label>
              <Input value={form.license_number} onChange={e => set('license_number', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Hire Date</Label>
              <Input type="date" value={form.hire_date} onChange={e => set('hire_date', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Qualification</Label>
              <Input value={form.qualification} onChange={e => set('qualification', e.target.value)} />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Experience (Years)</Label>
              <Input type="number" min={0} value={form.experience_years} onChange={e => set('experience_years', Number(e.target.value))} />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Credentials */}
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <p className="text-sm font-semibold">Login Credentials</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Username {!staff && '*'}</Label>
                <Input
                  value={form.username}
                  onChange={e => set('username', e.target.value)}
                  placeholder="e.g. dr.john"
                  required={!staff}
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Password {!staff ? '*' : '(leave blank to keep current)'}
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder={staff ? '••••••••' : 'Enter password'}
                    required={!staff}
                    className="pr-10"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(p => !p)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {staff ? 'Update Staff' : 'Add Staff'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}