import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useFacility } from '@/lib/FacilityContext';
import PageHeader from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Plus, Pencil, MapPin, Phone, Mail, Loader2, ShieldAlert, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const FACILITY_TYPES = ['hospital', 'clinic', 'health_center', 'laboratory', 'pharmacy'];
const defaultForm = { name: '', type: 'hospital', address: '', phone: '', email: '', license_number: '', status: 'active' };

export default function Facilities() {
  const { user } = useAuth();
  const { facilityId, selectFacility } = useFacility();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: facilities = [], isLoading } = useQuery({
    queryKey: ['facilities'],
    queryFn: () => base44.entities.Facility.list(),
  });

  const mutation = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.Facility.update(editing.id, data)
      : base44.entities.Facility.create(data),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['facilities'] });
      setOpen(false);
      toast({ title: editing ? 'Facility updated' : 'Facility created' });
    },
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openCreate = () => { setEditing(null); setForm(defaultForm); setOpen(true); };
  const openEdit = (f) => { setEditing(f); setForm({ name: f.name, type: f.type || 'hospital', address: f.address || '', phone: f.phone || '', email: f.email || '', license_number: f.license_number || '', status: f.status || 'active' }); setOpen(true); };

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
        <ShieldAlert className="w-12 h-12" />
        <p className="text-lg font-medium">Admin access required</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Facilities" subtitle="Manage hospitals and clinics" actionLabel="Add Facility" onAction={openCreate} icon={Plus} />

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : facilities.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No facilities yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {facilities.map(f => (
            <div key={f.id} className={`border rounded-xl p-5 space-y-3 bg-card transition-all ${f.id === facilityId ? 'border-primary ring-1 ring-primary' : 'border-border'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{f.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{f.type?.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {f.id === facilityId && <Badge className="bg-primary/10 text-primary border-primary text-xs">Active</Badge>}
                  <Badge variant="outline" className={f.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500'}>
                    {f.status}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                {f.address && <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {f.address}</p>}
                {f.phone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {f.phone}</p>}
                {f.email && <p className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {f.email}</p>}
                {f.license_number && <p className="text-xs">License: {f.license_number}</p>}
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEdit(f)}>
                  <Pencil className="w-3 h-3" /> Edit
                </Button>
                {f.id !== facilityId && (
                  <Button size="sm" className="flex-1 gap-1" onClick={() => selectFacility(f)}>
                    <CheckCircle className="w-3 h-3" /> Switch To
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Facility' : 'Create Facility'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Facility Name *</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type</Label>
                <Select value={form.type} onValueChange={v => set('type', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FACILITY_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</Label>
                <Select value={form.status} onValueChange={v => set('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Address</Label>
              <Input value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone</Label>
                <Input value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</Label>
                <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">License Number</Label>
              <Input value={form.license_number} onChange={e => set('license_number', e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending} className="gap-2">
                {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}