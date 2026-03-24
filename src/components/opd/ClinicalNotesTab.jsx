import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2 } from 'lucide-react';

const vitalField = (label, name, placeholder) => ({ label, name, placeholder });
const vitals = [
  vitalField('Temperature (°C)', 'temperature', '37.0'),
  vitalField('Blood Pressure', 'blood_pressure', '120/80'),
  vitalField('Pulse Rate (bpm)', 'pulse_rate', '72'),
  vitalField('Resp. Rate (breaths/min)', 'respiratory_rate', '16'),
  vitalField('O₂ Saturation (%)', 'oxygen_saturation', '98'),
  vitalField('Weight (kg)', 'weight', '70'),
  vitalField('Height (cm)', 'height', '170'),
];

export default function ClinicalNotesTab({ encounter, onSave, isSaving }) {
  const [form, setForm] = useState({
    chief_complaint: '',
    history_of_presenting_illness: '',
    examination_findings: '',
    diagnosis: '',
    treatment_plan: '',
    notes: '',
    vital_signs: {},
  });

  useEffect(() => {
    setForm({
      chief_complaint: encounter.chief_complaint || '',
      history_of_presenting_illness: encounter.history_of_presenting_illness || '',
      examination_findings: encounter.examination_findings || '',
      diagnosis: encounter.diagnosis || '',
      treatment_plan: encounter.treatment_plan || '',
      notes: encounter.notes || '',
      vital_signs: encounter.vital_signs || {},
    });
  }, [encounter.id]);

  const setVital = (name, value) => setForm(f => ({ ...f, vital_signs: { ...f.vital_signs, [name]: value } }));

  const handleSave = () => onSave(form);

  return (
    <div className="space-y-5">
      <Card className="p-5 border-0 shadow-sm">
        <h3 className="text-sm font-semibold mb-4 text-foreground">Vital Signs</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {vitals.map(v => (
            <div key={v.name}>
              <Label className="text-xs text-muted-foreground">{v.label}</Label>
              <Input
                className="mt-1 h-9"
                placeholder={v.placeholder}
                value={form.vital_signs[v.name] || ''}
                onChange={e => setVital(v.name, e.target.value)}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 border-0 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-foreground">History & Examination</h3>
        {[
          { key: 'chief_complaint', label: 'Chief Complaint' },
          { key: 'history_of_presenting_illness', label: 'History of Presenting Illness' },
          { key: 'examination_findings', label: 'Examination Findings' },
        ].map(f => (
          <div key={f.key}>
            <Label className="text-xs text-muted-foreground">{f.label}</Label>
            <Textarea
              className="mt-1 min-h-[70px]"
              value={form[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
            />
          </div>
        ))}
      </Card>

      <Card className="p-5 border-0 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Assessment & Plan</h3>
        {[
          { key: 'diagnosis', label: 'Diagnosis / Impression' },
          { key: 'treatment_plan', label: 'Treatment Plan' },
          { key: 'notes', label: 'Additional Notes' },
        ].map(f => (
          <div key={f.key}>
            <Label className="text-xs text-muted-foreground">{f.label}</Label>
            <Textarea
              className="mt-1 min-h-[70px]"
              value={form[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
            />
          </div>
        ))}
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Notes
        </Button>
      </div>
    </div>
  );
}