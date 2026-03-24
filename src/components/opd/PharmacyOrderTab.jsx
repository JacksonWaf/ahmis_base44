import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Pill, Loader2, CheckCircle2, Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge from '@/components/shared/StatusBadge';
import { toast } from 'sonner';

const frequencies = ['Once daily','Twice daily','Three times daily','Four times daily','Every 8 hours','Every 12 hours','Every 6 hours','At night','As needed (PRN)'];
const durations = ['3 days','5 days','7 days','10 days','14 days','1 month','2 months','3 months','Ongoing'];

export default function PharmacyOrderTab({ encounter, onSave, isSaving }) {
  const [medSearch, setMedSearch] = useState('');
  const [selectedMed, setSelectedMed] = useState(null);
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const { data: medications = [] } = useQuery({
    queryKey: ['medications'],
    queryFn: () => base44.entities.Medication.list(),
  });

  const filteredMeds = medications.filter(m =>
    `${m.name} ${m.generic_name}`.toLowerCase().includes(medSearch.toLowerCase())
  );

  const prescribe = async () => {
    const medName = selectedMed ? selectedMed.name : medSearch;
    if (!medName) return;
    setLoading(true);
    const rx = await base44.entities.Prescription.create({
      patient_id: encounter.patient_id,
      patient_name: encounter.patient_name,
      doctor_name: encounter.clinician,
      medication_name: medName,
      dosage: dosage || selectedMed?.strength,
      frequency,
      duration,
      quantity: Number(quantity),
      instructions,
      prescribed_date: format(new Date(), 'yyyy-MM-dd'),
      status: 'pending',
    });
    const current = encounter.prescription_ids || [];
    await onSave({ prescription_ids: [...current, rx.id], status: 'in_progress' });
    qc.invalidateQueries({ queryKey: ['prescriptions'] });
    setSelectedMed(null); setMedSearch(''); setDosage('');
    setFrequency(''); setDuration(''); setQuantity(1); setInstructions('');
    toast.success(`Prescription sent to pharmacy: ${medName}`);
    setLoading(false);
  };

  const removeRx = async (rxId) => {
    const updated = (encounter.prescription_ids || []).filter(id => id !== rxId);
    await onSave({ prescription_ids: updated });
    toast.success('Prescription removed');
  };

  const orders = encounter.prescription_ids || [];

  return (
    <div className="space-y-5">
      <Card className="p-5 border-0 shadow-sm">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Pill className="w-4 h-4 text-emerald-600" /> Prescribe Medication
        </h3>

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Search Medication</Label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search by name..."
                value={medSearch}
                onChange={e => { setMedSearch(e.target.value); setSelectedMed(null); }}
              />
            </div>
            {medSearch && !selectedMed && (
              <div className="border rounded-lg max-h-40 overflow-y-auto">
                {filteredMeds.slice(0, 8).map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMed(m); setMedSearch(m.name); setDosage(m.strength || ''); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted border-b last:border-0 transition-colors"
                  >
                    <span className="font-medium">{m.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{m.generic_name} {m.strength && `• ${m.strength}`} {m.dosage_form && `• ${m.dosage_form}`}</span>
                    {m.stock_quantity <= m.reorder_level && (
                      <span className="ml-2 text-xs text-amber-600">⚠ Low stock</span>
                    )}
                  </button>
                ))}
                {filteredMeds.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-3">No matching medications</p>
                )}
              </div>
            )}
          </div>

          {selectedMed && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
              <p className="font-semibold text-emerald-800">{selectedMed.name} — {selectedMed.dosage_form}</p>
              <p className="text-emerald-700">Generic: {selectedMed.generic_name || 'N/A'} • Stock: {selectedMed.stock_quantity}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Dosage / Strength</Label>
              <Input className="mt-1" placeholder="e.g. 500mg" value={dosage} onChange={e => setDosage(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {frequencies.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {durations.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Quantity</Label>
              <Input className="mt-1" type="number" min={1} value={quantity} onChange={e => setQuantity(e.target.value)} />
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Instructions</Label>
              <Textarea className="mt-1 min-h-[60px]" placeholder="e.g. Take after meals, avoid alcohol..." value={instructions} onChange={e => setInstructions(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={prescribe} disabled={!medSearch || loading || isSaving} className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pill className="w-4 h-4" />}
              Send to Pharmacy
            </Button>
          </div>
        </div>
      </Card>

      {orders.length > 0 && (
        <Card className="p-5 border-0 shadow-sm">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Prescriptions ({orders.length})
          </h3>
          <div className="space-y-2">
            {orders.map((id) => (
              <div key={id} className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-800">Prescription</span>
                  <StatusBadge status="pending" />
                </div>
                <button onClick={() => removeRx(id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}