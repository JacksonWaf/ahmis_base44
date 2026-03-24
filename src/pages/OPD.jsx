import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Search, Plus, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NewEncounterDialog from '@/components/opd/NewEncounterDialog';
import EncounterWorkspace from '@/components/opd/EncounterWorkspace';
import { useFacility } from '@/lib/FacilityContext';

export default function OPD() {
  const [newOpen, setNewOpen] = useState(false);
  const [activeEncounter, setActiveEncounter] = useState(null);
  const [search, setSearch] = useState('');
  const qc = useQueryClient();
  const { facilityId } = useFacility();

  const { data: encounters = [], isLoading } = useQuery({
    queryKey: ['encounters', facilityId],
    queryFn: () => base44.entities.ClinicalEncounter.filter({ facility_id: facilityId }, '-created_date'),
    enabled: !!facilityId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ClinicalEncounter.create({ ...data, facility_id: facilityId }),
    onSuccess: (enc) => {
      qc.invalidateQueries({ queryKey: ['encounters'] });
      setNewOpen(false);
      setActiveEncounter(enc);
    },
  });

  const filtered = encounters.filter(e =>
    `${e.patient_name} ${e.clinician}`.toLowerCase().includes(search.toLowerCase())
  );

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayCount = encounters.filter(e => e.encounter_date === today).length;
  const openCount = encounters.filter(e => e.status === 'open' || e.status === 'in_progress').length;

  if (activeEncounter) {
    return (
      <EncounterWorkspace
        encounter={activeEncounter}
        onClose={() => setActiveEncounter(null)}
        onRefresh={() => qc.invalidateQueries({ queryKey: ['encounters'] })}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="OPD — Outpatient Department"
        subtitle="Clinical consultations and patient workflow"
        actionLabel="New Encounter"
        onAction={() => setNewOpen(true)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 border-0 shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Today's Encounters</p>
          <p className="text-2xl font-bold mt-2">{todayCount}</p>
        </Card>
        <Card className="p-5 border-0 shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Open / In Progress</p>
          <p className="text-2xl font-bold mt-2 text-amber-600">{openCount}</p>
        </Card>
        <Card className="p-5 border-0 shadow-sm">
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total Encounters</p>
          <p className="text-2xl font-bold mt-2">{encounters.length}</p>
        </Card>
      </div>

      <div className="mb-4 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by patient or clinician..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="p-4 border-0 shadow-sm animate-pulse">
              <div className="h-4 bg-muted rounded w-48 mb-2" />
              <div className="h-3 bg-muted rounded w-64" />
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <Card className="p-12 border-0 shadow-sm text-center text-muted-foreground">
            No encounters found. Start a new encounter.
          </Card>
        ) : (
          filtered.map(enc => (
            <EncounterCard key={enc.id} encounter={enc} onOpen={() => setActiveEncounter(enc)} />
          ))
        )}
      </div>

      <NewEncounterDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        onSubmit={(d) => createMutation.mutate(d)}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}

function EncounterCard({ encounter, onOpen }) {
  const labCount = encounter.lab_orders?.length || 0;
  const imgCount = encounter.imaging_orders?.length || 0;
  const rxCount = encounter.prescription_ids?.length || 0;

  return (
    <Card className="p-4 border-0 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-primary">{encounter.patient_name?.[0]}</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{encounter.patient_name}</p>
            <p className="text-xs text-muted-foreground">
              {encounter.encounter_date} {encounter.encounter_time && `• ${encounter.encounter_time}`}
              {encounter.clinician && ` • ${encounter.clinician}`}
            </p>
            {encounter.chief_complaint && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">CC: {encounter.chief_complaint}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {labCount > 0 && <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">🧪 {labCount} lab</Badge>}
          {imgCount > 0 && <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">🩻 {imgCount} img</Badge>}
          {rxCount > 0 && <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">💊 {rxCount} rx</Badge>}
          {encounter.admitted && <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">🏥 Admitted</Badge>}
          <StatusBadge status={encounter.status} />
          <Button size="sm" variant="outline" onClick={onOpen} className="gap-1">
            <Eye className="w-3 h-3" /> Open
          </Button>
        </div>
      </div>
    </Card>
  );
}