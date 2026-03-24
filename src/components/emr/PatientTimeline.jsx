import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, parseISO, differenceInYears } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Stethoscope, FlaskConical, ScanLine, Pill,
  HeartPulse, AlertCircle, Calendar, User
} from 'lucide-react';

const EVENT_CONFIG = {
  encounter: { icon: Stethoscope, color: 'bg-blue-500', light: 'bg-blue-50 border-blue-200', label: 'OPD Encounter' },
  lab: { icon: FlaskConical, color: 'bg-purple-500', light: 'bg-purple-50 border-purple-200', label: 'Lab Result' },
  imaging: { icon: ScanLine, color: 'bg-cyan-500', light: 'bg-cyan-50 border-cyan-200', label: 'Imaging' },
  prescription: { icon: Pill, color: 'bg-green-500', light: 'bg-green-50 border-green-200', label: 'Prescription' },
};

function TimelineEvent({ event }) {
  const cfg = EVENT_CONFIG[event.type];
  const Icon = cfg.icon;

  return (
    <div className="flex gap-4 group">
      {/* Dot + line */}
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-full ${cfg.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="w-px flex-1 bg-border mt-1 mb-0 group-last:hidden" />
      </div>

      {/* Content card */}
      <div className={`flex-1 mb-6 border rounded-xl p-4 ${cfg.light}`}>
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{cfg.label}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {event.date ? format(parseISO(event.date), 'dd MMM yyyy') : 'Date unknown'}
          </span>
        </div>

        {event.type === 'encounter' && <EncounterCard data={event.data} />}
        {event.type === 'lab' && <LabCard data={event.data} />}
        {event.type === 'imaging' && <ImagingCard data={event.data} />}
        {event.type === 'prescription' && <PrescriptionCard data={event.data} />}
      </div>
    </div>
  );
}

function EncounterCard({ data }) {
  return (
    <div className="space-y-2">
      {data.chief_complaint && (
        <div><span className="text-xs font-medium text-muted-foreground">Chief Complaint: </span>
          <span className="text-sm">{data.chief_complaint}</span>
        </div>
      )}
      {data.diagnosis && (
        <div><span className="text-xs font-medium text-muted-foreground">Diagnosis: </span>
          <span className="text-sm font-semibold text-blue-800">{data.diagnosis}</span>
        </div>
      )}
      {data.treatment_plan && (
        <div><span className="text-xs font-medium text-muted-foreground">Treatment: </span>
          <span className="text-sm">{data.treatment_plan}</span>
        </div>
      )}
      {data.clinician && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <User className="w-3 h-3" /> Dr. {data.clinician}
        </div>
      )}
      {data.vital_signs && Object.keys(data.vital_signs).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {data.vital_signs.blood_pressure && <VitalChip label="BP" value={data.vital_signs.blood_pressure} />}
          {data.vital_signs.pulse_rate && <VitalChip label="Pulse" value={`${data.vital_signs.pulse_rate} bpm`} />}
          {data.vital_signs.temperature && <VitalChip label="Temp" value={`${data.vital_signs.temperature}°`} />}
          {data.vital_signs.oxygen_saturation && <VitalChip label="SpO2" value={`${data.vital_signs.oxygen_saturation}%`} />}
          {data.vital_signs.weight && <VitalChip label="Wt" value={`${data.vital_signs.weight} kg`} />}
        </div>
      )}
      <Badge variant="outline" className="text-xs capitalize mt-1">{(data.status || '').replace(/_/g, ' ')}</Badge>
    </div>
  );
}

function VitalChip({ label, value }) {
  return (
    <div className="flex items-center gap-1 bg-white border rounded-md px-2 py-0.5 text-xs">
      <HeartPulse className="w-3 h-3 text-blue-400" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function LabCard({ data }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-semibold">{data.test_name}</p>
      {data.results && (
        <div className="bg-white border rounded-md p-2 text-sm mt-1">
          <span className="text-xs text-muted-foreground">Result: </span>{data.results}
          {data.normal_range && <span className="text-xs text-muted-foreground ml-2">(Normal: {data.normal_range})</span>}
        </div>
      )}
      <div className="flex gap-2 mt-1">
        <Badge variant="outline" className="text-xs capitalize">{(data.status || '').replace(/_/g, ' ')}</Badge>
        {data.priority && data.priority !== 'routine' && (
          <Badge className="text-xs capitalize bg-amber-100 text-amber-700 border-amber-200">{data.priority}</Badge>
        )}
      </div>
      {data.ordered_by && <p className="text-xs text-muted-foreground">Ordered by: Dr. {data.ordered_by}</p>}
    </div>
  );
}

function ImagingCard({ data }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-semibold capitalize">{(data.imaging_type || '').replace(/_/g, ' ')} — {data.body_part}</p>
      {data.findings && (
        <div className="bg-white border rounded-md p-2 text-sm mt-1">
          <span className="text-xs text-muted-foreground">Findings: </span>{data.findings}
        </div>
      )}
      <div className="flex gap-2 mt-1">
        <Badge variant="outline" className="text-xs capitalize">{(data.status || '').replace(/_/g, ' ')}</Badge>
        {data.priority && data.priority !== 'routine' && (
          <Badge className="text-xs capitalize bg-amber-100 text-amber-700 border-amber-200">{data.priority}</Badge>
        )}
      </div>
      {data.ordered_by && <p className="text-xs text-muted-foreground">Ordered by: Dr. {data.ordered_by}</p>}
    </div>
  );
}

function PrescriptionCard({ data }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-semibold">{data.medication_name}</p>
      <div className="flex flex-wrap gap-2 text-xs">
        {data.dosage && <span className="bg-white border rounded px-2 py-0.5">{data.dosage}</span>}
        {data.frequency && <span className="bg-white border rounded px-2 py-0.5">{data.frequency}</span>}
        {data.duration && <span className="bg-white border rounded px-2 py-0.5">{data.duration}</span>}
      </div>
      {data.instructions && <p className="text-xs text-muted-foreground">{data.instructions}</p>}
      <div className="flex gap-2 mt-1">
        <Badge variant="outline" className="text-xs capitalize">{(data.status || '').replace(/_/g, ' ')}</Badge>
      </div>
      {data.doctor_name && <p className="text-xs text-muted-foreground">Prescribed by: Dr. {data.doctor_name}</p>}
    </div>
  );
}

export default function PatientTimeline({ patient }) {
  const fullName = `${patient.first_name} ${patient.last_name}`;
  const age = patient.date_of_birth
    ? differenceInYears(new Date(), parseISO(patient.date_of_birth))
    : null;

  const { data: encounters = [] } = useQuery({
    queryKey: ['encounters', patient.id],
    queryFn: () => base44.entities.ClinicalEncounter.filter({ patient_id: patient.id }),
  });
  const { data: labs = [] } = useQuery({
    queryKey: ['labs', patient.id],
    queryFn: () => base44.entities.LabTest.filter({ patient_id: patient.id }),
  });
  const { data: imaging = [] } = useQuery({
    queryKey: ['imaging', patient.id],
    queryFn: () => base44.entities.ImagingOrder.filter({ patient_id: patient.id }),
  });
  const { data: prescriptions = [] } = useQuery({
    queryKey: ['prescriptions', patient.id],
    queryFn: () => base44.entities.Prescription.filter({ patient_id: patient.id }),
  });

  const timeline = useMemo(() => {
    const events = [
      ...encounters.map(e => ({ type: 'encounter', date: e.encounter_date, data: e })),
      ...labs.map(e => ({ type: 'lab', date: e.result_date || e.order_date, data: e })),
      ...imaging.map(e => ({ type: 'imaging', date: e.order_date, data: e })),
      ...prescriptions.map(e => ({ type: 'prescription', date: e.prescribed_date, data: e })),
    ];
    return events.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date.localeCompare(a.date);
    });
  }, [encounters, labs, imaging, prescriptions]);

  return (
    <div className="p-6">
      {/* Patient Banner */}
      <Card className="border-0 shadow-sm mb-6 p-5 bg-white">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{fullName}</h2>
            <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
              {age !== null && <span>{age} years old</span>}
              <span className="capitalize">{patient.gender}</span>
              {patient.blood_type && <span className="font-medium text-red-600">Blood: {patient.blood_type}</span>}
              {patient.phone && <span>{patient.phone}</span>}
              {patient.allergies && (
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> Allergies: {patient.allergies}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3 text-center">
            <div className="bg-blue-50 rounded-lg px-4 py-2">
              <p className="text-xl font-bold text-blue-600">{encounters.length}</p>
              <p className="text-xs text-muted-foreground">Encounters</p>
            </div>
            <div className="bg-purple-50 rounded-lg px-4 py-2">
              <p className="text-xl font-bold text-purple-600">{labs.length}</p>
              <p className="text-xs text-muted-foreground">Labs</p>
            </div>
            <div className="bg-cyan-50 rounded-lg px-4 py-2">
              <p className="text-xl font-bold text-cyan-600">{imaging.length}</p>
              <p className="text-xs text-muted-foreground">Imaging</p>
            </div>
            <div className="bg-green-50 rounded-lg px-4 py-2">
              <p className="text-xl font-bold text-green-600">{prescriptions.length}</p>
              <p className="text-xs text-muted-foreground">Rx</p>
            </div>
          </div>
        </div>
        {patient.insurance_provider && (
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
            Insurance: <span className="font-medium text-foreground">{patient.insurance_provider}</span>
            {patient.insurance_number && <span className="ml-2">#{patient.insurance_number}</span>}
          </div>
        )}
      </Card>

      {/* Timeline */}
      {timeline.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="font-medium">No medical history yet</p>
          <p className="text-sm">Encounters, labs, imaging, and prescriptions will appear here.</p>
        </div>
      ) : (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Medical Timeline ({timeline.length} events)
          </h3>
          <div>
            {timeline.map((event, i) => (
              <TimelineEvent key={`${event.type}-${event.data.id || i}`} event={event} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}