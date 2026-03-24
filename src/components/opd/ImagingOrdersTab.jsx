import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScanLine, Loader2, CheckCircle2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge from '@/components/shared/StatusBadge';
import { toast } from 'sonner';

const imagingTypes = ['xray','ct_scan','mri','ultrasound','mammography','pet_scan','fluoroscopy','other'];

const QUICK_IMAGING = [
  { type: 'xray', label: 'Chest X-Ray (PA)', body: 'Chest' },
  { type: 'xray', label: 'X-Ray Abdomen', body: 'Abdomen' },
  { type: 'xray', label: 'X-Ray Right Hand', body: 'Right Hand' },
  { type: 'xray', label: 'X-Ray Left Knee', body: 'Left Knee' },
  { type: 'ultrasound', label: 'Abdominal USS', body: 'Abdomen' },
  { type: 'ultrasound', label: 'Pelvic USS', body: 'Pelvis' },
  { type: 'ct_scan', label: 'CT Head', body: 'Head' },
  { type: 'ct_scan', label: 'CT Chest', body: 'Chest' },
  { type: 'mri', label: 'MRI Brain', body: 'Brain' },
  { type: 'mri', label: 'MRI Spine (L/S)', body: 'Lumbar Spine' },
];

export default function ImagingOrdersTab({ encounter, onSave, isSaving }) {
  const [imgType, setImgType] = useState('xray');
  const [bodyPart, setBodyPart] = useState('');
  const [priority, setPriority] = useState('routine');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const placeOrder = async (type = imgType, body = bodyPart) => {
    if (!body) return;
    setLoading(true);
    const img = await base44.entities.ImagingOrder.create({
      patient_id: encounter.patient_id,
      patient_name: encounter.patient_name,
      imaging_type: type,
      body_part: body,
      ordered_by: encounter.clinician,
      order_date: format(new Date(), 'yyyy-MM-dd'),
      priority,
      notes,
      status: 'ordered',
    });
    const current = encounter.imaging_orders || [];
    await onSave({ imaging_orders: [...current, img.id], status: 'in_progress' });
    qc.invalidateQueries({ queryKey: ['imagingOrders'] });
    setBodyPart(''); setNotes('');
    toast.success(`Imaging order placed: ${type.replace(/_/g, ' ').toUpperCase()} — ${body}`);
    setLoading(false);
  };

  const removeOrder = async (imgId) => {
    const updated = (encounter.imaging_orders || []).filter(id => id !== imgId);
    await onSave({ imaging_orders: updated });
    toast.success('Imaging order removed');
  };

  const orders = encounter.imaging_orders || [];

  return (
    <div className="space-y-5">
      <Card className="p-5 border-0 shadow-sm">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <ScanLine className="w-4 h-4 text-blue-600" /> Order Imaging
        </h3>

        <div className="mb-4">
          <Label className="text-xs text-muted-foreground mb-2 block">Quick Order</Label>
          <div className="flex flex-wrap gap-2">
            {QUICK_IMAGING.map(qi => (
              <button
                key={qi.label}
                onClick={() => placeOrder(qi.type, qi.body)}
                disabled={loading || isSaving}
                className="px-2.5 py-1.5 text-xs rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                + {qi.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Imaging Type</Label>
            <Select value={imgType} onValueChange={setImgType}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {imagingTypes.map(t => (
                  <SelectItem key={t} value={t}>{t.replace(/_/g, ' ').toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Body Part / Region</Label>
            <Input className="mt-1" placeholder="e.g. Chest, Abdomen, Right Knee" value={bodyPart} onChange={e => setBodyPart(e.target.value)} />
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
            <Label className="text-xs text-muted-foreground">Clinical Notes</Label>
            <Textarea className="mt-1 min-h-[60px]" placeholder="Clinical indication..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button onClick={() => placeOrder()} disabled={!bodyPart || loading || isSaving} className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
              Send to Imaging
            </Button>
          </div>
        </div>
      </Card>

      {orders.length > 0 && (
        <Card className="p-5 border-0 shadow-sm">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ordered Imaging ({orders.length})
          </h3>
          <div className="space-y-2">
            {orders.map((id) => (
              <div key={id} className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2">
                  <ScanLine className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Imaging Order</span>
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