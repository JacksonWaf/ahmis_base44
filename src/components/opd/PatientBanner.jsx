import React from 'react';
import { Card } from '@/components/ui/card';
import { User, Calendar, Droplets, AlertTriangle } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';

export default function PatientBanner({ encounter }) {
  return (
    <Card className="p-4 border-0 shadow-sm bg-gradient-to-r from-primary/5 to-accent/5">
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold">{encounter.patient_name}</h2>
            <StatusBadge status={encounter.status} />
          </div>
          <div className="flex flex-wrap gap-4 mt-1 text-xs text-muted-foreground">
            {encounter.patient_age && (
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {encounter.patient_age}</span>
            )}
            {encounter.patient_gender && (
              <span className="capitalize">{encounter.patient_gender}</span>
            )}
            {encounter.clinician && (
              <span>Clinician: <strong>{encounter.clinician}</strong></span>
            )}
            {encounter.encounter_date && (
              <span>{encounter.encounter_date} {encounter.encounter_time}</span>
            )}
          </div>
        </div>
        {encounter.chief_complaint && (
          <div className="flex-shrink-0 max-w-xs text-sm px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
            <span className="text-amber-800 font-medium text-xs">Chief Complaint: </span>
            <span className="text-amber-900 text-xs">{encounter.chief_complaint}</span>
          </div>
        )}
      </div>
    </Card>
  );
}