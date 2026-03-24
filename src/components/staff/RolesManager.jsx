import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, ShieldCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const MODULES = ['Dashboard','Patients','Appointments','OPD','Laboratory','Imaging','Pharmacy','Inventory','Billing','Staff','Inpatient','EMR','Analytics','Patient Portal'];

const defaultForm = { name: '', description: '', permissions: [], color: '#6366f1' };

export default function RolesManager() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['systemRoles'],
    queryFn: () => base44.entities.SystemRole.list(),
  });

  const mutation = useMutation({
    mutationFn: (data) => editing ? base44.entities.SystemRole.update(editing.id, data) : base44.entities.SystemRole.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['systemRoles'] }); setOpen(false); toast({ title: editing ? 'Role updated' : 'Role created' }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SystemRole.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['systemRoles'] }); toast({ title: 'Role deleted' }); },
  });

  const openCreate = () => { setEditing(null); setForm(defaultForm); setOpen(true); };
  const openEdit = (role) => { setEditing(role); setForm({ name: role.name, description: role.description || '', permissions: role.permissions || [], color: role.color || '#6366f1' }); setOpen(true); };

  const togglePermission = (mod) => {
    setForm(p => ({
      ...p,
      permissions: p.permissions.includes(mod) ? p.permissions.filter(m => m !== mod) : [...p.permissions, mod]
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> Add Role</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Loading roles...</div>
      ) : roles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No custom roles yet. Click "Add Role" to create one.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {roles.map(role => (
            <div key={role.id} className="border rounded-lg p-4 space-y-3 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" style={{ color: role.color || '#6366f1' }} />
                  <span className="font-semibold">{role.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(role)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(role.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              {role.description && <p className="text-sm text-muted-foreground">{role.description}</p>}
              {role.permissions?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map(p => (
                    <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Role' : 'Create Role'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Role Name *</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="e.g. Senior Doctor" />
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="h-9 w-12 rounded border border-input cursor-pointer" />
                  <Input value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="flex-1" />
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</Label>
              <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe what this role does..." className="min-h-[70px]" />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Module Access Permissions</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {MODULES.map(mod => (
                  <label key={mod} className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer text-sm transition-colors ${form.permissions.includes(mod) ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted-foreground hover:bg-muted/30'}`}>
                    <input type="checkbox" className="sr-only" checked={form.permissions.includes(mod)} onChange={() => togglePermission(mod)} />
                    {mod}
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending} className="gap-2">
                {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? 'Update Role' : 'Create Role'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}