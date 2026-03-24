import React, { useState } from 'react';
import { useFacility } from '@/lib/FacilityContext';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Plus, Loader2, MapPin, Phone, Mail } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const FACILITY_TYPES = ['hospital', 'clinic', 'health_center', 'laboratory', 'pharmacy'];

const defaultForm = { name: '', type: 'hospital', address: '', phone: '', email: '', license_number: '' };

export default function FacilitySelector() {
  const { facilities, isLoadingFacilities, selectFacility } = useFacility();
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const qc = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Facility.create({ ...data, status: 'active' }),
    onSuccess: (facility) => {
      qc.invalidateQueries({ queryKey: ['facilities'] });
      setCreateOpen(false);
      setForm(defaultForm);
      selectFacility(facility);
    },
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Select a Facility</h1>
          <p className="text-muted-foreground mt-1 text-sm">Choose the hospital or clinic you want to work in</p>
        </div>

        {isLoadingFacilities ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : facilities.filter(f => f.status === 'active').length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
            <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">No facilities configured yet</p>
            {user?.role === 'admin' && (
              <Button onClick={() => setCreateOpen(true)} className="mt-4 gap-2">
                <Plus className="w-4 h-4" /> Create First Facility
              </Button>
            )}
            {user?.role !== 'admin' && (
              <p className="text-sm text-muted-foreground mt-2">Please contact your administrator to set up a facility.</p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {facilities.filter(f => f.status === 'active').map(f => (
                <button
                  key={f.id}
                  onClick={() => selectFacility(f)}
                  className="p-5 border border-border rounded-xl text-left hover:border-primary hover:bg-primary/5 transition-all group text-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-base">{f.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{f.type?.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {f.address && <p className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {f.address}</p>}
                    {f.phone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3" /> {f.phone}</p>}
                    {f.email && <p className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {f.email}</p>}
                  </div>
                </button>
              ))}
            </div>
            {user?.role === 'admin' && (
              <Button variant="outline" onClick={() => setCreateOpen(true)} className="w-full gap-2">
                <Plus className="w-4 h-4" /> Add New Facility
              </Button>
            )}
          </>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" /> Create New Facility</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Facility Name *</Label>
              <Input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. City General Hospital" />
            </div>
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
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Address</Label>
              <Input value={form.address} onChange={e => set('address', e.target.value)} placeholder="Physical address" />
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
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending} className="gap-2">
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Create & Select
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}