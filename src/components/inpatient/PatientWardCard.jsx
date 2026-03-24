import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Plus, Bed, User, Calendar, Stethoscope, ClipboardList } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';

const wardColors = {
  icu: 'border-l-red-500',
  emergency: 'border-l-orange-500',
  surgical: 'border-l-purple-500',
  maternity: 'border-l-pink-400',
  pediatrics: 'border-l-yellow-400',
  cardiology: 'border-l-rose-500',
  neurology: 'border-l-indigo-500',
  general: 'border-l-sky-400',
  medical: 'border-l-blue-600',
  orthopedics: 'border-l-teal-500',
};

export default function PatientWardCard({ admission, onRecordVitals, onNewOrder, onEdit }) {
  return (
    <Card className={`p-4 border-l-4 shadow-sm hover:shadow-md transition-shadow ${wardColors[admission.ward] || 'border-l-sky-400'}`}>
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm truncate">{admission.patient_name}</span>
            <StatusBadge status={admission.status} />
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {admission.ward} {admission.bed_number && `· Bed ${admission.bed_number}`}</span>
            {admission.admitting_doctor && <span className="flex items-center gap-1"><Stethoscope className="w-3 h-3" /> Dr. {admission.admitting_doctor}</span>}
            {admission.admission_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Admitted: {admission.admission_date}</span>}
          </div>
          {admission.diagnosis && <p className="text-xs text-blue-700 font-medium">Dx: {admission.diagnosis}</p>}
          {admission.admission_reason && <p className="text-xs text-muted-foreground truncate">Reason: {admission.admission_reason}</p>}
        </div>
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <Button size="sm" variant="outline" className="text-xs gap-1 h-7" onClick={() => onRecordVitals(admission)}>
            <Activity className="w-3 h-3" /> Vitals
          </Button>
          <Button size="sm" variant="outline" className="text-xs gap-1 h-7" onClick={() => onNewOrder(admission)}>
            <ClipboardList className="w-3 h-3" /> Orders
          </Button>
          <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => onEdit(admission)}>Edit</Button>
        </div>
      </div>
    </Card>
  );
}