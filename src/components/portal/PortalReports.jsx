import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FlaskConical, ScanLine, Stethoscope, Download } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import StatusBadge from '@/components/shared/StatusBadge';

function downloadReport(title, lines) {
  const content = `${title}\nGenerated: ${new Date().toLocaleString()}\n${'='.repeat(50)}\n\n${lines.join('\n')}`;
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PortalReports({ patientId, patientName }) {
  const { data: encounters = [] } = useQuery({
    queryKey: ['portal-encounters', patientId],
    queryFn: () => base44.entities.ClinicalEncounter.filter({ patient_id: patientId }),
    enabled: !!patientId,
  });
  const { data: labs = [] } = useQuery({
    queryKey: ['portal-labs', patientId],
    queryFn: () => base44.entities.LabTest.filter({ patient_id: patientId }),
    enabled: !!patientId,
  });
  const { data: imaging = [] } = useQuery({
    queryKey: ['portal-imaging', patientId],
    queryFn: () => base44.entities.ImagingOrder.filter({ patient_id: patientId }),
    enabled: !!patientId,
  });

  return (
    <div>
      <Tabs defaultValue="encounters">
        <TabsList className="mb-4">
          <TabsTrigger value="encounters" className="gap-2"><Stethoscope className="w-3.5 h-3.5" /> Encounters</TabsTrigger>
          <TabsTrigger value="labs" className="gap-2"><FlaskConical className="w-3.5 h-3.5" /> Lab Results</TabsTrigger>
          <TabsTrigger value="imaging" className="gap-2"><ScanLine className="w-3.5 h-3.5" /> Imaging</TabsTrigger>
        </TabsList>

        <TabsContent value="encounters">
          {encounters.length === 0 ? <Empty label="No clinical encounters found." /> : (
            <div className="space-y-3">
              {encounters.sort((a,b)=>(b.encounter_date||'').localeCompare(a.encounter_date||'')).map(e => (
                <Card key={e.id} className="p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{e.encounter_date ? format(parseISO(e.encounter_date), 'MMM d, yyyy') : '—'}</span>
                        <StatusBadge status={e.status} />
                      </div>
                      {e.chief_complaint && <p className="text-sm"><span className="text-muted-foreground">Complaint:</span> {e.chief_complaint}</p>}
                      {e.diagnosis && <p className="text-sm font-medium text-blue-700">Dx: {e.diagnosis}</p>}
                      {e.treatment_plan && <p className="text-sm text-muted-foreground">Plan: {e.treatment_plan}</p>}
                      {e.clinician && <p className="text-xs text-muted-foreground">Dr. {e.clinician}</p>}
                    </div>
                    <Button size="sm" variant="outline" className="gap-1 text-xs flex-shrink-0"
                      onClick={() => downloadReport(`Encounter_${e.encounter_date}`, [
                        `Patient: ${patientName}`, `Date: ${e.encounter_date}`, `Clinician: ${e.clinician || '—'}`,
                        `Chief Complaint: ${e.chief_complaint || '—'}`, `Diagnosis: ${e.diagnosis || '—'}`,
                        `Treatment Plan: ${e.treatment_plan || '—'}`, `Status: ${e.status}`
                      ])}>
                      <Download className="w-3 h-3" /> Download
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="labs">
          {labs.length === 0 ? <Empty label="No lab results found." /> : (
            <div className="space-y-3">
              {labs.sort((a,b)=>(b.order_date||'').localeCompare(a.order_date||'')).map(l => (
                <Card key={l.id} className="p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{l.test_name}</span>
                        <StatusBadge status={l.status} />
                        {l.priority !== 'routine' && <Badge className="text-xs bg-amber-100 text-amber-700">{l.priority}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{l.order_date ? format(parseISO(l.order_date), 'MMM d, yyyy') : '—'}</p>
                      {l.results && (
                        <div className="bg-muted/30 rounded-lg p-2 text-sm mt-1">
                          <span className="text-muted-foreground text-xs">Result: </span>{l.results}
                          {l.normal_range && <span className="text-xs text-muted-foreground ml-2">(Ref: {l.normal_range})</span>}
                        </div>
                      )}
                    </div>
                    {l.status === 'completed' && (
                      <Button size="sm" variant="outline" className="gap-1 text-xs flex-shrink-0"
                        onClick={() => downloadReport(`Lab_${l.test_name}_${l.order_date}`, [
                          `Patient: ${patientName}`, `Test: ${l.test_name}`, `Date: ${l.order_date}`,
                          `Result: ${l.results || 'Pending'}`, `Normal Range: ${l.normal_range || '—'}`,
                          `Status: ${l.status}`, `Ordered by: Dr. ${l.ordered_by || '—'}`
                        ])}>
                        <Download className="w-3 h-3" /> Download
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="imaging">
          {imaging.length === 0 ? <Empty label="No imaging orders found." /> : (
            <div className="space-y-3">
              {imaging.sort((a,b)=>(b.order_date||'').localeCompare(a.order_date||'')).map(img => (
                <Card key={img.id} className="p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm capitalize">{(img.imaging_type||'').replace(/_/g,' ')} — {img.body_part}</span>
                        <StatusBadge status={img.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">{img.order_date ? format(parseISO(img.order_date), 'MMM d, yyyy') : '—'}</p>
                      {img.findings && (
                        <div className="bg-muted/30 rounded-lg p-2 text-sm mt-1">
                          <span className="text-muted-foreground text-xs">Findings: </span>{img.findings}
                        </div>
                      )}
                    </div>
                    {img.status === 'completed' && (
                      <Button size="sm" variant="outline" className="gap-1 text-xs flex-shrink-0"
                        onClick={() => downloadReport(`Imaging_${img.imaging_type}_${img.order_date}`, [
                          `Patient: ${patientName}`, `Type: ${img.imaging_type}`, `Body Part: ${img.body_part}`,
                          `Date: ${img.order_date}`, `Findings: ${img.findings || 'Pending'}`, `Status: ${img.status}`,
                          `Ordered by: Dr. ${img.ordered_by || '—'}`
                        ])}>
                        <Download className="w-3 h-3" /> Download
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Empty({ label }) {
  return <p className="text-sm text-muted-foreground text-center py-8 bg-muted/20 rounded-xl">{label}</p>;
}