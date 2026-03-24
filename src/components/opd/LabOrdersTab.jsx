import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FlaskConical, Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge from '@/components/shared/StatusBadge';
import { toast } from 'sonner';

const testTypes = ['blood_count','urinalysis','lipid_panel','liver_function','kidney_function','thyroid','glucose','hba1c','electrolytes','coagulation','culture','other'];

const QUICK_TESTS = [
  'Complete Blood Count (CBC)',
  'Random Blood Sugar (RBS)',
  'Fasting Blood Sugar (FBS)',
  'Urine R/E',
  'Serum Creatinine',
  'Liver Function Tests (LFTs)',
  'Lipid Profile',
  'HbA1c',
  'Serum Electrolytes',
  'Malaria Rapid Test',
  'Pregnancy Test (urine β-hCG)',
  'HIV Rapid Test',
  'Sputum AFB',
  'Widal Test',
];

export default function LabOrdersTab({ encounter, onSave, isSaving }) {
  const [testName, setTestName] = useState('');
  const [testType, setTestType] = useState('');
  const [priority, setPriority] = useState('routine');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const addOrder = async (name = testName) => {
    if (!name) return;
    setLoading(true);
    const lab = await base44.entities.LabTest.create({
      patient_id: encounter.patient_id,
      patient_name: encounter.patient_name,
      test_name: name,
      test_type: testType || 'other',
      ordered_by: encounter.clinician,
      order_date: format(new Date(), 'yyyy-MM-dd'),
      priority,
      notes,
      status: 'ordered',
    });
    const current = encounter.lab_orders || [];
    await onSave({ lab_orders: [...current, lab.id], status: 'in_progress' });
    qc.invalidateQueries({ queryKey: ['labTests'] });
    setTestName(''); setNotes('');
    toast.success(`Lab order placed: ${name}`);
    setLoading(false);
  };

  const removeOrder = async (labId) => {
    const updated = (encounter.lab_orders || []).filter(id => id !== labId);
    await onSave({ lab_orders: updated });
    toast.success('Lab order removed');
  };

  const orders = encounter.lab_orders || [];

  return (
    <div className="space-y-5">
      <Card className="p-5 border-0 shadow-sm">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-purple-600" /> Order Lab Tests
        </h3>

        <div className="mb-4">
          <Label className="text-xs text-muted-foreground mb-2 block">Quick Order</Label>
          <div className="flex flex-wrap gap-2">
            {QUICK_TESTS.map(t => (
              <button
                key={t}
                onClick={() => addOrder(t)}
                disabled={loading || isSaving}
                className="px-2.5 py-1.5 text-xs rounded-full border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors disabled:opacity-50"
              >
                + {t}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Custom Test Name</Label>
            <Input className="mt-1" placeholder="Enter test name" value={testName} onChange={e => setTestName(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Test Category</Label>
            <Select value={testType} onValueChange={setTestType}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {testTypes.map(t => (
                  <SelectItem key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="routine">Routine</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="stat">STAT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs text-muted-foreground">Notes / Instructions</Label>
            <Textarea className="mt-1 min-h-[60px]" placeholder="Special instructions..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button onClick={() => addOrder()} disabled={!testName || loading || isSaving} className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
              Send to Lab
            </Button>
          </div>
        </div>
      </Card>

      {orders.length > 0 && (
        <Card className="p-5 border-0 shadow-sm">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ordered Tests ({orders.length})
          </h3>
          <div className="space-y-2">
            {orders.map((id) => (
              <div key={id} className="flex items-center justify-between p-3 rounded-lg bg-purple-50 border border-purple-100">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Lab Order</span>
                  <StatusBadge status="ordered" />
                </div>
                <button onClick={() => removeOrder(id)} className="text-muted-foreground hover:text-destructive transition-colors">
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