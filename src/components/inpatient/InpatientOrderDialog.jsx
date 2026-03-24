import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FlaskConical, ScanLine, Pill } from 'lucide-react';

const today = () => new Date().toISOString().slice(0, 10);

export default function InpatientOrderDialog({ open, onOpenChange, admission, onSaveLab, onSaveImaging, onSavePrescription, isLoading }) {
  const [lab, setLab] = useState({ test_name: '', test_type: 'blood_count', priority: 'routine', ordered_by: '', notes: '' });
  const [img, setImg] = useState({ imaging_type: 'xray', body_part: '', priority: 'routine', ordered_by: '', notes: '' });
  const [rx, setRx] = useState({ medication_name: '', dosage: '', frequency: '', duration: '', instructions: '', doctor_name: '' });

  const patientInfo = { patient_id: admission?.patient_id, patient_name: admission?.patient_name, order_date: today() };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Order — {admission?.patient_name}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="lab">
          <TabsList className="w-full">
            <TabsTrigger value="lab" className="flex-1 gap-1"><FlaskConical className="w-3.5 h-3.5" /> Lab</TabsTrigger>
            <TabsTrigger value="imaging" className="flex-1 gap-1"><ScanLine className="w-3.5 h-3.5" /> Imaging</TabsTrigger>
            <TabsTrigger value="rx" className="flex-1 gap-1"><Pill className="w-3.5 h-3.5" /> Prescription</TabsTrigger>
          </TabsList>

          <TabsContent value="lab" className="space-y-3 pt-3">
            <div><Label className="text-xs text-muted-foreground mb-1 block">Test Name</Label><Input placeholder="e.g. Full Blood Count" value={lab.test_name} onChange={e => setLab(l => ({ ...l, test_name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-muted-foreground mb-1 block">Type</Label>
                <Select value={lab.test_type} onValueChange={v => setLab(l => ({ ...l, test_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['blood_count','urinalysis','lipid_panel','liver_function','kidney_function','thyroid','glucose','hba1c','electrolytes','coagulation','culture','other'].map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g,' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs text-muted-foreground mb-1 block">Priority</Label>
                <Select value={lab.priority} onValueChange={v => setLab(l => ({ ...l, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['routine','urgent','stat'].map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs text-muted-foreground mb-1 block">Ordered By</Label><Input placeholder="Doctor name" value={lab.ordered_by} onChange={e => setLab(l => ({ ...l, ordered_by: e.target.value }))} /></div>
            <div><Label className="text-xs text-muted-foreground mb-1 block">Notes</Label><Textarea placeholder="Clinical indication..." value={lab.notes} onChange={e => setLab(l => ({ ...l, notes: e.target.value }))} className="min-h-[60px]" /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={!lab.test_name || isLoading} onClick={() => onSaveLab({ ...patientInfo, ...lab })}>Order Lab</Button></div>
          </TabsContent>

          <TabsContent value="imaging" className="space-y-3 pt-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-muted-foreground mb-1 block">Imaging Type</Label>
                <Select value={img.imaging_type} onValueChange={v => setImg(i => ({ ...i, imaging_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['xray','ct_scan','mri','ultrasound','mammography','pet_scan','fluoroscopy','other'].map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace(/_/g,' ')}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs text-muted-foreground mb-1 block">Body Part</Label><Input placeholder="e.g. Chest" value={img.body_part} onChange={e => setImg(i => ({ ...i, body_part: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs text-muted-foreground mb-1 block">Priority</Label>
              <Select value={img.priority} onValueChange={v => setImg(i => ({ ...i, priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['routine','urgent','stat'].map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs text-muted-foreground mb-1 block">Ordered By</Label><Input placeholder="Doctor name" value={img.ordered_by} onChange={e => setImg(i => ({ ...i, ordered_by: e.target.value }))} /></div>
            <div><Label className="text-xs text-muted-foreground mb-1 block">Notes</Label><Textarea placeholder="Clinical indication..." value={img.notes} onChange={e => setImg(i => ({ ...i, notes: e.target.value }))} className="min-h-[60px]" /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={!img.body_part || isLoading} onClick={() => onSaveImaging({ ...patientInfo, ...img })}>Order Imaging</Button></div>
          </TabsContent>

          <TabsContent value="rx" className="space-y-3 pt-3">
            <div><Label className="text-xs text-muted-foreground mb-1 block">Medication</Label><Input placeholder="Drug name" value={rx.medication_name} onChange={e => setRx(r => ({ ...r, medication_name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-muted-foreground mb-1 block">Dosage</Label><Input placeholder="e.g. 500mg" value={rx.dosage} onChange={e => setRx(r => ({ ...r, dosage: e.target.value }))} /></div>
              <div><Label className="text-xs text-muted-foreground mb-1 block">Frequency</Label><Input placeholder="e.g. TDS" value={rx.frequency} onChange={e => setRx(r => ({ ...r, frequency: e.target.value }))} /></div>
              <div><Label className="text-xs text-muted-foreground mb-1 block">Duration</Label><Input placeholder="e.g. 7 days" value={rx.duration} onChange={e => setRx(r => ({ ...r, duration: e.target.value }))} /></div>
              <div><Label className="text-xs text-muted-foreground mb-1 block">Doctor</Label><Input placeholder="Prescribing doctor" value={rx.doctor_name} onChange={e => setRx(r => ({ ...r, doctor_name: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs text-muted-foreground mb-1 block">Instructions</Label><Textarea placeholder="Administration instructions..." value={rx.instructions} onChange={e => setRx(r => ({ ...r, instructions: e.target.value }))} className="min-h-[60px]" /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button disabled={!rx.medication_name || isLoading} onClick={() => onSavePrescription({ ...patientInfo, ...rx, prescribed_date: today() })}>Prescribe</Button></div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}