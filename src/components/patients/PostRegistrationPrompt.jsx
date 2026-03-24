import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Activity, X } from 'lucide-react';

export default function PostRegistrationPrompt({ open, onOpenChange, patient, onTriage }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
            Patient Registered
          </DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{patient?.first_name} {patient?.last_name}</span> has been successfully registered.
            Would you like to proceed with triage?
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={onTriage} className="w-full gap-2">
              <Activity className="w-4 h-4" />
              Proceed to Triage
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full gap-2">
              <X className="w-4 h-4" />
              Skip for Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}