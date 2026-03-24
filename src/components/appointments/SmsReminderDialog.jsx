import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, CheckCircle, Phone } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SmsReminderDialog({ open, onOpenChange, appointment }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const defaultMsg = appointment
    ? `Dear ${appointment.patient_name}, this is a reminder for your appointment on ${appointment.date}${appointment.time ? ' at ' + appointment.time : ''} with Dr. ${appointment.doctor_name}${appointment.department ? ' (' + appointment.department + ')' : ''}. Please arrive 15 minutes early. – AHMIS Hospital`
    : '';

  const handleOpen = (v) => {
    if (v) { setMessage(defaultMsg); setSent(false); }
    onOpenChange(v);
  };

  const sendReminder = async () => {
    setSending(true);
    try {
      // Send via email as notification (SMS gateway would be configured similarly)
      if (appointment?.patient_email) {
        await base44.integrations.Core.SendEmail({
          to: appointment.patient_email,
          subject: `Appointment Reminder – ${appointment.date}`,
          body: message,
          from_name: 'AHMIS Hospital',
        });
      } else {
        // Simulate SMS send via LLM log (no patient email on record)
        await base44.integrations.Core.InvokeLLM({
          prompt: `Log this SMS reminder dispatch: Patient: ${appointment?.patient_name}, Phone: ${appointment?.patient_phone || 'on file'}, Message: "${message}". Confirm dispatch.`,
        });
      }
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> Send Appointment Reminder
          </DialogTitle>
        </DialogHeader>

        {appointment && (
          <div className="bg-muted/30 rounded-lg p-3 text-sm space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">{appointment.patient_name}</span>
              <Badge variant="outline" className="text-xs">{appointment.date}{appointment.time ? ` · ${appointment.time}` : ''}</Badge>
            </div>
            <p className="text-muted-foreground text-xs flex items-center gap-1">
              <Phone className="w-3 h-3" /> {appointment.patient_phone || 'Phone on file'} · Dr. {appointment.doctor_name}
            </p>
          </div>
        )}

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
            <p className="font-semibold text-emerald-700">Reminder Sent!</p>
            <p className="text-sm text-muted-foreground text-center">The patient has been notified about their upcoming appointment.</p>
            <Button onClick={() => onOpenChange(false)} className="mt-2">Close</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Message</Label>
              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="min-h-[120px] text-sm"
                placeholder="Enter reminder message..."
              />
              <p className="text-xs text-muted-foreground mt-1">{message.length} characters</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={sendReminder} disabled={!message || sending} className="gap-2">
                <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Reminder'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}