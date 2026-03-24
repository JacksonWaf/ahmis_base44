import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge from '@/components/shared/StatusBadge';

export default function PortalMessages({ patientId, patientName, patientEmail, doctors }) {
  const qc = useQueryClient();
  const [subject, setSubject] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [message, setMessage] = useState('');
  const [expanded, setExpanded] = useState(null);

  const { data: messages = [] } = useQuery({
    queryKey: ['portal-messages', patientId],
    queryFn: () => base44.entities.PatientMessage.filter({ patient_id: patientId }),
    enabled: !!patientId,
  });

  const send = useMutation({
    mutationFn: () => base44.entities.PatientMessage.create({
      patient_id: patientId,
      patient_name: patientName,
      patient_email: patientEmail,
      doctor_name: doctorName,
      subject,
      message,
      direction: 'patient_to_doctor',
      status: 'unread',
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal-messages', patientId] });
      setSubject(''); setDoctorName(''); setMessage('');
    },
  });

  const sorted = [...messages].sort((a, b) => (b.created_date || '').localeCompare(a.created_date || ''));

  return (
    <div className="space-y-6">
      {/* Compose */}
      <Card className="p-5 shadow-sm border-primary/20 bg-primary/2">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" /> Message Your Doctor</h3>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Doctor</Label>
            <Select value={doctorName} onValueChange={setDoctorName}>
              <SelectTrigger><SelectValue placeholder="Select a doctor" /></SelectTrigger>
              <SelectContent>
                {doctors.map(d => {
                  const name = `Dr. ${d.first_name} ${d.last_name}`;
                  return <SelectItem key={d.id} value={name}>{name}{d.specialization ? ` — ${d.specialization}` : ''}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Subject</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Message subject..." />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Message</Label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Write your message..." className="min-h-[100px]" />
          </div>
          <Button
            onClick={() => send.mutate()}
            disabled={!doctorName || !message || send.isPending}
            className="gap-2 w-full sm:w-auto"
          >
            <Send className="w-4 h-4" /> Send Message
          </Button>
        </div>
      </Card>

      {/* Inbox */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Message History</h3>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 bg-muted/20 rounded-xl">No messages yet.</p>
        ) : (
          <div className="space-y-3">
            {sorted.map(msg => (
              <Card key={msg.id} className="shadow-sm overflow-hidden">
                <button
                  className="w-full text-left p-4 hover:bg-muted/20 transition-colors"
                  onClick={() => setExpanded(expanded === msg.id ? null : msg.id)}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={msg.status} />
                      <span className="font-medium text-sm">{msg.subject || '(No subject)'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>To: {msg.doctor_name}</span>
                      <span>{msg.created_date ? format(new Date(msg.created_date), 'MMM d, yyyy') : ''}</span>
                      {expanded === msg.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </button>
                {expanded === msg.id && (
                  <div className="px-4 pb-4 border-t space-y-3">
                    <div className="pt-3">
                      <p className="text-xs text-muted-foreground mb-1">Your message:</p>
                      <p className="text-sm bg-muted/20 rounded-lg p-3">{msg.message}</p>
                    </div>
                    {msg.reply && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Doctor's reply:</p>
                        <p className="text-sm bg-blue-50 border border-blue-100 rounded-lg p-3 text-blue-900">{msg.reply}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}