import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, XCircle } from 'lucide-react';
import { format, parseISO, isFuture, isToday } from 'date-fns';
import StatusBadge from '@/components/shared/StatusBadge';

export default function PortalAppointments({ patientName }) {
  const qc = useQueryClient();
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['portal-appointments', patientName],
    queryFn: () => base44.entities.Appointment.filter({ patient_name: patientName }),
    enabled: !!patientName,
  });

  const cancel = useMutation({
    mutationFn: (id) => base44.entities.Appointment.update(id, { status: 'cancelled' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portal-appointments', patientName] }),
  });

  const upcoming = appointments
    .filter(a => a.status === 'scheduled' && a.date && (isFuture(parseISO(a.date)) || isToday(parseISO(a.date))))
    .sort((a, b) => a.date.localeCompare(b.date));

  const past = appointments
    .filter(a => !upcoming.find(u => u.id === a.id))
    .sort((a, b) => b.date.localeCompare(a.date));

  if (isLoading) return <div className="text-sm text-muted-foreground py-8 text-center">Loading appointments...</div>;

  return (
    <div className="space-y-6">
      {/* Upcoming */}
      <div>
        <h3 className="font-semibold text-base mb-3">Upcoming Appointments</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-6 text-center">No upcoming appointments.</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map(a => (
              <Card key={a.id} className="p-4 border-l-4 border-l-primary shadow-sm">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{format(parseISO(a.date), 'EEEE, MMMM d, yyyy')}</span>
                      {isToday(parseISO(a.date)) && <Badge className="bg-primary/10 text-primary text-xs">Today</Badge>}
                    </div>
                    {a.time && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" /> {a.time}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-3.5 h-3.5" /> {a.doctor_name}
                      {a.department && <span className="capitalize">· {a.department}</span>}
                    </div>
                    {a.reason && <p className="text-sm text-muted-foreground">Reason: {a.reason}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={a.status} />
                    <Button size="sm" variant="outline" className="text-xs gap-1 text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => cancel.mutate(a.id)} disabled={cancel.isPending}>
                      <XCircle className="w-3 h-3" /> Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h3 className="font-semibold text-base mb-3 text-muted-foreground">Past Appointments</h3>
          <div className="space-y-2">
            {past.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/10 text-sm flex-wrap gap-2">
                <div>
                  <span className="font-medium">{a.date ? format(parseISO(a.date), 'MMM d, yyyy') : '—'}</span>
                  <span className="text-muted-foreground ml-2">{a.doctor_name} {a.time && `· ${a.time}`}</span>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}