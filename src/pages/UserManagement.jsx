import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import RolesManager from '@/components/staff/RolesManager';
import ChangePasswordDialog from '@/components/staff/ChangePasswordDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, Loader2, ShieldAlert, KeyRound, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

const roleColors = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  user: 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [newRole, setNewRole] = useState('user');
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdUser, setPwdUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const filtered = users.filter(u =>
    `${u.full_name || ''} ${u.email || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'full_name', label: 'Name', render: (r) => <span className="font-medium">{r.full_name || '—'}</span> },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (r) => (
      <Badge variant="outline" className={roleColors[r.role] || 'bg-gray-100 text-gray-700'}>
        {r.role?.replace(/\b\w/g, l => l.toUpperCase()) || 'User'}
      </Badge>
    )},
    { key: 'created_date', label: 'Joined', render: (r) => r.created_date ? new Date(r.created_date).toLocaleDateString() : '—' },
    { key: 'actions', label: '', render: (r) => (
      r.id === currentUser?.id ? null : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={e => { e.stopPropagation(); openEdit(r); }}>
              Edit Role
            </DropdownMenuItem>
            <DropdownMenuItem onClick={e => { e.stopPropagation(); setPwdUser(r); setPwdOpen(true); }}>
              <KeyRound className="w-4 h-4 mr-2" /> Change Password
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    )},
  ];

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);
      toast({ title: 'Invitation sent', description: `${inviteEmail} will receive an email to set up their account.` });
      setInviteOpen(false);
      setInviteEmail('');
      setInviteRole('user');
      qc.invalidateQueries({ queryKey: ['users'] });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.entities.User.update(selectedUser.id, { role: newRole });
      toast({ title: 'Role updated' });
      setEditOpen(false);
      qc.invalidateQueries({ queryKey: ['users'] });
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (password) => {
    setPwdLoading(true);
    try {
      await base44.entities.User.update(pwdUser.id, { password });
      toast({ title: 'Password updated successfully' });
      setPwdOpen(false);
      setPwdUser(null);
    } catch (err) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setPwdLoading(false);
    }
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setNewRole(user.role || 'user');
    setEditOpen(true);
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-muted-foreground">
        <ShieldAlert className="w-12 h-12" />
        <p className="text-lg font-medium">Admin access required</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="User Management" subtitle="Manage users, roles and permissions" actionLabel="Invite User" onAction={() => setInviteOpen(true)} icon={UserPlus} />

      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="mb-4 max-w-sm relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <DataTable columns={columns} data={filtered} isLoading={isLoading} emptyMessage="No users found" />
        </TabsContent>

        <TabsContent value="roles">
          <RolesManager />
        </TabsContent>
      </Tabs>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5" /> Invite New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address *</Label>
              <Input type="email" placeholder="user@example.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required />
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Role *</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">The user will receive an email invitation to set up their account.</p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit User Role</DialogTitle></DialogHeader>
          <form onSubmit={handleRoleUpdate} className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Editing: <span className="font-medium text-foreground">{selectedUser?.full_name || selectedUser?.email}</span>
            </p>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Update Role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password */}
      <ChangePasswordDialog
        open={pwdOpen}
        onOpenChange={setPwdOpen}
        staff={pwdUser ? { first_name: pwdUser.full_name || pwdUser.email, last_name: '' } : null}
        onSubmit={handlePasswordChange}
        isSubmitting={pwdLoading}
      />
    </div>
  );
}