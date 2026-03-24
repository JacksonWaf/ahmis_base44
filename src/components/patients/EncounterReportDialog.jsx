import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StatusBadge from '@/components/shared/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, User, Stethoscope, FlaskConical, Scan, Pill, FileText, Activity, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

function Section({ icon: Icon, title, children }) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
        <Icon className="w-4 h-4 text-primary" />
        {title}
      </div>
      <div className="text-sm text-foreground/80 space-y-1">{children}</div>
    </div>
  );
}

function Field({ label, value }) {
  if (!value) return null;
  return (
    <p><span className="font-medium text-muted-foreground">{label}: </span>{value}</p>
  );
}

export default function EncounterReportDialog({ open, onOpenChange, encounter, onBack }) {
  if (!encounter) return null;

  const vitals = encounter.vital_signs || {};
  const hasVitals = Object.values(vitals).some(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {onBack && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Encounter Report
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Header Info */}
          <div className="flex flex-wrap gap-2 items-center justify-between bg-muted/40 rounded-lg p-4">
            <div className="space-y-1">
              <p className="font-semibold text-base">{encounter.patient_name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="w-4 h-4" />
                {encounter.encounter_date} {encounter.encounter_time && `at ${encounter.encounter_time}`}
              </div>
              {encounter.clinician && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  {encounter.clinician}
                </div>
              )}
            </div>
            <StatusBadge status={encounter.status} />
          </div>

          {/* Clinical */}
          <Section icon={Stethoscope} title="Clinical Details">
            <Field label="Chief Complaint" value={encounter.chief_complaint} />
            <Field label="History of Presenting Illness" value={encounter.history_of_presenting_illness} />
            <Field label="Examination Findings" value={encounter.examination_findings} />
            <Field label="Diagnosis" value={encounter.diagnosis} />
            <Field label="Treatment Plan" value={encounter.treatment_plan} />
          </Section>

          {/* Vitals */}
          {hasVitals && (
            <Section icon={Activity} title="Vital Signs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {vitals.temperature && (
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <p className="text-xs text-muted-foreground">Temperature</p>
                    <p className="font-semibold">{vitals.temperature}</p>
                  </div>
                )}
                {vitals.blood_pressure && (
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <p className="text-xs text-muted-foreground">Blood Pressure</p>
                    <p className="font-semibold">{vitals.blood_pressure}</p>
                  </div>
                )}
                {vitals.pulse_rate && (
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <p className="text-xs text-muted-foreground">Pulse Rate</p>
                    <p className="font-semibold">{vitals.pulse_rate}</p>
                  </div>
                )}
                {vitals.respiratory_rate && (
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <p className="text-xs text-muted-foreground">Respiratory Rate</p>
                    <p className="font-semibold">{vitals.respiratory_rate}</p>
                  </div>
                )}
                {vitals.oxygen_saturation && (
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <p className="text-xs text-muted-foreground">O₂ Saturation</p>
                    <p className="font-semibold">{vitals.oxygen_saturation}</p>
                  </div>
                )}
                {vitals.weight && (
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="font-semibold">{vitals.weight}</p>
                  </div>
                )}
                {vitals.height && (
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <p className="text-xs text-muted-foreground">Height</p>
                    <p className="font-semibold">{vitals.height}</p>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Lab Orders */}
          {encounter.lab_orders?.length > 0 && (
            <Section icon={FlaskConical} title="Lab Orders">
              <div className="flex flex-wrap gap-2 mt-1">
                {encounter.lab_orders.map((l, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{l}</Badge>
                ))}
              </div>
            </Section>
          )}

          {/* Imaging Orders */}
          {encounter.imaging_orders?.length > 0 && (
            <Section icon={Scan} title="Imaging Orders">
              <div className="flex flex-wrap gap-2 mt-1">
                {encounter.imaging_orders.map((img, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{img}</Badge>
                ))}
              </div>
            </Section>
          )}

          {/* Admission */}
          {encounter.admitted && (
            <Section icon={FileText} title="Admission">
              <Field label="Ward" value={encounter.admission_ward} />
              <Field label="Referral Department" value={encounter.referral_department} />
            </Section>
          )}

          {/* Notes */}
          {encounter.notes && (
            <Section icon={Pill} title="Notes">
              <p className="italic">{encounter.notes}</p>
            </Section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}