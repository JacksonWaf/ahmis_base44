import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, CalendarDays, List, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import { useFacility } from '@/lib/FacilityContext';
import SmsReminderDialog from '@/components/appointments/SmsReminderDialog';
import StatusBadge from '@/components/shared/StatusBadge';
import DataTable from '@/components/shared/DataTable';
import BookingDialog from '@/components/appointments/BookingDialog';
import DoctorCalendar from '@/components/appointments/DoctorCalendar';
import StatCard from '@/components/shared/StatCard';

const columns = [
  { key: 'patient_name', label: 'Patient', render: r => <span className="font-medium">{r.patient_name}</span> },
  { key: 'doctor_name', label: 'Doctor' },
  { key: 'department', label: 'Department', render: r => <span className="capitalize">{r.department}</span> },
  { key: 'date', label: 'Date' },
  { key: 'time', label: 'Time' },
  { key: 'reason', label: 'Reason', render: r => <span className="text-muted-foreground text-xs">{r.reason || '—'}</span> },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
];

export default function Appointments() {
  const { facilityId } = useFacility();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [smsTarget, setSmsTarget] = useState(null);
  const qc = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', facilityId],
    queryFn: () => base44.entities.Appointment.filter({ facility_id: facilityId }, '-date'),
    enabled: !!facilityId,
  });
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors', facilityId],
    queryFn: () => base44.entities.HealthWorker.filter({ role: 'doctor', facility_id: facilityId }),
    enabled: !!facilityId,
  });

  const mutation = useMutation({
    mutationFn: (data) => editing
      ? base44.entities.Appointment.update(editing.id, data)
      : base44.entities.Appointment.create({ ...data, status: 'scheduled', facility_id: facilityId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['appointments'] }); setDialogOpen(false); setEditing(null); },
  });

  const quickStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Appointment.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  });

  const openNew = () => { setEditing(null); setDialogOpen(true); };
  const openEdit = (a) => { setEditing(a); setDialogOpen(true); };

  const filtered = appointments.filter(a =>
    `${a.patient_name} ${a.doctor_name} ${a.department || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const today = new Date().toISOString().slice(0, 10);
  const todayApts = appointments.filter(a => a.date === today);
  const scheduled = appointments.filter(a => a.status === 'scheduled').length;
  const confirmed = appointments.filter(a => a.status === 'completed').length;
  const cancelled = appointments.filter(a => a.status === 'cancelled').length;

  const listColumns = [
    ...columns,
    {
      key: 'actions', label: 'Actions', render: r => (
        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
          {r.status === 'scheduled' && (
            <>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                onClick={() => quickStatus.mutate({ id: r.id, status: 'completed' })}>
                <CheckCircle className="w-3 h-3" /> Confirm
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => quickStatus.mutate({ id: r.id, status: 'cancelled' })}>
                <XCircle className="w-3 h-3" /> Cancel
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => setSmsTarget(r)}>
                <MessageSquare className="w-3 h-3" /> SMS
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointment Scheduling</h1>
          <p className="text-muted-foreground text-sm mt-1">Book slots, manage doctor calendars, and update statuses</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="w-4 h-4" /> Book Appointment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Today's Appointments" value={todayApts.length} icon={CalendarDays} trendLabel="scheduled today" />
        <StatCard title="Scheduled" value={scheduled} icon={Clock} trendLabel="awaiting" />
        <StatCard title="Completed" value={confirmed} icon={CheckCircle} trendLabel="this period" />
        <StatCard title="Cancelled" value={cancelled} icon={XCircle} trendLabel="this period" />
      </div>

      <Tabs defaultValue="calendar">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <TabsList>
            <TabsTrigger value="calendar" className="gap-2"><CalendarDays className="w-4 h-4" /> Calendar</TabsTrigger>
            <TabsTrigger value="list" className="gap-2"><List className="w-4 h-4" /> List View</TabsTrigger>
          </TabsList>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 w-56" />
          </div>
        </div>

        <TabsContent value="calendar">
          <DoctorCalendar
            appointments={filtered}
            doctors={doctors}
            onEditAppointment={openEdit}
          />
        </TabsContent>

        <TabsContent value="list">
          <DataTable
            columns={listColumns}
            data={filtered}
            isLoading={isLoading}
            onRowClick={openEdit}
          />
        </TabsContent>
      </Tabs>

      <SmsReminderDialog
        open={!!smsTarget}
        onOpenChange={(v) => { if (!v) setSmsTarget(null); }}
        appointment={smsTarget}
      />
      <BookingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editing}
        onSubmit={(d) => mutation.mutate(d)}
        isSubmitting={mutation.isPending}
      />
    </div>
  );
}