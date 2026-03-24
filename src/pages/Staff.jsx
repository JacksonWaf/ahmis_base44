import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import StaffFormDialog from '@/components/staff/StaffFormDialog';
import ChangePasswordDialog from '@/components/staff/ChangePasswordDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Pencil, KeyRound } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useFacility } from '@/lib/FacilityContext';

const columns_def = (onEdit, onChangePassword) => [
  { key: 'name', label: 'Name', render: (r) => <span className="font-medium">{r.first_name} {r.last_name}</span> },
  { key: 'username', label: 'Username', render: (r) => <span className="text-muted-foreground">{r.username || '—'}</span> },
  { key: 'role', label: 'Role', render: (r) => <span className="capitalize">{r.role?.replace(/_/g, ' ')}</span> },
  { key: 'department', label: 'Department', render: (r) => <span className="capitalize">{r.department || '—'}</span> },
  { key: 'phone', label: 'Phone' },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'actions', label: '', render: (r) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={e => { e.stopPropagation(); onEdit(r); }}>
          <Pencil className="w-4 h-4 mr-2" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={e => { e.stopPropagation(); onChangePassword(r); }}>
          <KeyRound className="w-4 h-4 mr-2" /> Change Password
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )},
];

export default function Staff() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdStaff, setPwdStaff] = useState(null);
  const qc = useQueryClient();
  const { toast } = useToast();
  const { facilityId } = useFacility();

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['staff', facilityId],
    queryFn: () => base44.entities.HealthWorker.filter({ facility_id: facilityId }, '-created_date'),
    enabled: !!facilityId,
  });

  const { data: customRoles = [] } = useQuery({
    queryKey: ['systemRoles'],
    queryFn: () => base44.entities.SystemRole.list(),
  });

  const mutation = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.HealthWorker.update(editing.id, data)
      : base44.entities.HealthWorker.create({ ...data, facility_id: facilityId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] });
      setOpen(false);
      setEditing(null);
      toast({ title: editing ? 'Staff updated' : 'Staff added' });
    },
  });

  const passwordMutation = useMutation({
    mutationFn: ({ id, password }) => base44.entities.HealthWorker.update(id, { password }),
    onSuccess: () => {
      setPwdOpen(false);
      setPwdStaff(null);
      toast({ title: 'Password updated successfully' });
    },
  });

  const filtered = staff.filter(s =>
    `${s.first_name} ${s.last_name} ${s.role} ${s.username || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const onEdit = (r) => { setEditing(r); setOpen(true); };
  const onChangePassword = (r) => { setPwdStaff(r); setPwdOpen(true); };

  return (
    <div>
      <PageHeader title="Health Workers" subtitle="Staff management and directory" actionLabel="Add Staff" onAction={() => { setEditing(null); setOpen(true); }} />
      <div className="mb-4 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <DataTable columns={columns_def(onEdit, onChangePassword)} data={filtered} isLoading={isLoading} emptyMessage="No staff found" />
      <StaffFormDialog
        open={open}
        onOpenChange={setOpen}
        staff={editing}
        onSubmit={(d) => mutation.mutate(d)}
        isSubmitting={mutation.isPending}
        customRoles={customRoles}
      />
      <ChangePasswordDialog
        open={pwdOpen}
        onOpenChange={setPwdOpen}
        staff={pwdStaff}
        onSubmit={(password) => passwordMutation.mutate({ id: pwdStaff.id, password })}
        isSubmitting={passwordMutation.isPending}
      />
    </div>
  );
}