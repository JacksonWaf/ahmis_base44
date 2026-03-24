import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { BedDouble, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const wards = ['General Ward','Male Ward','Female Ward','Paediatric Ward','Surgical Ward','Maternity Ward','ICU','HDU','Isolation Ward','Psychiatric Ward'];
const bedTypes = ['General Bed','Private Room','Semi-private','ICU Bed','HDU Bed'];

export default function AdmissionTab({ encounter, onSave, isSaving }) {
  const [ward, setWard] = useState('');
  const [bedType, setBedType] = useState('');
  const [reason, setReason] = useState('');
  const [consultingDoctor, setConsultingDoctor] = useState('');
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();
  const isAdmitted = encounter.admitted || encounter.status === 'admitted';

  useEffect(() => {
    if (encounter.admission_ward) setWard(encounter.admission_ward);
  }, [encounter.id]);

  const admit = async () => {
    if (!ward) return;
    setLoading(true);
    // Update patient status to admitted
    if (encounter.patient_id) {
      await base44.entities.Patient.update(encounter.patient_id, { status: 'admitted' });
      qc.invalidateQueries({ queryKey: ['patients'] });
    }
    await onSave({
      admitted: true,
      admission_ward: ward,
      status: 'admitted',
      notes: (encounter.notes || '') + `\n[ADMITTED to ${ward}${bedType ? ` — ${bedType}` : ''}. Reason: ${reason}]`,
    });
    toast.success(`Patient admitted to ${ward}`);
    setLoading(false);
  };

  const dischargeFromAdmission = async () => {
    if (encounter.patient_id) {
      await base44.entities.Patient.update(encounter.patient_id, { status: 'active' });
      qc.invalidateQueries({ queryKey: ['patients'] });
    }
    await onSave({ admitted: false, status: 'completed' });
    toast.success('Patient discharged from admission');
  };

  return (
    <div className="space-y-5 max-w-xl">
      {isAdmitted ? (
        <Card className="p-5 border-0 shadow-sm bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <BedDouble className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Patient Admitted
              </h3>
              <p className="text-sm text-red-700 mt-1">Ward: <strong>{encounter.admission_ward}</strong></p>
              <p className="text-xs text-red-600 mt-1">Admitted on encounter date</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 text-red-700 border-red-300 hover:bg-red-100"
                onClick={dischargeFromAdmission}
                disabled={isSaving}
              >
                Discharge Patient
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-5 border-0 shadow-sm">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <BedDouble className="w-4 h-4 text-red-600" /> Admit Patient
          </h3>

          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 mb-4 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Admitting this patient will update their record to <strong>Admitted</strong> and move them from OPD to inpatient care.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Ward *</Label>
              <Select value={ward} onValueChange={setWard}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select ward" /></SelectTrigger>
                <SelectContent>
                  {wards.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Bed Type</Label>
              <Select value={bedType} onValueChange={setBedType}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select bed type" /></SelectTrigger>
                <SelectContent>
                  {bedTypes.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Consulting Doctor</Label>
              <Input className="mt-1" placeholder="Doctor name" value={consultingDoctor} onChange={e => setConsultingDoctor(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Reason for Admission</Label>
              <Textarea
                className="mt-1 min-h-[80px]"
                placeholder="Clinical indication for admission..."
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={admit}
                disabled={!ward || loading || isSaving}
                className="gap-2 bg-red-600 hover:bg-red-700"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BedDouble className="w-4 h-4" />}
                Admit Patient
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}