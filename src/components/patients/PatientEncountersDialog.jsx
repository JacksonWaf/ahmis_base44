import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatusBadge from '@/components/shared/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import EncounterReportDialog from './EncounterReportDialog';
import { ClipboardList, CalendarDays, ChevronRight } from 'lucide-react';

export default function PatientEncountersDialog({ open, onOpenChange, patient }) {
  const [selectedEncounter, setSelectedEncounter] = useState(null);

  const { data: encounters = [], isLoading } = useQuery({
    queryKey: ['encounters', patient?.id],
    queryFn: () => base44.entities.ClinicalEncounter.filter({ patient_id: patient.id }, '-encounter_date'),
    enabled: !!patient?.id,
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Encounters — {patient?.first_name} {patient?.last_name}
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="space-y-3 py-2">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : encounters.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No encounters found for this patient.</div>
          ) : (
            <div className="space-y-3 py-2">
              {encounters.map((enc) => (
                <div
                  key={enc.id}
                  className="border rounded-lg p-4 space-y-2 hover:bg-muted/30 transition-colors cursor-pointer group"
                  onClick={() => setSelectedEncounter(enc)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CalendarDays className="w-4 h-4 text-muted-foreground" />
                      {enc.encounter_date} {enc.encounter_time && `at ${enc.encounter_time}`}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={enc.status} />
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                  {enc.chief_complaint && (
                    <p className="text-sm"><span className="text-muted-foreground font-medium">Chief Complaint:</span> {enc.chief_complaint}</p>
                  )}
                  {enc.diagnosis && (
                    <p className="text-sm"><span className="text-muted-foreground font-medium">Diagnosis:</span> {enc.diagnosis}</p>
                  )}
                  {enc.clinician && (
                    <p className="text-sm text-muted-foreground">Clinician: {enc.clinician}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <EncounterReportDialog
        open={!!selectedEncounter}
        onOpenChange={(v) => { if (!v) setSelectedEncounter(null); }}
        encounter={selectedEncounter}
        onBack={() => setSelectedEncounter(null)}
      />
    </>
  );
}