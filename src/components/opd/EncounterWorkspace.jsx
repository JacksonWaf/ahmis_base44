import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import PatientBanner from './PatientBanner';
import ClinicalNotesTab from './ClinicalNotesTab';
import LabOrdersTab from './LabOrdersTab';
import ImagingOrdersTab from './ImagingOrdersTab';
import PharmacyOrderTab from './PharmacyOrderTab';
import AdmissionTab from './AdmissionTab';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function EncounterWorkspace({ encounter, onClose, onRefresh }) {
  const [data, setData] = useState(encounter);
  const [tab, setTab] = useState('clinical');
  const qc = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (updates) => base44.entities.ClinicalEncounter.update(data.id, updates),
    onSuccess: (updated) => {
      setData(updated);
      qc.invalidateQueries({ queryKey: ['encounters'] });
      onRefresh?.();
      toast.success('Saved');
    },
  });

  const save = (updates) => updateMutation.mutate({ ...data, ...updates });
  const complete = () => save({ status: 'completed' });

  const labCount = data.lab_orders?.length || 0;
  const imgCount = data.imaging_orders?.length || 0;
  const rxCount = data.prescription_ids?.length || 0;

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <Button variant="ghost" size="sm" onClick={onClose} className="gap-1.5 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back to OPD
        </Button>
        <div className="h-4 w-px bg-border" />
        <span className="text-sm text-muted-foreground">
          Encounter — {data.encounter_date} {data.encounter_time}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {data.status !== 'completed' && data.status !== 'admitted' && (
            <Button
              variant="outline"
              size="sm"
              onClick={complete}
              disabled={updateMutation.isPending}
              className="gap-1.5 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
            >
              <CheckCircle className="w-4 h-4" /> Complete Encounter
            </Button>
          )}
          {(data.status === 'completed' || data.status === 'admitted') && (
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 capitalize">
              {data.status}
            </Badge>
          )}
        </div>
      </div>

      <PatientBanner encounter={data} />

      <Tabs value={tab} onValueChange={setTab} className="mt-5">
        <TabsList className="h-auto p-1 bg-muted gap-1 flex-wrap">
          <TabsTrigger value="clinical">📋 Clinical Notes</TabsTrigger>
          <TabsTrigger value="lab" className="gap-1">
            🧪 Lab Orders {labCount > 0 && <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">{labCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="imaging">
            🩻 Imaging {imgCount > 0 && <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">{imgCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="pharmacy">
            💊 Pharmacy {rxCount > 0 && <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700">{rxCount}</span>}
          </TabsTrigger>
          <TabsTrigger value="admit">🏥 Admit Patient</TabsTrigger>
        </TabsList>

        <TabsContent value="clinical" className="mt-4">
          <ClinicalNotesTab encounter={data} onSave={save} isSaving={updateMutation.isPending} />
        </TabsContent>
        <TabsContent value="lab" className="mt-4">
          <LabOrdersTab encounter={data} onSave={save} isSaving={updateMutation.isPending} />
        </TabsContent>
        <TabsContent value="imaging" className="mt-4">
          <ImagingOrdersTab encounter={data} onSave={save} isSaving={updateMutation.isPending} />
        </TabsContent>
        <TabsContent value="pharmacy" className="mt-4">
          <PharmacyOrderTab encounter={data} onSave={save} isSaving={updateMutation.isPending} />
        </TabsContent>
        <TabsContent value="admit" className="mt-4">
          <AdmissionTab encounter={data} onSave={save} isSaving={updateMutation.isPending} />
        </TabsContent>
      </Tabs>
    </div>
  );
}